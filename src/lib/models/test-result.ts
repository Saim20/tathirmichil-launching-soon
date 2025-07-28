import { Timestamp } from "firebase/firestore";

export interface ResultCategoryScore {
  score: number;
  total: number;
  time: number;
  attempted: number;
  attemptedPercentage: number;
  subcategories?: {
    [key: string]: {
      score: number;
      total: number;
      time: number;
      attempted: number;
      attemptedPercentage: number;
    };
  };
}

export interface AnswerDetail {
  id: string;
  selected: number | null;
  timeTaken: number;
}

export interface AnswerMap {
  [questionId: string]: {
    selected: number | null;
    timeTaken: number;
  };
}

export interface BaseTestResult {
  id: string;
  testId: string;
  totalScore: number;
  timeTaken: number;
  submittedAt: Timestamp | Date;
  answers: AnswerMap | AnswerDetail[];
  categoryScores: {
    [key: string]: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      time: number;
      attempted: number;
    };
  };
  totalCorrect: number;
  totalAttempted?: number; // Total questions attempted - for calculating correct answers when negative marking exists
  displayName: string;
  email: string;
  tabSwitchCount?: number;
}

export interface AssessmentTestResult extends BaseTestResult {
  confidence: number;
  accuracy: number;
}

export interface ChallengeTestResult extends BaseTestResult {
  createdBy: string;
  createdByName: string;
  invitedUser: string;
  invitedName: string;
  status: string;
}

export interface LiveTestResult extends BaseTestResult {
  rank?: number;
  percentile?: number;
}

export interface PracticeTestResult extends BaseTestResult {
  // Any practice-specific fields can be added here
}

export type TestType = 'practice' | 'assessment' | 'live' | 'challenge'; 