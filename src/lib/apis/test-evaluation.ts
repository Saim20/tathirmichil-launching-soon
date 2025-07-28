import { adminDb, adminFirestore } from "../firebase/firebase-admin";
import { TestAnswers, OrderedQuestion, QuestionAnswer, ComprehensiveQuestionAnswer, TestSubmission } from "./test-types";
import { getComprehensiveQuestionById } from "./comprehensive-questions";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { Timestamp as AdminTimestamp, FieldValue } from "firebase-admin/firestore";
import { ApiResponse, safeApiCall } from "./base";
import { generateLeaderboardOnEvaluation, QuestionStats } from "./live-test-leaderboard";
import { updateUserCoinsAdmin } from "./coin-rtdb-admin";

// Re-export types for backward compatibility
export type { TestAnswers } from "./test-types";

// ============================================================================
// EVALUATION INTERFACES
// ============================================================================


interface EvaluationResult {
    score: number;
    totalQuestions: number;
    attempted: number;
    categoryUpdates: Array<{
        category: string;
        score: number;
        isCorrect: boolean;
        timeTaken?: number;
        wasAttempted?: boolean;
    }>;
}

// ============================================================================
// AUTOMATIC EVALUATION FUNCTIONS
// ============================================================================

/**
 * Automatically evaluate practice and challenge tests
 */
export async function evaluateTestAutomaticallyAdmin(
    testId: string,
    testType: 'practice' | 'challenge',
    submission: TestSubmission
): Promise<ApiResponse<void>> {
    return safeApiCall(async () => {
        // Get the test to fetch correct answers using admin Firestore
        const testDoc = await adminFirestore.collection(`${testType}-tests`).doc(testId).get();
        if (!testDoc.exists) {
            throw new Error('Test not found');
        }

        const testData = testDoc.data();
        const orderedQuestions = testData?.orderedQuestions as OrderedQuestion[];

        let coins = 0;
        let totalScore = 0;
        let totalQuestions = 0;
        const categoryScores: Record<string, { score: number; totalQuestions: number; correctAnswers: number; time: number; attempted: number }> = {};

        // Evaluate all questions in parallel for better performance
        const evaluationPromises = orderedQuestions.map(async (orderedQuestion) => {
            const userAnswer = submission.answers[orderedQuestion.id];
            if (!userAnswer) return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };

            if (orderedQuestion.type === 'question') {
                return await evaluateRegularQuestion(orderedQuestion.id, userAnswer as QuestionAnswer);
            } else if (orderedQuestion.type === 'comprehensive') {
                return await evaluateComprehensiveQuestion(orderedQuestion.id, userAnswer as ComprehensiveQuestionAnswer);
            }
            return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
        });

        const evaluationResults = await Promise.all(evaluationPromises);

        // Aggregate results
        for (const result of evaluationResults) {
            totalScore += result.score;
            totalQuestions += result.totalQuestions;
            coins += result.attempted; // Award coins for attempted questions
            coins += (result.score + result.attempted * 0.25) / 1.25; // Award coins for correct answers

            // Update category scores
            for (const categoryUpdate of result.categoryUpdates) {
                updateCategoryScore(
                    categoryScores, 
                    categoryUpdate.category, 
                    categoryUpdate.score, 
                    categoryUpdate.isCorrect,
                    categoryUpdate.timeTaken || 0,
                    categoryUpdate.wasAttempted !== false
                );
            }
        }

        // Update the submission with evaluation results using admin Firestore
        if (testType === 'practice') {
            const userTestRef = adminFirestore.collection('users').doc(submission.userId).collection('test-results').doc(testId);
            
            // Clean answers to prevent undefined values
            const cleanedAnswers = cleanAnswersForFirestore(submission.answers);
            
            // Use set with merge to ensure the document is created if it doesn't exist
            await userTestRef.set({
                testId,
                userId: submission.userId,
                answers: cleanedAnswers,
                timeTaken: submission.totalTimeTaken,
                submittedAt: submission.submittedAt,
                totalScore,
                categoryScores,
                status: 'evaluated',
                autoEvaluated: true,
                evaluationCompletedAt: AdminTimestamp.now(),
                tabSwitchCount: submission.tabSwitchCount || 0,
            }, { merge: true });
        } else if (testType === 'challenge') {
            await adminFirestore.collection('challenge-tests').doc(testId).update({
                [`results.${submission.userId}.totalScore`]: totalScore,
                [`results.${submission.userId}.totalCorrect`]: Object.values(categoryScores).reduce((sum, cat) => sum + cat.correctAnswers, 0),
                [`results.${submission.userId}.totalQuestions`]: totalQuestions,
                [`results.${submission.userId}.categoryScores`]: categoryScores,
                [`results.${submission.userId}.status`]: 'evaluated',
                [`results.${submission.userId}.evaluatedAt`]: AdminTimestamp.now()
            });
        }
        
        // Update user stats for practice tests
        if (testType === 'practice') {
            try {
                // Calculate accuracy based on correct answers
                const totalCorrectAnswers = Object.values(categoryScores).reduce((sum, cat) => sum + cat.correctAnswers, 0);
                const accuracy = totalQuestions > 0 ? Number(((totalCorrectAnswers / totalQuestions) * 100).toFixed(2)) : 0;
                
                // Calculate confidence based on correct answers percentage
                const confidence = totalQuestions > 0 ? Number(((totalCorrectAnswers / totalQuestions) * 100).toFixed(2)) : 0;
                
                // Get current user data using admin Firestore
                const userDoc = await adminFirestore.collection('users').doc(submission.userId).get();
                const userData = userDoc.data() || {};
                const practiceTestsTaken = userData.practiceTestsTaken || 0;
                const totalTestsTaken = userData.totalTestsTaken || 0;
                const oldConfidence = userData.confidence || 0;
                const oldAccuracy = userData.accuracy || 0;

                // Calculate new averages
                const newConfidence = (totalTestsTaken * oldConfidence + confidence) / (totalTestsTaken + 1);
                const newAccuracy = (totalTestsTaken * oldAccuracy + accuracy) / (totalTestsTaken + 1);

                // Update user profile using admin Firestore
                await adminFirestore.collection('users').doc(submission.userId).update({
                    confidence: newConfidence,
                    accuracy: newAccuracy,
                    practiceTestsTaken: practiceTestsTaken + 1,
                    totalTestsTaken: totalTestsTaken + 1,
                    updatedAt: FieldValue.serverTimestamp(),
                });

            } catch (userUpdateError) {
                console.error('Error updating user stats for practice test:', userUpdateError);
                // Don't throw here - test submission already succeeded
            }
        }
        
        // Award coins to the user using admin function
        await awardCoinsAdmin(submission.userId, coins);
    }, 'Error in automatic evaluation');
}

/**
 * Evaluate a regular question
 */
export async function evaluateRegularQuestion(
    questionId: string,
    userAnswer: QuestionAnswer
): Promise<EvaluationResult> {

    const questionDoc = await getDoc(doc(db, 'questions', questionId));
    if (!questionDoc.exists()) {
        return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
    }

    const questionData = questionDoc.data();

    // Check if the user has actually attempted the question (selected an option)
    const isAttempted = userAnswer.selected !== null && userAnswer.selected !== undefined && userAnswer.selected >= 0;

    if (!isAttempted) {
        return {
            score: 0,
            totalQuestions: 1,
            attempted: 0,
            categoryUpdates: [{
                category: questionData.category,
                score: 0,
                isCorrect: false,
                timeTaken: userAnswer.timeTaken || 0,
                wasAttempted: false
            }]
        };
    }

    // Convert answer string to index if needed
    const correctAnswerIndex = typeof questionData.answer === 'string'
        ? questionData.options.indexOf(questionData.answer)
        : questionData.answer;

    const isCorrect = userAnswer.selected === correctAnswerIndex;
    // Implement negative marking: +1 for correct, -0.25 for wrong answers
    const score = isCorrect ? 1 : -0.25;

    return {
        score,
        totalQuestions: 1,
        attempted: 1,
        categoryUpdates: [{
            category: questionData.category,
            score,
            isCorrect,
            timeTaken: userAnswer.timeTaken || 0,
            wasAttempted: true
        }]
    };
}

/**
 * Evaluate a comprehensive question
 */
export async function evaluateComprehensiveQuestion(
    questionId: string,
    userAnswer: ComprehensiveQuestionAnswer
): Promise<EvaluationResult> {

    const comprehensiveQuestion = await getComprehensiveQuestionById(questionId);
    if (!comprehensiveQuestion.success || !comprehensiveQuestion.data) {
        return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
    }

    const questions = comprehensiveQuestion.data.questions;
    let totalScore = 0;
    let totalQuestions = questions.length;
    let attemptedQuestions = 0;
    const categoryUpdates: Array<{ category: string; score: number; isCorrect: boolean; timeTaken?: number; wasAttempted?: boolean }> = [];


    // Evaluate each sub-question
    for (const question of questions) {
        if (!question.id) {
            continue;
        }

        // Sub-question IDs in comprehensive questions are structured as: comprehensiveQuestionId_q_index
        const subAnswer = userAnswer.subQuestionAnswers[question.id];
        if (!subAnswer) {
            // Don't skip - count as unanswered but still part of total questions
            categoryUpdates.push({
                category: question.category,
                score: 0,
                isCorrect: false,
                timeTaken: 0,
                wasAttempted: false
            });
            continue;
        }

        // Check if the sub-question was actually attempted (selected an option)
        const subAttempted = subAnswer.selected !== null && subAnswer.selected !== undefined && subAnswer.selected >= 0;

        if (!subAttempted) {
            categoryUpdates.push({
                category: question.category,
                score: 0,
                isCorrect: false,
                timeTaken: subAnswer.timeTaken || 0,
                wasAttempted: false
            });
            continue;
        }

        attemptedQuestions++;

        // Convert answer string to index if needed
        const correctAnswerIndex = typeof question.answer === 'string'
            ? question.options.indexOf(question.answer)
            : question.answer;

        const isCorrect = subAnswer.selected === correctAnswerIndex;
        // Implement negative marking: +1 for correct, -0.25 for wrong answers
        const score = isCorrect ? 1 : -0.25;
        totalScore += score;

        categoryUpdates.push({
            category: question.category,
            score,
            isCorrect,
            timeTaken: subAnswer.timeTaken || 0,
            wasAttempted: true
        });
    }

    return {
        score: totalScore,
        totalQuestions,
        attempted: attemptedQuestions,
        categoryUpdates
    };
}

// ============================================================================
// ADMIN EVALUATION FUNCTIONS (FOR API ROUTES)
// ============================================================================

export async function evaluateUserAssessmentTestAdmin({
    testId,
    userId,
    test,
    timeTaken,
    tabSwitchCount,
    firestoreCollections,
}: {
    testId: string,
    userId: string,
    test: { orderedQuestions: OrderedQuestion[] },
    timeTaken: number,
    tabSwitchCount?: number,
    firestoreCollections: {
        test: string,
        userResults: string,
    },
}): Promise<{ success: boolean, message: string }> {
    try {
        console.log(`[EVALUATE][START] testId=${testId}, userId=${userId}`);

        // Get user's answers first
        const userResult = await getTestAnswersFromRTDBAdmin(testId, userId, 'assessment');
        if (!userResult || !userResult.answers) {
            console.warn(`[EVALUATE][NO_ANSWERS] testId=${testId}, userId=${userId}`);
            return { success: false, message: 'User answers not found' };
        }

        let totalScore = 0;
        let totalQuestions = 0;
        const categoryScores: Record<string, { score: number; totalQuestions: number; correctAnswers: number; time: number; attempted: number }> = {};

        // Evaluate all questions in parallel for better performance
        const evaluationPromises = test.orderedQuestions.map(async (orderedQuestion) => {
            const answers = userResult.answers as any;
            const userAnswer = answers?.[orderedQuestion.id];

            console.log(`[EVALUATE_ASSESSMENT] Processing question: ${orderedQuestion.id}, type: ${orderedQuestion.type}`);
            console.log(`[EVALUATE_ASSESSMENT] User answer found:`, userAnswer ? 'Yes' : 'No');

            if (!userAnswer) {
                console.log(`[EVALUATE_ASSESSMENT] No answer for questionId=${orderedQuestion.id}`);
                return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
            }

            if (orderedQuestion.type === 'question') {
                console.log(`[EVALUATE_ASSESSMENT] Evaluating regular question: ${orderedQuestion.id}`);
                return await evaluateRegularQuestion(orderedQuestion.id, userAnswer as QuestionAnswer);
            } else if (orderedQuestion.type === 'comprehensive') {
                console.log(`[EVALUATE_ASSESSMENT] Evaluating comprehensive question: ${orderedQuestion.id}`);
                return await evaluateComprehensiveQuestion(orderedQuestion.id, userAnswer as ComprehensiveQuestionAnswer);
            }
            return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
        });

        const evaluationResults = await Promise.all(evaluationPromises);

        // Aggregate results
        let totalAttempted = 0;
        for (const result of evaluationResults) {
            totalScore += result.score;
            totalQuestions += result.totalQuestions;
            totalAttempted += result.attempted;
            for (const categoryUpdate of result.categoryUpdates) {
                updateCategoryScore(
                    categoryScores, 
                    categoryUpdate.category, 
                    categoryUpdate.score, 
                    categoryUpdate.isCorrect,
                    categoryUpdate.timeTaken || 0,
                    categoryUpdate.wasAttempted !== false
                );
            }
        }

        console.log(`[EVALUATE][RESULTS] testId=${testId}, userId=${userId}, totalScore=${totalScore}, totalQuestions=${totalQuestions}, totalAttempted=${totalAttempted}`);

        // Calculate confidence and accuracy
        const confidence = totalQuestions > 0 ? Number(((totalAttempted / test.orderedQuestions.length) * 100).toFixed(2)) : 0;
        
        // Calculate accuracy based on correct answers, not total score (since we now have negative marking)
        const totalCorrectAnswers = Object.values(categoryScores).reduce((sum, cat) => sum + cat.correctAnswers, 0);
        const accuracy = totalAttempted > 0 ? Number(((totalCorrectAnswers / totalAttempted) * 100).toFixed(2)) : 0;

        // Get and update user stats using admin Firestore
        const userDoc = await adminFirestore.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};
        const totalTestsTaken = userData.totalTestsTaken || 0;
        const oldConfidence = userData.confidence || 0;
        const oldAccuracy = userData.accuracy || 0;

        const newConfidence = (totalTestsTaken * oldConfidence + confidence) / (totalTestsTaken + 1);
        const newAccuracy = (totalTestsTaken * oldAccuracy + accuracy) / (totalTestsTaken + 1);

        // Update user profile using admin Firestore
        await adminFirestore.collection('users').doc(userId).update({
            confidence: newConfidence,
            accuracy: newAccuracy,
            totalTestsTaken: totalTestsTaken + 1,
            isPassed: true,
            updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`[EVALUATE][USER_UPDATED] userId=${userId}, confidence=${newConfidence}, accuracy=${newAccuracy}, totalTestsTaken=${totalTestsTaken + 1}`);

        // Store user results using admin Firestore
        const cleanedAnswers = userResult.answers ? cleanAnswersForFirestore(userResult.answers as any) : {};
        await adminFirestore.collection(firestoreCollections.userResults).add({
            testId,
            userId,
            displayName: userData.displayName || '',
            email: userData.email || '',
            categoryScores,
            answers: cleanedAnswers,
            totalScore: totalScore, // This is the score with negative marking
            timeTaken,
            submittedAt: new Date(),
            confidence,
            accuracy,
            totalCorrect: totalCorrectAnswers, // This is the actual number of correct answers
            totalAttempted: totalAttempted, // Total questions attempted
            tabSwitchCount: tabSwitchCount || 0,
        });
        console.log(`[EVALUATE][RESULT_SAVED] testId=${testId}, userId=${userId}`);

        return { success: true, message: 'Test evaluated successfully' };
    } catch (error) {
        console.error(`[EVALUATE][ERROR] testId=${testId}, userId=${userId}`, error);
        return { success: false, message: 'Error evaluating test' };
    }
}

/**
 * Admin version of evaluateChallengeTestSubmission for API routes
 */
export async function evaluateChallengeTestSubmissionAdmin(
    testId: string,
    userId: string,
    submission: TestSubmission
): Promise<void> {
    try {
        // Get the test to fetch correct answers using admin Firestore
        const testDoc = await adminFirestore.collection('challenge-tests').doc(testId).get();
        if (!testDoc.exists) {
            throw new Error('Challenge test not found');
        }

        const testData = testDoc.data();
        const orderedQuestions = testData?.orderedQuestions as OrderedQuestion[];

        let totalScore = 0;
        let totalQuestions = 0;
        const categoryScores: Record<string, { score: number; totalQuestions: number; correctAnswers: number; time: number; attempted: number }> = {};

        // Evaluate all questions in parallel for better performance
        const evaluationPromises = orderedQuestions.map(async (orderedQuestion) => {
            const userAnswer = submission.answers[orderedQuestion.id];
            if (!userAnswer) return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };

            if (orderedQuestion.type === 'question') {
                return await evaluateRegularQuestion(orderedQuestion.id, userAnswer as QuestionAnswer);
            } else if (orderedQuestion.type === 'comprehensive') {
                return await evaluateComprehensiveQuestion(orderedQuestion.id, userAnswer as ComprehensiveQuestionAnswer);
            }
            return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
        });

        const evaluationResults = await Promise.all(evaluationPromises);

        // Aggregate results
        for (const result of evaluationResults) {
            totalScore += result.score;
            totalQuestions += result.totalQuestions;

            // Update category scores
            for (const categoryUpdate of result.categoryUpdates) {
                updateCategoryScore(
                    categoryScores, 
                    categoryUpdate.category, 
                    categoryUpdate.score, 
                    categoryUpdate.isCorrect,
                    categoryUpdate.timeTaken || 0,
                    categoryUpdate.wasAttempted !== false
                );
            }
        }

        // Update the challenge test document with evaluation results using admin Firestore
        // Note: No coins are awarded here. Winner gets 100 coins, loser gets -50 coins when challenge is completed
        const totalCorrectAnswers = Object.values(categoryScores).reduce((sum, cat) => sum + cat.correctAnswers, 0);
        await adminFirestore.collection('challenge-tests').doc(testId).update({
            [`results.${userId}.totalScore`]: totalScore,
            [`results.${userId}.totalCorrect`]: totalCorrectAnswers,
            [`results.${userId}.totalQuestions`]: totalQuestions,
            [`results.${userId}.categoryScores`]: categoryScores,
            [`results.${userId}.status`]: 'evaluated',
            [`results.${userId}.evaluatedAt`]: AdminTimestamp.now()
        });

    } catch (error) {
        console.error('Error in challenge test evaluation:', error);
        // Update the challenge test with error status using admin Firestore
        try {
            await adminFirestore.collection('challenge-tests').doc(testId).update({
                [`results.${userId}.status`]: 'failed',
                [`results.${userId}.evaluationError`]: (error as Error).message,
                [`results.${userId}.evaluationErrorAt`]: AdminTimestamp.now()
            });
        } catch (updateError) {
            console.error('Failed to update challenge test evaluation error:', updateError);
        }
    }
}

/**
 * Admin version of evaluateLiveTest for API routes
 * Evaluates all users who participated in a live test
 */
export async function evaluateLiveTestAdmin(
    testId: string,
    test: { orderedQuestions: OrderedQuestion[] }
): Promise<{ success: boolean, message: string, evaluatedUsers: number }> {
    try {

        // Get all user answers for this test from RTDB
        const allUserAnswers = await getAllAnswersFromRTDBAdmin(testId, 'live');
        if (!allUserAnswers || Object.keys(allUserAnswers).length === 0) {
            return { success: false, message: 'No user submissions found', evaluatedUsers: 0 };
        }

        const userIds = Object.keys(allUserAnswers);

        // Initialize question statistics tracking
        const questionStatsMap: Record<string, { attempts: number; correct: number }> = {};

        let evaluatedUsers = 0;
        const evaluationPromises = userIds.map(async (userId) => {
            try {
                const userTestData = allUserAnswers[userId];
                if (!userTestData || !userTestData.answers) {
                    console.warn(`[EVALUATE_LIVE][NO_ANSWERS] testId=${testId}, userId=${userId}`);
                    return;
                }

                // Process answers for evaluation
                const processedAnswers = processAnswersForEvaluation(userTestData.answers);

                let totalScore = 0;
                let totalQuestions = 0;
                let totalAttempted = 0;
                const categoryScores: Record<string, { score: number; totalQuestions: number; correctAnswers: number; time: number; attempted: number }> = {};

                // Evaluate all questions for this user
                const questionEvaluations = await Promise.all(
                    test.orderedQuestions.map(async (orderedQuestion) => {
                        const userAnswer = processedAnswers[orderedQuestion.id];


                        if (!userAnswer) {
                            return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
                        }

                        // Track question statistics for regular questions
                        if (orderedQuestion.type === 'question') {
                            const answer = userAnswer as QuestionAnswer;
                            if (answer.selected !== null && answer.selected !== undefined && answer.selected >= 0) {
                                // Initialize stats if not exists
                                if (!questionStatsMap[orderedQuestion.id]) {
                                    questionStatsMap[orderedQuestion.id] = { attempts: 0, correct: 0 };
                                }
                                questionStatsMap[orderedQuestion.id].attempts++;
                                
                                // We'll determine if it's correct during evaluation
                                const result = await evaluateRegularQuestion(orderedQuestion.id, answer);
                                if (result.score > 0) {
                                    questionStatsMap[orderedQuestion.id].correct++;
                                }
                                return result;
                            }
                            return await evaluateRegularQuestion(orderedQuestion.id, userAnswer as QuestionAnswer);
                        } else if (orderedQuestion.type === 'comprehensive') {
                            const answer = userAnswer as ComprehensiveQuestionAnswer;
                            // For comprehensive questions, we need to track each sub-question
                            const result = await evaluateComprehensiveQuestion(orderedQuestion.id, answer);
                            
                            // Get the comprehensive question to access sub-questions
                            try {
                                const comprehensiveQuestion = await getComprehensiveQuestionById(orderedQuestion.id);
                                if (comprehensiveQuestion.success && comprehensiveQuestion.data) {
                                    for (const subQuestion of comprehensiveQuestion.data.questions) {
                                        if (subQuestion.id) {
                                            const subAnswer = answer.subQuestionAnswers[subQuestion.id];
                                            if (subAnswer && subAnswer.selected !== null && subAnswer.selected !== undefined && subAnswer.selected >= 0) {
                                                // Initialize stats if not exists
                                                if (!questionStatsMap[subQuestion.id]) {
                                                    questionStatsMap[subQuestion.id] = { attempts: 0, correct: 0 };
                                                }
                                                questionStatsMap[subQuestion.id].attempts++;
                                                
                                                // Check if correct
                                                const correctAnswerIndex = typeof subQuestion.answer === 'string'
                                                    ? subQuestion.options.indexOf(subQuestion.answer)
                                                    : subQuestion.answer;
                                                
                                                if (subAnswer.selected === correctAnswerIndex) {
                                                    questionStatsMap[subQuestion.id].correct++;
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error(`[EVALUATE_LIVE] Error getting comprehensive question ${orderedQuestion.id}:`, error);
                            }
                            
                            return result;
                        }
                        return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
                    })
                );

                // Aggregate results for this user
                for (const result of questionEvaluations) {
                    totalScore += result.score;
                    totalQuestions += result.totalQuestions;
                    totalAttempted += result.attempted;

                    for (const categoryUpdate of result.categoryUpdates) {
                        updateCategoryScore(
                            categoryScores, 
                            categoryUpdate.category, 
                            categoryUpdate.score, 
                            categoryUpdate.isCorrect,
                            categoryUpdate.timeTaken || 0,
                            categoryUpdate.wasAttempted !== false
                        );
                    }
                }

                // Calculate confidence and accuracy
                const confidence = totalQuestions > 0 ? Number(((totalQuestions / test.orderedQuestions.length) * 100).toFixed(2)) : 0;
                
                // Calculate accuracy based on correct answers, not total score (since we now have negative marking)
                const totalCorrectAnswers = Object.values(categoryScores).reduce((sum, cat) => sum + cat.correctAnswers, 0);
                const accuracy = totalQuestions > 0 ? Number(((totalCorrectAnswers / totalQuestions) * 100).toFixed(2)) : 0;

                // Get and update user stats using admin Firestore
                const userDoc = await adminFirestore.collection('users').doc(userId).get();
                const userData = userDoc.data() || {};
                const totalTestsTaken = userData.totalTestsTaken || 0;
                const oldConfidence = userData.confidence || 0;
                const oldAccuracy = userData.accuracy || 0;

                const newConfidence = (totalTestsTaken * oldConfidence + confidence) / (totalTestsTaken + 1);
                const newAccuracy = (totalTestsTaken * oldAccuracy + accuracy) / (totalTestsTaken + 1);

                // Update user profile using admin Firestore
                await adminFirestore.collection('users').doc(userId).update({
                    confidence: newConfidence,
                    accuracy: newAccuracy,
                    totalTestsTaken: totalTestsTaken + 1,
                    updatedAt: FieldValue.serverTimestamp(),
                });

                // Calculate time taken from individual question times
                let timeTaken = 0;
                if (userTestData.answers) {
                    // Sum up all individual question times
                    Object.values(userTestData.answers).forEach((answer: any) => {
                        if (answer.type === 'comprehensive') {
                            timeTaken += answer.timeTaken || 0;
                        } else {
                            timeTaken += answer.timeTaken || 0;
                        }
                    });
                }
                
                // Fallback to userTestData.timeTaken if individual times not available
                if (timeTaken === 0) {
                    timeTaken = userTestData.timeTaken || 0;
                }
                
                // Store user results using admin Firestore
                const cleanedAnswers = userTestData.answers ? cleanAnswersForFirestore(userTestData.answers) : {};
                await adminFirestore.collection('live-test-user-results').add({
                    testId,
                    userId,
                    displayName: userData.displayName || '',
                    email: userData.email || '',
                    categoryScores,
                    answers: cleanedAnswers,
                    totalScore: totalScore, // This is the score with negative marking
                    timeTaken,
                    submittedAt: new Date(),
                    confidence,
                    accuracy,
                    totalCorrect: totalCorrectAnswers, // This is the actual number of correct answers
                    totalAttempted,
                    evaluatedAt: new Date(),
                    status: 'evaluated',
                    tabSwitchCount: userTestData.tabSwitchCount || 0,
                });

                // Award coins: 1 coin per attempted question + 1 coin per correct answer
                const coinsToAward = totalAttempted + (totalScore + totalAttempted * 0.25) / 1.25;
                if (coinsToAward > 0) {
                    await awardCoinsAdmin(userId, coinsToAward);
                }

                evaluatedUsers++;

            } catch (userError) {
                console.error(`[EVALUATE_LIVE][USER_ERROR] testId=${testId}, userId=${userId}`, userError);
                // Continue with other users even if one fails
            }
        });

        await Promise.all(evaluationPromises);

        // Mark test as evaluated using admin Firestore
        await adminFirestore.collection('live-tests').doc(testId).update({
            evaluated: true,
            evaluatedAt: AdminTimestamp.now(),
            evaluatedBy: 'admin'
        });

        // Generate and cache leaderboard after evaluation
        try {
            // Convert question stats map to QuestionStats array
            const questionStats = Object.entries(questionStatsMap).map(([questionId, stats]) => ({
                questionId,
                totalAttempts: stats.attempts,
                correctCount: stats.correct,
                correctPercentage: stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0
            }));

            await generateLeaderboardOnEvaluation(testId, questionStats);
        } catch (leaderboardError) {
            console.error(`[EVALUATE_LIVE][LEADERBOARD_ERROR] testId=${testId}`, leaderboardError);
            // Don't fail the entire evaluation if leaderboard generation fails
        }

        return { 
            success: true, 
            message: `Live test evaluated successfully. ${evaluatedUsers} users evaluated.`,
            evaluatedUsers
        };

    } catch (error) {
        console.error(`[EVALUATE_LIVE][ERROR] testId=${testId}`, error);
        return { success: false, message: 'Error evaluating live test', evaluatedUsers: 0 };
    }
}

/**
 * Update category score with time tracking and attempt tracking
 */
function updateCategoryScore(
    categoryScores: Record<string, { score: number; totalQuestions: number; correctAnswers: number; time: number; attempted: number }>,
    category: string,
    score: number,
    isCorrect: boolean,
    timeTaken: number = 0,
    wasAttempted: boolean = true
) {
    if (!categoryScores[category]) {
        categoryScores[category] = { score: 0, totalQuestions: 0, correctAnswers: 0, time: 0, attempted: 0 };
    }
    categoryScores[category].score += score;
    categoryScores[category].totalQuestions += 1;
    categoryScores[category].time += timeTaken;
    if (isCorrect) {
        categoryScores[category].correctAnswers += 1;
    }
    if (wasAttempted) {
        categoryScores[category].attempted += 1;
    }
}

/**
 * Get collection name for test results
 */
function getCollectionName(testType: string, userId: string): string {
    if (testType === 'practice') {
        return `users/${userId}/test-results`;
    }
    return `${testType}-test-user-results`;
}

/**
 * Handle evaluation errors
 */
async function handleEvaluationError(
    submissionId: string,
    testType: string,
    userId: string,
    error: any
): Promise<void> {
    const collectionName = getCollectionName(testType, userId);
    try {
        await updateDoc(doc(db, collectionName, submissionId), {
            status: 'failed',
            evaluationError: error.message,
            evaluationErrorAt: Timestamp.now()
        });
    } catch (updateError) {
        console.error('Failed to update evaluation error:', updateError);
    }
}

/**
 * Process answers from RTDB for evaluation, converting stored comprehensive format back to evaluation format
 */
function processAnswersForEvaluation(storedAnswers: Record<string, any>): Record<string, QuestionAnswer | ComprehensiveQuestionAnswer> {
    console.log('[PROCESS_ANSWERS_FOR_EVALUATION] Input stored answers:', storedAnswers);

    const processedAnswers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer> = {};

    Object.entries(storedAnswers).forEach(([id, answer]) => {
        console.log(`[PROCESS_ANSWERS_FOR_EVALUATION] Processing answer for ID: ${id}, type: ${answer.type}`);

        if (answer.type === 'comprehensive') {
            // For comprehensive questions, convert back to the expected evaluation format
            // Clean sub-question answers to handle undefined values
            const cleanedSubAnswers: Record<string, { selected: number | null; timeTaken: number }> = {};
            if (answer.subQuestionAnswers) {
                Object.entries(answer.subQuestionAnswers).forEach(([subId, subAnswer]: [string, any]) => {
                    if (subAnswer) {
                        cleanedSubAnswers[subId] = {
                            selected: subAnswer.selected !== undefined ? subAnswer.selected : null,
                            timeTaken: subAnswer.timeTaken || 0
                        };
                    }
                });
            }
            
            const comprehensiveAnswer: ComprehensiveQuestionAnswer = {
                id,
                timeTaken: answer.timeTaken || 0,
                subQuestionAnswers: cleanedSubAnswers,
                type: 'comprehensive'
            };

            console.log(`[PROCESS_ANSWERS_FOR_EVALUATION] Comprehensive answer for ${id}:`, comprehensiveAnswer);
            processedAnswers[id] = comprehensiveAnswer;
        } else {
            // For regular questions, convert to expected evaluation format
            // Handle undefined selected values by converting to null
            const regularAnswer: QuestionAnswer = {
                id,
                selected: answer.selected !== undefined ? answer.selected : null,
                timeTaken: answer.timeTaken || answer.timeSelected || 0,
                type: 'question'
            };

            console.log(`[PROCESS_ANSWERS_FOR_EVALUATION] Regular answer for ${id}:`, regularAnswer);
            processedAnswers[id] = regularAnswer;
        }
    });

    console.log('[PROCESS_ANSWERS_FOR_EVALUATION] Final processed answers:', processedAnswers);
    return processedAnswers;
}

/**
 * Clean answers object to ensure no undefined values are passed to Firestore
 */
function cleanAnswersForFirestore(answers: Record<string, any>): Record<string, any> {
    const cleanedAnswers: Record<string, any> = {};
    
    Object.entries(answers).forEach(([id, answer]) => {
        if (!answer) return; // Skip null/undefined answers
        
        if (answer.type === 'comprehensive') {
            const cleanedSubAnswers: Record<string, any> = {};
            if (answer.subQuestionAnswers) {
                Object.entries(answer.subQuestionAnswers).forEach(([subId, subAnswer]: [string, any]) => {
                    if (subAnswer) {
                        cleanedSubAnswers[subId] = {
                            selected: subAnswer.selected !== undefined ? subAnswer.selected : null,
                            timeTaken: subAnswer.timeTaken || 0
                        };
                    }
                });
            }
            
            cleanedAnswers[id] = {
                id,
                timeTaken: answer.timeTaken || 0,
                subQuestionAnswers: cleanedSubAnswers,
                type: 'comprehensive'
            };
        } else {
            // Regular question
            cleanedAnswers[id] = {
                id,
                selected: answer.selected !== undefined ? answer.selected : null,
                timeTaken: answer.timeTaken || 0,
                type: answer.type || 'question'
            };
        }
    });
    
    return cleanedAnswers;
}

export async function getTestAnswersFromRTDBAdmin(
    testId: string,
    uid: string,
    type: string,
): Promise<TestAnswers> {
    const userTestDataRef = adminDb.ref(`${type}-tests/${testId}/${uid}`);
    console.log("[GET_TEST_ANSWERS_RTDB_ADMIN] Fetching user test data from RTDB:", `${type}-tests/${testId}/${uid}`);

    const userTestDataSnapshot = await userTestDataRef.get();
    console.log("[GET_TEST_ANSWERS_RTDB_ADMIN] User Test Data Snapshot:", userTestDataSnapshot.exists() ? "Exists" : "Does not exist");

    if (!userTestDataSnapshot.exists()) {
        console.log("[GET_TEST_ANSWERS_RTDB_ADMIN] No data found, returning empty result");
        return { locked: false };
    }

    const testData = userTestDataSnapshot.val();
    console.log("[GET_TEST_ANSWERS_RTDB_ADMIN] Raw test data:", testData);

    // Process answers to handle comprehensive questions properly
    const processedAnswers = testData.answers ? processAnswersForEvaluation(testData.answers) : undefined;
    console.log("[GET_TEST_ANSWERS_RTDB_ADMIN] Processed answers:", processedAnswers);

    return {
        locked: false,
        startedAt: testData.startedAt,
        updatedAt: testData.updatedAt,
        answers: processedAnswers as any, // Cast to any since the type definition is inconsistent with usage
    };
}

export async function getAllAnswersFromRTDBAdmin(testId: string, type: string) {
    try {
        // Reference to the users' test data in the Realtime Database
        const userTestDataRef = adminDb.ref(`${type}-tests/${testId}`);
        const userTestDataSnapshot = await userTestDataRef.get();
        if (userTestDataSnapshot.exists()) {
            const userAnswers = userTestDataSnapshot.val();
            return userAnswers;
        } else {
            console.log('No data available');
            return null;
        }
    } catch (error) {
        console.error("Error fetching user answers:", error);
        throw new Error('Failed to fetch user answers');
    }
}

/**
 * Evaluate a challenge test submission and store results in the challenge test document
 */
export async function evaluateChallengeTestSubmission(
    testId: string,
    userId: string,
    submission: TestSubmission
): Promise<void> {
    try {
        // Get the test to fetch correct answers
        const testDoc = await getDoc(doc(db, 'challenge-tests', testId));
        if (!testDoc.exists()) {
            throw new Error('Challenge test not found');
        }

        const testData = testDoc.data();
        const orderedQuestions = testData.orderedQuestions as OrderedQuestion[];

        let totalScore = 0;
        let totalQuestions = 0;
        const categoryScores: Record<string, { score: number; totalQuestions: number; correctAnswers: number; time: number; attempted: number }> = {};

        // Evaluate all questions in parallel for better performance
        const evaluationPromises = orderedQuestions.map(async (orderedQuestion) => {
            const userAnswer = submission.answers[orderedQuestion.id];
            if (!userAnswer) return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };

            if (orderedQuestion.type === 'question') {
                return await evaluateRegularQuestion(orderedQuestion.id, userAnswer as QuestionAnswer);
            } else if (orderedQuestion.type === 'comprehensive') {
                return await evaluateComprehensiveQuestion(orderedQuestion.id, userAnswer as ComprehensiveQuestionAnswer);
            }
            return { score: 0, totalQuestions: 0, attempted: 0, categoryUpdates: [] };
        });

        const evaluationResults = await Promise.all(evaluationPromises);

        // Aggregate results
        for (const result of evaluationResults) {
            totalScore += result.score;
            totalQuestions += result.totalQuestions;

            // Update category scores
            for (const categoryUpdate of result.categoryUpdates) {
                updateCategoryScore(
                    categoryScores, 
                    categoryUpdate.category, 
                    categoryUpdate.score, 
                    categoryUpdate.isCorrect,
                    categoryUpdate.timeTaken || 0,
                    categoryUpdate.wasAttempted !== false
                );
            }
        }

        // Update the challenge test document with evaluation results
        const challengeTestRef = doc(db, 'challenge-tests', testId);
        const totalCorrectAnswers = Object.values(categoryScores).reduce((sum, cat) => sum + cat.correctAnswers, 0);
        await updateDoc(challengeTestRef, {
            [`results.${userId}.totalScore`]: totalScore,
            [`results.${userId}.totalCorrect`]: totalCorrectAnswers,
            [`results.${userId}.totalQuestions`]: totalQuestions,
            [`results.${userId}.categoryScores`]: categoryScores,
            [`results.${userId}.status`]: 'evaluated',
            [`results.${userId}.evaluatedAt`]: Timestamp.now()
        });

    } catch (error) {
        console.error('Error in challenge test evaluation:', error);
        // Update the challenge test with error status
        try {
            const challengeTestRef = doc(db, 'challenge-tests', testId);
            await updateDoc(challengeTestRef, {
                [`results.${userId}.status`]: 'failed',
                [`results.${userId}.evaluationError`]: (error as Error).message,
                [`results.${userId}.evaluationErrorAt`]: Timestamp.now()
            });
        } catch (updateError) {
            console.error('Failed to update challenge test evaluation error:', updateError);
        }
    }
}

/**
 * Award coins to a user using RTDB admin (for server-side operations)
 */
async function awardCoinsAdmin(userId: string, coins: number): Promise<void> {
    if (!userId || !coins || coins <= 0) return;

    try {
        // Try to get user information from Firestore for better initialization
        let userInfo = {};
        try {
            const { adminFirestore } = await import('../firebase/firebase-admin');
            const userDoc = await adminFirestore.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                userInfo = {
                    displayName: userData?.displayName || 'Unknown User',
                    profilePictureUrl: userData?.profilePictureUrl || '',
                    batch: userData?.batch || ''
                };
            }
        } catch (fetchError) {
            console.warn(`Could not fetch user data for ${userId}, using defaults:`, fetchError);
        }

        const result = await updateUserCoinsAdmin(
            userId, 
            coins, 
            'add', 
            'Test completion reward (admin)',
            userInfo
        );
        
        console.log(`[AWARD_COINS_RTDB_ADMIN] userId=${userId}, awarded=${coins}, newTotal=${result.newBalance}`);
    } catch (error) {
        console.error(`Failed to award coins to user ${userId} (admin):`, error);
    }
}
