/**
 * Test Types and Interfaces
 * 
 * This module contains all the TypeScript interfaces and types related to tests,
 * test results, and test submissions.
 */

import { QuestionWithTimer, QuestionOrComprehensiveWithTimer } from "./questions";

// ============================================================================
// CORE TEST INTERFACES
// ============================================================================

export interface OrderedQuestion {
    id: string;
    type: 'question' | 'comprehensive';
}

export interface Test {
    id: string;
    title: string;
    time: number;
    createdAt: Date;
    orderedQuestions: OrderedQuestion[];
    category?: string; // Optional category filter - if set, test will only include questions from this category
    subCategory?: string; // Optional subcategory filter - if set, test will only include questions from this subcategory
}

export interface LiveTest extends Test {
    startsAt: Date;
    batch: string; // Name of the batch this test belongs to
}

export interface AssessmentTest extends Test {
}

export interface ChallengeTest extends Test {
    createdBy: string;
    createdByName: string;
    invitedUser: string;
    invitedName: string;
    status: string;
    results: any;
    startTime: Date;
}

// ============================================================================
// ANSWER INTERFACES
// ============================================================================

export interface QuestionAnswer {
    id: string;
    timeTaken: number;
    selected: number | null;
    type: 'question' | 'comprehensive';
}

export interface ComprehensiveQuestionAnswer {
    id: string;
    timeTaken: number;
    subQuestionAnswers: {
        [subQuestionId: string]: {
            selected: number | null;
            timeTaken: number;
        };
    };
    type: 'comprehensive';
}

// ============================================================================
// RESULT INTERFACES
// ============================================================================

export interface BasicTestResult {
    id: string;
    testId: string;
    userId: string;
    totalScore: number;
    timeTaken: number;
    submittedAt: Date;
    answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>;
    categoryScores: Record<string, {
        score: number;
        totalQuestions: number;
        correctAnswers: number;
    }>;
    status: 'completed' | 'submitted' | 'evaluated';
}

export interface PracticeTestResult extends BasicTestResult {
    type: 'practice';
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
    evaluated: boolean;
    evaluatedAt?: Date;
    evaluatedBy?: string;
    feedback?: string;
    recommendations?: string[];
    strengths?: string[];
    weaknesses?: string[];
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
    autoEvaluated: boolean;
    evaluationCompletedAt: Date;
    challengeStatus: 'completed' | 'won' | 'lost' | 'draw';
    opponentUserId?: string;
    opponentScore?: number;
    challengeData: {
        opponentId: string;
        opponentName: string;
        opponentScore: number;
        winner: string;
        status: 'won' | 'lost' | 'tied';
    };
    questionwiseDetails: Array<{
        questionId: string;
        correct: boolean;
        timeTaken: number;
        categoryName: string;
    }>;
}

export interface TestSubmission {
    testId: string;
    userId: string;
    testType: 'practice' | 'live' | 'assessment' | 'challenge';
    answers: Record<string, QuestionAnswer | ComprehensiveQuestionAnswer>;
    startTime: Date;
    endTime: Date;
    totalTimeTaken: number;
    status: 'submitted' | 'evaluating' | 'completed';
    submittedAt: Date;
    tabSwitchCount?: number;
}

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type LiveExamTestAnswers = QuestionAnswer;

export type TestAnswers = {
    locked: boolean;
    startedAt?: Date;
    answers?: QuestionAnswer[];
    updatedAt?: Date;
};

export type SendAnswerProps = {
    testId: string;
    questionsToSync: QuestionOrComprehensiveWithTimer[];
    previousQuestions: QuestionOrComprehensiveWithTimer[];
    uid: string;
    lockTest?: boolean;
    type: string;
    startingTime?: Date;
    tabSwitchCount?: number;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TestType = 'practice' | 'live' | 'assessment' | 'challenge';

export type TestResultType = 
    | PracticeTestResult 
    | LiveTestResult 
    | AssessmentTestResult 
    | ChallengeTestResult;

export type TestVariant = Test | LiveTest | AssessmentTest | ChallengeTest;

export type EvaluationStatus = 'pending' | 'evaluating' | 'completed' | 'failed';

export type CategoryScore = {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
};

export type QuestionwiseDetail = {
    questionId: string;
    correct: boolean;
    timeTaken: number;
    categoryName: string;
    type: 'question' | 'comprehensive';
    // For comprehensive questions, we can include sub-question details
    subQuestionDetails?: Array<{
        subQuestionId: string;
        correct: boolean;
        timeTaken: number;
        categoryName: string;
    }>;
};
