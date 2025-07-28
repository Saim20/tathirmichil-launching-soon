/**
 * Consolidated API types and interfaces for the tathirmichil application
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginationMeta {
  hasMore: boolean;
  lastItem?: any;
  totalCount?: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  error: string | null;
  success: boolean;
}

export interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ============================================================================
// TEST RELATED TYPES
// ============================================================================

export interface BaseTest extends DatabaseEntity {
  title: string;
  questions: string[];
  time: number; // Duration in minutes
}

export interface TestWithSchedule extends BaseTest {
  startsAt: Date;
}

export interface TestWithEndTime extends TestWithSchedule {
  endsAt: Date;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startedAt: Date;
  submittedAt?: Date;
  timeTaken: number; // in seconds
  isLocked: boolean;
  score?: number;
}

export interface QuestionAnswer {
  questionId: string;
  selectedOption: number | null;
  timeTaken: number; // in seconds
  isCorrect?: boolean;
}

// ============================================================================
// USER RELATED TYPES
// ============================================================================

export interface BaseUser extends DatabaseEntity {
  email: string;
  displayName?: string;
  role: 'student' | 'admin' | 'teacher';
}

export interface StudentProfile extends BaseUser {
  batch?: string;
  // Note: coins are now managed via RTDB, not in user profile
  confidence: number;
  accuracy: number;
  isPassed: boolean;
  totalTestsTaken: number; // Legacy field for all tests combined
  practiceTestsTaken: number; // Specific field for practice tests only
}

// ============================================================================
// CONTENT RELATED TYPES
// ============================================================================

export interface BlogPost extends DatabaseEntity {
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  isPublished: boolean;
  authorId: string;
}

export interface Announcement extends DatabaseEntity {
  title: string;
  body: string;
  type: 'everyone' | 'batch' | 'student';
  targetValue?: string; // batch ID or user ID
  authorId: string;
  isUrgent: boolean;
}

// ============================================================================
// ACADEMIC TYPES
// ============================================================================

export interface Batch extends DatabaseEntity {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  subjectId: string;
  weightage: number; // for scoring
}

export interface QuestionCategory {
  id: string;
  name: string;
  subcategories: string[];
}

// ============================================================================
// SCORING AND ANALYTICS
// ============================================================================

export interface CategoryScore {
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  subcategories: Record<string, {
    score: number;
    total: number;
    percentage: number;
    timeTaken: number;
  }>;
}

export interface TestResult extends DatabaseEntity {
  testId: string;
  userId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  answers: QuestionAnswer[];
  categoryScores: Record<string, CategoryScore>;
  rank?: number;
  submittedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  timeTaken: number;
  rank: number;
  batch?: string;
}

// ============================================================================
// REAL-TIME DATA TYPES
// ============================================================================

export interface LiveTestSession {
  testId: string;
  userId: string;
  isActive: boolean;
  currentQuestionIndex: number;
  startTime: Date;
  lastActivity: Date;
  answers: Record<string, QuestionAnswer>;
}

export interface TestMonitoring {
  sessionId: string;
  userId: string;
  testId: string;
  events: TestEvent[];
  violations: SecurityViolation[];
}

export interface TestEvent {
  type: 'start' | 'answer' | 'navigate' | 'submit' | 'pause' | 'resume';
  timestamp: Date;
  questionId?: string;
  data?: any;
}

export interface SecurityViolation {
  type: 'tab_switch' | 'copy_paste' | 'right_click' | 'fullscreen_exit';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// ============================================================================
// API QUERY FILTERS
// ============================================================================

export interface TestFilters {
  type?: 'practice' | 'live' | 'assessment' | 'challenge';
  status?: 'upcoming' | 'active' | 'completed';
  batch?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface UserFilters {
  role?: string;
  batch?: string;
  isActive?: boolean;
  registrationDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BlogFilters {
  tags?: string[];
  authorId?: string;
  isPublished?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiErrorInterface {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface ValidationError extends ApiErrorInterface {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

export interface AuthError extends ApiErrorInterface {
  code: 'AUTH_ERROR' | 'PERMISSION_DENIED';
}

export interface NotFoundError extends ApiErrorInterface {
  code: 'NOT_FOUND';
  resource: string;
  id: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface TypesPaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface QueryOptions {
  sort?: SortOptions;
  pagination?: TypesPaginationOptions;
  filters?: Record<string, any>;
}
