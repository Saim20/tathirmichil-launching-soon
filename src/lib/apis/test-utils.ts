/**
 * Test Utility Functions
 * 
 * This module contains utility functions for test operations, validation,
 * formatting, and batch operations.
 */

import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { ApiResponse, safeApiCall } from "./base";
import { QuestionAnswer, ComprehensiveQuestionAnswer, OrderedQuestion } from "./test-types";

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch update test results with error handling
 */
export async function batchUpdateTestResults(
    updates: Array<{
        collectionName: string;
        docId: string;
        data: any;
    }>
): Promise<ApiResponse<void>> {
    return safeApiCall(async () => {
        const batch = writeBatch(db);
        
        for (const update of updates) {
            const docRef = doc(db, update.collectionName, update.docId);
            batch.update(docRef, update.data);
        }
        
        await batch.commit();
    }, 'Failed to batch update test results');
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get user display information for test results
 */
export async function getUserDisplayInfo(userId: string): Promise<{
    displayName: string;
    email: string;
}> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();
        
        return {
            displayName: userData?.displayName || 'Unknown User',
            email: userData?.email || 'No email'
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        return {
            displayName: 'Unknown User',
            email: 'No email'
        };
    }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate test answers before submission
 */
export function validateTestAnswers(
    answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>,
    orderedQuestions: OrderedQuestion[]
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if all questions have answers
    for (const question of orderedQuestions) {
        const answer = answers[question.id];
        if (!answer) {
            errors.push(`Missing answer for question ${question.id}`);
            continue;
        }
        
        if (question.type === 'comprehensive' && answer.type === 'comprehensive') {
            const comprehensiveAnswer = answer as ComprehensiveQuestionAnswer;
            if (!comprehensiveAnswer.subQuestionAnswers || Object.keys(comprehensiveAnswer.subQuestionAnswers).length === 0) {
                errors.push(`No sub-question answers provided for comprehensive question ${question.id}`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate test submission data
 */
export function validateTestSubmission(
    testId: string,
    userId: string,
    testType: string,
    answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!testId || typeof testId !== 'string') {
        errors.push('Test ID is required and must be a string');
    }
    
    if (!userId || typeof userId !== 'string') {
        errors.push('User ID is required and must be a string');
    }
    
    if (!testType || typeof testType !== 'string') {
        errors.push('Test type is required and must be a string');
    }
    
    if (!answers || typeof answers !== 'object') {
        errors.push('Answers are required and must be an object');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate percentage score
 */
export function calculatePercentageScore(score: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Number(((score / totalQuestions) * 100).toFixed(2));
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correctAnswers: number, totalQuestions: number): number {
    return calculatePercentageScore(correctAnswers, totalQuestions);
}

/**
 * Calculate average time per question
 */
export function calculateAverageTimePerQuestion(totalTime: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Number((totalTime / totalQuestions).toFixed(2));
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format test duration
 */
export function formatTestDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

/**
 * Format test duration in detailed format
 */
export function formatDetailedTestDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format score display
 */
export function formatScore(score: number, totalQuestions: number): string {
    return `${score}/${totalQuestions}`;
}

/**
 * Format percentage display
 */
export function formatPercentage(percentage: number): string {
    return `${percentage.toFixed(2)}%`;
}

// ============================================================================
// STATUS FUNCTIONS
// ============================================================================

/**
 * Get test status based on submission and evaluation
 */
export function getTestStatus(
    submitted: boolean,
    evaluated: boolean,
    autoEvaluated: boolean
): 'not_submitted' | 'submitted' | 'evaluating' | 'evaluated' {
    if (!submitted) return 'not_submitted';
    if (!evaluated && !autoEvaluated) return 'submitted';
    if (evaluated || autoEvaluated) return 'evaluated';
    return 'evaluating';
}

/**
 * Get test completion status
 */
export function getTestCompletionStatus(
    answeredQuestions: number,
    totalQuestions: number
): 'not_started' | 'in_progress' | 'completed' {
    if (answeredQuestions === 0) return 'not_started';
    if (answeredQuestions < totalQuestions) return 'in_progress';
    return 'completed';
}

/**
 * Determine if test can be submitted
 */
export function canSubmitTest(
    answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>,
    orderedQuestions: OrderedQuestion[],
    requireAllAnswers: boolean = false
): boolean {
    if (requireAllAnswers) {
        return orderedQuestions.every(q => answers[q.id] !== undefined);
    }
    
    // At least one question must be answered
    return Object.keys(answers).length > 0;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Shuffle array elements
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Group array elements by a key
 */
export function groupBy<T, K extends keyof any>(
    array: T[],
    getKey: (item: T) => K
): Record<K, T[]> {
    return array.reduce((groups, item) => {
        const key = getKey(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {} as Record<K, T[]>);
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): number {
    return Date.now();
}

/**
 * Calculate time difference in milliseconds
 */
export function getTimeDifference(startTime: Date, endTime: Date): number {
    return endTime.getTime() - startTime.getTime();
}

/**
 * Check if time limit exceeded
 */
export function isTimeLimitExceeded(
    startTime: Date,
    timeLimitInMinutes: number
): boolean {
    const currentTime = new Date();
    const timeDifference = getTimeDifference(startTime, currentTime);
    const timeLimitInMs = timeLimitInMinutes * 60 * 1000;
    
    return timeDifference > timeLimitInMs;
}
