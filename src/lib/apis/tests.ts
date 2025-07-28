import { collection, doc, getDoc, getDocs, limit as firestoreLimit, orderBy, Query, query, startAfter, onSnapshot, where, Timestamp, DocumentData, updateDoc, writeBatch, addDoc } from "firebase/firestore";
import { auth, db, rtdb } from "../firebase/firebase";
import { QuestionWithTimer, QuestionOrComprehensiveWithTimer, ComprehensiveQuestionWithTimer } from "./questions";
import { ComprehensiveQuestion, getComprehensiveQuestionById } from "./comprehensive-questions";
import { getQuestionById } from "./questions";
import { get, ref, set, update } from "firebase/database";
import {
    ApiResponse,
    safeApiCall,
    getDocumentById,
    getPaginatedCollection,
    transformers,
    validateRequiredFields,
    timestampToDate
} from "./base";
import { getCachedTestResult, cacheTestResult } from "../utils/cache-helpers";

// Import types and utilities from modular files
import type {
    OrderedQuestion,
    Test,
    LiveTest,
    AssessmentTest,
    ChallengeTest,
    QuestionAnswer,
    ComprehensiveQuestionAnswer,
    BasicTestResult,
    TestSubmission,
    LiveExamTestAnswers,
    TestAnswers,
    SendAnswerProps,
    TestType,
    TestResultType,
    TestVariant,
    EvaluationStatus,
    CategoryScore,
    QuestionwiseDetail
} from "./test-types";

import {
    transformTest,
    transformLiveTest,
    transformAssessmentTest,
    transformChallengeTest
} from "./test-transformers";

// Re-export types for backward compatibility
export type {
    OrderedQuestion,
    Test,
    LiveTest,
    AssessmentTest,
    ChallengeTest,
    QuestionAnswer,
    ComprehensiveQuestionAnswer,
    BasicTestResult,
    LiveExamTestAnswers,
    TestAnswers,
    SendAnswerProps,
    TestType,
    TestResultType,
    TestVariant,
    EvaluationStatus,
    CategoryScore,
    QuestionwiseDetail
} from "./test-types";

// Re-export transformers
export {
    transformTest,
    transformLiveTest,
    transformAssessmentTest,
    transformChallengeTest
} from "./test-transformers";

// Re-export utilities - only used functions
// Note: Other utility functions are available in test-utils.ts
// and can be imported directly when needed

// ============================================================================
// TEST RESULT INTERFACES BY TYPE
// ============================================================================

export interface PracticeTestResult extends BasicTestResult {
    type: 'practice';
    // Practice tests are automatically evaluated
    autoEvaluated: boolean;
    evaluationCompletedAt: Date;
    questionwiseDetails: Array<{
        questionId: string;
        correct: boolean;
        timeTaken: number;
        categoryName: string;
    }>;
}

export interface LiveTestResult extends BasicTestResult {
    type: 'live';
    // Live tests require manual evaluation
    evaluated: boolean;
    evaluatedAt?: Date;
    evaluatedBy?: string;
    rank?: number;
    percentile?: number;
    questionwiseDetails: Array<{
        questionId: string;
        correct: boolean;
        timeTaken: number;
        categoryName: string;
    }>;
}

export interface AssessmentTestResult extends BasicTestResult {
    type: 'assessment';
    // Assessment tests require manual evaluation
    evaluated: boolean;
    evaluatedAt?: Date;
    evaluatedBy?: string;
    feedback?: string;
    passed?: boolean;
    minimumScore?: number;
    questionwiseDetails: Array<{
        questionId: string;
        correct: boolean;
        timeTaken: number;
        categoryName: string;
    }>;
}

export interface ChallengeTestResult extends BasicTestResult {
    type: 'challenge';
    // Challenge tests are automatically evaluated
    autoEvaluated: boolean;
    evaluationCompletedAt: Date;
    challengeStatus: 'completed' | 'won' | 'lost' | 'draw';
    opponentUserId?: string;
    opponentScore?: number;
    questionwiseDetails: Array<{
        questionId: string;
        correct: boolean;
        timeTaken: number;
        categoryName: string;
    }>;
}

// ============================================================================
// SUBMISSION INTERFACES
// ============================================================================

// TestSubmission interface is imported from test-types.ts

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Creates a new test in the database.
 */
export async function createTest(
    testType: 'assessment' | 'live' | 'practice' | 'challenge',
    testData: Partial<Test & { startsAt?: Date, endsAt?: Date, invitedUser?: string }>
): Promise<ApiResponse<string>> {
    return safeApiCall(async () => {
        const { title, time, orderedQuestions, category, subCategory } = testData;
        validateRequiredFields({ title, time, orderedQuestions }, ['title', 'time', 'orderedQuestions'], 'Test Creation');

        if (!orderedQuestions || orderedQuestions.length === 0) {
            throw new Error('A test must have at least one question.');
        }

        const collectionName = `${testType}-tests`;
        
        const dataToSave: any = {
            title,
            time,
            orderedQuestions,
            createdAt: Timestamp.now(),
            evaluated: false,
        };

        // Add optional category and subcategory filters
        if (category) {
            dataToSave.category = category;
        }
        if (subCategory) {
            dataToSave.subCategory = subCategory;
        }

        if (testType === 'live') {
            validateRequiredFields(testData, ['startsAt', 'endsAt'], 'Live Test');
            dataToSave.startsAt = Timestamp.fromDate(testData.startsAt!);
            dataToSave.endsAt = Timestamp.fromDate(testData.endsAt!);
        }
        
        if (testType === 'challenge') {
            validateRequiredFields(testData, ['invitedUser'], 'Challenge Test');
            dataToSave.invitedUser = testData.invitedUser;
            dataToSave.status = 'pending';
        }

        const testCollectionRef = collection(db, collectionName);
        const docRef = await addDoc(testCollectionRef, dataToSave);
        
        return docRef.id;
    }, `Failed to create ${testType} test`);
}

/**
 * Get live tests with pagination and error handling
 */
export async function getLiveTests(
    prevTests: LiveTest[] = [],
    limitToFetch: number = 3
): Promise<ApiResponse<LiveTest[]>> {
    return getPaginatedCollection('live-tests', transformLiveTest, {
        limitToFetch,
        lastItem: prevTests.length > 0 ? prevTests[prevTests.length - 1].createdAt : null,
        orderByField: 'startsAt',
        orderDirection: 'desc'
    });
}

/**
 * Get practice tests with pagination and error handling
 */
export async function getPracticeTests(
    prevTests: Test[] = [],
    limitToFetch: number = 3
): Promise<ApiResponse<Test[]>> {
    return getPaginatedCollection('practice-tests', transformTest, {
        limitToFetch,
        lastItem: prevTests.length > 0 ? prevTests[prevTests.length - 1].createdAt : null,
        orderByField: 'createdAt',
        orderDirection: 'desc'
    });
}

/**
 * Get all practice tests with incremental updates based on createdAt
 */
export async function getAllPracticeTests(lastCreatedAt?: Date): Promise<ApiResponse<Test[]>> {
    return safeApiCall(async () => {
        // Build query: fetch only tests created after lastCreatedAt if provided
        let testsQuery;
        
        if (lastCreatedAt) {
            // Filter by timestamp only
            testsQuery = query(
                collection(db, "practice-tests"),
                where("createdAt", ">", Timestamp.fromDate(lastCreatedAt)),
                orderBy("createdAt", "desc")
            );
        } else {
            // No filters - fetch all tests
            testsQuery = query(
                collection(db, "practice-tests"),
                orderBy("createdAt", "desc")
            );
        }

        const snapshot = await getDocs(testsQuery);
        const tests = snapshot.docs.map(doc =>
            transformTest(doc.data(), doc.id)
        );

        return tests;
    }, 'Failed to get all practice tests');
}

/**
 * Get assessment tests with pagination and error handling
 */
export async function getAssessmentTests(
    prevTests: AssessmentTest[] = [],
    limitToFetch: number = 2
): Promise<ApiResponse<AssessmentTest[]>> {
    return getPaginatedCollection('assessment-tests', transformAssessmentTest, {
        limitToFetch,
        lastItem: prevTests.length > 0 ? prevTests[prevTests.length - 1].createdAt : null,
    });
}

/**
 * Get test by ID functions
 */
export async function getPracticeTestById(id: string): Promise<ApiResponse<Test>> {
    return getDocumentById('practice-tests', id, transformTest);
}

export async function getChallengeTestById(id: string): Promise<ApiResponse<ChallengeTest>> {
    return getDocumentById('challenge-tests', id, transformChallengeTest);
}

export async function getLiveTestById(id: string): Promise<ApiResponse<LiveTest>> {
    return getDocumentById('live-tests', id, transformLiveTest);
}

export async function getAssessmentTestById(id: string): Promise<ApiResponse<AssessmentTest>> {
    return getDocumentById('assessment-tests', id, transformAssessmentTest);
}

/**
 * Submit a test for evaluation - CLIENT-SAFE VERSION
 * This version doesn't include automatic evaluation to avoid firebase-admin imports
 */
export async function submitTest(
    testId: string,
    testType: 'practice' | 'live' | 'assessment' | 'challenge',
    answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>,
    timeTaken: number
): Promise<ApiResponse<string>> {
    return safeApiCall(async () => {
        if (!auth.currentUser?.uid) {
            throw new Error('User not authenticated');
        }

        const startTime = new Date(Date.now() - timeTaken);
        const endTime = new Date();
        
        const submission: TestSubmission = {
            testId,
            userId: auth.currentUser.uid,
            testType,
            submittedAt: endTime,
            answers,
            startTime,
            endTime,
            totalTimeTaken: timeTaken,
            status: 'submitted'
        };

        // Store submission and get document reference
        const collectionName = getCollectionName(testType, auth.currentUser.uid);
        const submissionRef = collection(db, collectionName);
        const docRef = await addDoc(submissionRef, {
            ...submission,
            submittedAt: Timestamp.fromDate(submission.submittedAt)
        });

        // Note: Automatic evaluation is handled by server-side functions
        // For practice and challenge tests, evaluation should be triggered via API routes

        return docRef.id;
    }, `Failed to submit ${testType} test`);
}

/**
 * Process answers from storage to maintain consistency with flattened structure
 */
function processAnswersFromStorage(storedAnswers: Record<string, any>): any[] {
    const processedAnswers: any[] = [];
    
    Object.entries(storedAnswers).forEach(([id, answer]) => {
        if (answer.type === 'comprehensive') {
            // For comprehensive questions, we need to flatten them back to individual answers
            // This is for consistency with the flattened structure expected by the UI
            if (answer.subQuestionAnswers) {
                Object.entries(answer.subQuestionAnswers).forEach(([subId, subAnswer]: [string, any]) => {
                    processedAnswers.push({
                        id: subId,
                        selected: subAnswer.selected,
                        timeTaken: subAnswer.timeTaken,
                        type: 'comprehensive',
                        parentId: id // Maintain the parent relationship
                    });
                });
            }
        } else {
            // For regular questions, just add them as-is
            processedAnswers.push({
                id,
                selected: answer.selected,
                timeTaken: answer.timeTaken,
                timeSelected: answer.timeSelected,
                type: 'question'
            });
        }
    });
    
    return processedAnswers;
}

/**
 * Process questions for storage, handling both flattened and comprehensive structures
 */
function processQuestionsForStorage(questions: QuestionOrComprehensiveWithTimer[]): Record<string, any> {
    const processedAnswers: Record<string, any> = {};
    const comprehensiveGroups: Record<string, any> = {};

    questions.forEach((question) => {
        // Check if this is a flattened sub-question from a comprehensive question
        if ('parentId' in question && (question as any).parentId) {
            const parentId = (question as any).parentId;
            const flattenedQuestion = question as QuestionWithTimer;
            
            // Initialize comprehensive group if it doesn't exist
            if (!comprehensiveGroups[parentId]) {
                comprehensiveGroups[parentId] = {
                    id: parentId,
                    timeTaken: 0,
                    subQuestionAnswers: {},
                    type: 'comprehensive'
                };
            }
            
            // Add sub-question answer
            comprehensiveGroups[parentId].subQuestionAnswers[flattenedQuestion.id!] = {
                selected: flattenedQuestion.selected,
                timeTaken: flattenedQuestion.timeSelected || flattenedQuestion.time
            };
            
            // Accumulate total time
            comprehensiveGroups[parentId].timeTaken += flattenedQuestion.timeSelected || flattenedQuestion.time;
        } else if (question.type === 'comprehensive') {
            // This is a comprehensive question (not flattened)
            const compQuestion = question as ComprehensiveQuestionWithTimer;
            processedAnswers[compQuestion.id] = {
                id: compQuestion.id,
                timeTaken: compQuestion.time,
                subQuestionAnswers: compQuestion.subQuestionAnswers || {},
                type: 'comprehensive'
            };
        } else {
            // This is a regular question
            const regularQuestion = question as QuestionWithTimer;
            processedAnswers[regularQuestion.id!] = {
                id: regularQuestion.id!,
                selected: regularQuestion.selected,
                timeTaken: regularQuestion.time,
                timeSelected: regularQuestion.timeSelected,
                type: 'question'
            };
        }
    });

    // Add comprehensive groups to processed answers
    Object.values(comprehensiveGroups).forEach((comp) => {
        processedAnswers[comp.id] = comp;
    });

    return processedAnswers;
}

/**
 * Send test answers to database with comprehensive error handling
 */
export async function sendTestAnswersToDatabase({
    testId,
    questionsToSync,
    previousQuestions,
    uid,
    lockTest = false,
    type,
    startingTime,
    tabSwitchCount
}: SendAnswerProps): Promise<ApiResponse<void>> {
    return safeApiCall(async () => {
        validateRequiredFields({ testId, uid, type }, ['testId', 'uid', 'type'], 'Send test answers');

        const data: {
            updatedAt?: string;
            locked?: boolean;
            startedAt?: Date;
            timeTaken?: number;
            tabSwitchCount?: number;
        } = {};

        if (startingTime) {
            data.startedAt = startingTime;
        }

        if (tabSwitchCount !== undefined) {
            data.tabSwitchCount = tabSwitchCount;
        }

        if (lockTest) {
            data.locked = true;
            
            // Calculate total time taken when test is being locked (submitted)
            let totalTimeTaken = 0;
            questionsToSync.forEach(question => {
                if (question.type === 'comprehensive') {
                    totalTimeTaken += question.time || 0;
                } else {
                    totalTimeTaken += question.time || 0;
                }
            });
            
            data.timeTaken = totalTimeTaken;
            console.log(`[SEND_TEST_ANSWERS] Total time taken: ${totalTimeTaken} seconds for test ${testId}, user ${uid}`);
        }

        data.updatedAt = new Date().toISOString();

        const rtdbRef = ref(rtdb, `${type}-tests/${testId}/${uid}`);
        
        // Process questions to maintain structure consistency
        const processedAnswers = processQuestionsForStorage(questionsToSync);
        
        const updateData = {
            ...data,
            answers: processedAnswers
        };

        await update(rtdbRef, updateData);
    }, 'Failed to send test answers');
}

/**
 * Get user test results
 */
export async function getUserPracticeTestResult(id: string): Promise<ApiResponse<any>> {
    return safeApiCall(async () => {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        // Check cache first
        const cachedResult = getCachedTestResult('practice', id, auth.currentUser.uid);
        if (cachedResult) {
            return cachedResult;
        }

        const resultsRef = collection(db, `users/${auth.currentUser.uid}/test-results`);
        const q = query(resultsRef, where('testId', '==', id));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            throw new Error('Test result not found');
        }

        const resultDoc = snapshot.docs[0];
        const data = resultDoc.data();
        
        const result = {
            id: resultDoc.id,
            ...data,
            submittedAt: timestampToDate(data.submittedAt),
        };

        // Cache the result
        cacheTestResult('practice', id, auth.currentUser.uid, result);
        
        return result;
    }, 'Failed to get practice test result');
}

export async function getUserLiveTestResult(id: string): Promise<ApiResponse<any>> {
    return safeApiCall(async () => {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        // Check cache first
        const cachedResult = getCachedTestResult('live', id, auth.currentUser.uid);
        if (cachedResult) {
            return cachedResult;
        }

        const resultsRef = collection(db, 'live-test-user-results');
        const q = query(resultsRef, where('testId', '==', id), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            throw new Error('Test result not found');
        }

        const resultDoc = snapshot.docs[0];
        const data = resultDoc.data();
        
        const result = {
            id: resultDoc.id,
            ...data,
            submittedAt: timestampToDate(data.submittedAt),
        };

        // Cache the result
        cacheTestResult('live', id, auth.currentUser.uid, result);
        
        return result;
    }, 'Failed to get live test result');
}

export async function getUserAssessmentTestResult(id: string): Promise<ApiResponse<any>> {
    return safeApiCall(async () => {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        // Check cache first
        const cachedResult = getCachedTestResult('assessment', id, auth.currentUser.uid);
        if (cachedResult) {
            return cachedResult;
        }

        const resultsRef = collection(db, 'assessment-test-user-results');
        const q = query(resultsRef, where('testId', '==', id), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            throw new Error('Test result not found');
        }

        const resultDoc = snapshot.docs[0];
        const data = resultDoc.data();

        const result = {
            id: resultDoc.id,
            ...data,
            submittedAt: timestampToDate(data.submittedAt),
        };

        // Cache the result
        cacheTestResult('assessment', id, auth.currentUser.uid, result);

        return result;
    }, 'Failed to get assessment test result');
}

/**
 * Real-time subscriptions
 */
export function subscribeToLiveTests(
    onUpdate: (tests: LiveTest[]) => void,
    evaluatedValue: any = true
) {
    const unsubscribe = onSnapshot(
        query(collection(db, "live-tests"), where("evaluated", "!=", evaluatedValue)),
        (snapshot) => {
            const newTests = snapshot.docs.map((doc) => (transformLiveTest(doc.data(), doc.id))) as LiveTest[];
            onUpdate(newTests);
        }
    );
    return unsubscribe;
}

export function subscribeToAssessmentTests(
    onUpdate: (tests: AssessmentTest[]) => void,
    evaluatedValue: any = true
) {
    const unsubscribe = onSnapshot(
        query(collection(db, "assessment-tests"), where("evaluated", "!=", evaluatedValue)),
        (snapshot) => {
            const newTests = snapshot.docs.map((doc) => (transformAssessmentTest(doc.data(), doc.id))) as AssessmentTest[];
            onUpdate(newTests);
        }
    );
    return unsubscribe;
}

export function subscribeToLiveTestResults(
    userId: string,
    onUpdate: (results: any[]) => void,
    onError: (error: Error) => void
): () => void {
    const resultsRef = collection(db, 'live-test-user-results');
    const q = query(resultsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: timestampToDate(doc.data().submittedAt),
        }));
        onUpdate(results);
    }, (err) => {
        console.error("Error in live test results subscription:", err);
        onError(new Error("Failed to subscribe to live test results"));
    });

    return unsubscribe;
}

export function subscribeToAssessmentTestResults(
    userId: string,
    onUpdate: (results: any[]) => void,
    onError: (error: Error) => void
): () => void {
    const resultsRef = collection(db, 'assessment-test-user-results');
    const q = query(resultsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: timestampToDate(doc.data().submittedAt),
        }));
        onUpdate(results);
    }, (err) => {
        console.error("Error in assessment test results subscription:", err);
        onError(new Error("Failed to subscribe to assessment test results"));
    });

    return unsubscribe;
}

export function subscribeToPracticeTestResults(
    userId: string,
    onUpdate: (results: any[]) => void,
    onError: (error: Error) => void
): () => void {
    const resultsRef = collection(db, `users/${userId}/test-results`);
    const q = query(resultsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: timestampToDate(doc.data().submittedAt),
        }));
        onUpdate(results);
    }, (err) => {
        console.error("Error in practice test results subscription:", err);
        onError(new Error("Failed to subscribe to practice test results"));
    });

    return unsubscribe;
}

// ============================================================================
// EVALUATION FUNCTIONS (DYNAMICALLY IMPORTED FROM test-evaluation.ts)
// ============================================================================

// Note: Evaluation functions are dynamically imported to avoid loading
// Node.js-specific modules (like http2) in the browser environment.
// Use dynamic imports when you need these functions:
//
// const { evaluateTestAutomatically } = await import('./test-evaluation');
//
// Available functions:
// - evaluateTestAutomatically
// - evaluateTestManually
// - evaluateTestsInBatch
// - evaluateChallengeTestSubmission
// - evaluateTestManuallyAdmin
// - evaluateUserAssessmentTestAdmin
// - evaluateChallengeTestSubmissionAdmin

// ============================================================================
// QUESTION FETCHING UTILITIES
// ============================================================================

/**
 * Fetch questions for a test, handling both regular and comprehensive questions
 */
export async function fetchTestQuestions(orderedQuestions: OrderedQuestion[]): Promise<ApiResponse<QuestionOrComprehensiveWithTimer[]>> {
    return safeApiCall(async () => {
        const questionPromises = orderedQuestions.map(async (orderedQuestion) => {
            if (orderedQuestion.type === 'comprehensive') {
                const response = await getComprehensiveQuestionById(orderedQuestion.id);
                if (!response.success || !response.data) {
                    throw new Error(`Failed to load comprehensive question: ${response.error || 'Unknown error'}`);
                }
                
                const comprehensiveQuestion = response.data;
                return {
                    id: orderedQuestion.id,
                    time: 0,
                    subQuestionAnswers: {},
                    type: 'comprehensive' as const,
                    comprehensiveData: comprehensiveQuestion
                };
            } else {
                const response = await getQuestionById(orderedQuestion.id);
                if (!response.success || !response.data) {
                    throw new Error(`Failed to load question: ${response.error || 'Unknown error'}`);
                }
                
                return {
                    ...response.data,
                    time: 0,
                    timeSelected: null,
                    selected: null,
                    type: 'question' as const
                };
            }
        });

        const results = await Promise.all(questionPromises);
        return results;
    }, 'Failed to fetch test questions');
}

/**
 * Get test answers from RTDB with error handling
 */
export async function getTestAnswersFromRTDB(testId: string, userId: string, testType: string): Promise<ApiResponse<any>> {
    return safeApiCall(async () => {
        const rtdbRef = ref(rtdb, `${testType}-tests/${testId}/${userId}`);
        const snapshot = await get(rtdbRef);
        
        if (!snapshot.exists()) {
            return {
                answers: null,
                startedAt: null,
                locked: false,
                updatedAt: null
            };
        }
        
        const data = snapshot.val();
        
        // Process answers to maintain consistency with flattened structure
        const processedAnswers = data.answers ? processAnswersFromStorage(data.answers) : null;
        
        return {
            answers: processedAnswers,
            startedAt: data.startedAt ? new Date(data.startedAt) : null,
            locked: data.locked || false,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : null
        };
    }, 'Failed to get test answers from RTDB');
}

/**
 * Convert flattened questions back to comprehensive answer format for submission
 */
export function convertFlattenedAnswersToComprehensive(
    flattenedQuestions: QuestionWithTimer[]
): Record<string, QuestionAnswer | ComprehensiveQuestionAnswer> {
    const answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer> = {};
    const comprehensiveGroups: Record<string, any> = {};

    flattenedQuestions.forEach((question) => {
        if ((question as any).parentId) {
            // This is a flattened sub-question from a comprehensive question
            const parentId = (question as any).parentId;
            if (!comprehensiveGroups[parentId]) {
                comprehensiveGroups[parentId] = {
                    id: parentId,
                    timeTaken: 0,
                    subQuestionAnswers: {},
                    type: 'comprehensive' as const
                };
            }
            
            // Add sub-question answer
            comprehensiveGroups[parentId].subQuestionAnswers[question.id!] = {
                selected: question.selected,
                timeTaken: question.timeSelected || question.time
            };
            
            // Accumulate total time
            comprehensiveGroups[parentId].timeTaken += question.timeSelected || question.time;
        } else {
            // This is a regular question
            answers[question.id!] = {
                id: question.id!,
                timeTaken: question.timeSelected || question.time,
                selected: question.selected,
                type: 'question' as const
            };
        }
    });

    // Add comprehensive answers
    Object.values(comprehensiveGroups).forEach((comp) => {
        answers[comp.id] = comp;
    });

    return answers;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get collection name based on test type and user ID
 */
function getCollectionName(testType: string, userId: string): string {
    if (testType === 'practice') {
        return `users/${userId}/test-results`;
    }
    return `${testType}-test-user-results`;
}

// ============================================================================
// END OF FILE
// ============================================================================
