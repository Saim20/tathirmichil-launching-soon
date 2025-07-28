/**
 * Centralized API exports for the tathirmichil application
 * This file provides a clean interface for importing API functions
 */

// ============================================================================
// BASE UTILITIES
// ============================================================================
export * from './base';
// Note: Legacy types.ts is not exported to avoid conflicts with modular test-types.ts

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================
export * from './users';

// ============================================================================
// TESTS & ASSESSMENTS
// ============================================================================
export * from './tests';
export * from './questions';
export * from './comprehensive-questions';
export * from './test-transformers';
export * from './test-utils';
// Note: test-evaluation is not exported here to prevent client-side bundling
// of Firebase Admin SDK. Use dynamic imports from './tests' when needed.
// Note: test-types is already re-exported by './tests'

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================
export * from './blogs';
export * from './posts';

// ============================================================================
// ACADEMIC DATA
// ============================================================================
export * from './batches';

// ============================================================================
// SESSIONS
// ============================================================================
export * from './sessions';

// ============================================================================
// API FUNCTION COLLECTIONS
// ============================================================================

// Test-related functions
export const TestAPI = {
  // Practice Tests
  getPracticeTests: () => import('./tests').then(m => m.getPracticeTests),
  getPracticeTestById: () => import('./tests').then(m => m.getPracticeTestById),
  
  // Live Tests
  getLiveTests: () => import('./tests').then(m => m.getLiveTests),
  getLiveTestById: () => import('./tests').then(m => m.getLiveTestById),
  subscribeToLiveTests: () => import('./tests').then(m => m.subscribeToLiveTests),
  
  // Assessment Tests
  getAssessmentTests: () => import('./tests').then(m => m.getAssessmentTests),
  getAssessmentTestById: () => import('./tests').then(m => m.getAssessmentTestById),
  subscribeToAssessmentTests: () => import('./tests').then(m => m.subscribeToAssessmentTests),
  
  // Challenge Tests
  getChallengeTestById: () => import('./tests').then(m => m.getChallengeTestById),
  
  // Test Results
  getUserPracticeTestResult: () => import('./tests').then(m => m.getUserPracticeTestResult),
  getUserLiveTestResult: () => import('./tests').then(m => m.getUserLiveTestResult),
  getUserAssessmentTestResult: () => import('./tests').then(m => m.getUserAssessmentTestResult),
  
  // Test Statistics
  getUserLiveTestStats: () => import('./user-test-stats').then(m => m.getUserLiveTestStats),
  getUserLiveTestSummary: () => import('./user-test-stats').then(m => m.getUserLiveTestSummary),
  
  // Test Answers & Session Management
  sendTestAnswersToDatabase: () => import('./tests').then(m => m.sendTestAnswersToDatabase),
  getTestAnswersFromRTDB: () => import('./tests').then(m => m.getTestAnswersFromRTDB),
};

// Content-related functions
export const ContentAPI = {
  // Blogs
  getPublicBlogs: () => import('./blogs').then(m => m.getPublicBlogs),
  getBlogById: () => import('./blogs').then(m => m.getBlogById),
  
  // Posts/Announcements
  getPostsForStudent: () => import('./posts').then(m => m.getPostsForStudent),
  getStudentBatch: () => import('./posts').then(m => m.getStudentBatch),
};

// User-related functions
export const UserAPI = {
  getAllUsers: () => import('./users').then(m => m.getAllUsers),
  getDefaultUser: () => import('./users').then(m => m.getDefaultUser),
};

// Academic data functions
export const AcademicAPI = {
  getBatches: () => import('./batches').then(m => m.getBatches),
  getQuestionById: () => import('./questions').then(m => m.getQuestionById),
};

// Session management functions
export const SessionAPI = {
  createSession: () => import('./sessions').then(m => m.createSession),
  getAllSessions: () => import('./sessions').then(m => m.getAllSessions),
  getSessionsByUser: () => import('./sessions').then(m => m.getSessionsByUser),
  getPendingSessions: () => import('./sessions').then(m => m.getPendingSessions),
  markSessionAsDone: () => import('./sessions').then(m => m.markSessionAsDone),
  updateSessionStatus: () => import('./sessions').then(m => m.updateSessionStatus),
};

// ============================================================================
// CONVENIENCE HOOKS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Common API operation patterns
 */
export const APIPatterns = {
  /**
   * Fetch paginated data with error handling
   */
  fetchPaginated: async <T>(
    fetchFunction: (prev: T[], limit: number) => Promise<{ data: T[] | null; error: string | null; success: boolean }>,
    currentData: T[] = [],
    limit: number = 10
  ) => {
    const result = await fetchFunction(currentData, limit);
    
    if (!result.success || !result.data) {
      console.error('Failed to fetch paginated data:', result.error);
      return { data: currentData, hasMore: false, error: result.error };
    }
    
    const newData = [...currentData, ...result.data];
    const hasMore = result.data.length === limit;
    
    return { data: newData, hasMore, error: null };
  },

  /**
   * Fetch single item with caching
   */
  fetchWithCache: async <T>(
    cacheKey: string,
    fetchFunction: () => Promise<{ data: T | null; error: string | null; success: boolean }>,
    cacheTimeMs: number = 5 * 60 * 1000 // 5 minutes default
  ) => {
    if (typeof window === 'undefined') {
      return fetchFunction();
    }

    // Check cache
    try {
      const cached = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (cached && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < cacheTimeMs) {
          return { data: JSON.parse(cached), error: null, success: true };
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    // Fetch fresh data
    const result = await fetchFunction();
    
    // Update cache on success
    if (result.success && result.data) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      } catch (error) {
        console.warn('Cache write error:', error);
      }
    }
    
    return result;
  },

  /**
   * Batch multiple API calls
   */
  batchCalls: async <T>(
    operations: Array<() => Promise<{ data: T | null; error: string | null; success: boolean }>>
  ) => {
    const results = await Promise.allSettled(operations.map(op => op()));
    
    const successful: T[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success && result.value.data) {
          successful.push(result.value.data);
        } else {
          errors.push(result.value.error || `Operation ${index} failed`);
        }
      } else {
        errors.push(`Operation ${index} rejected: ${result.reason}`);
      }
    });
    
    return {
      successful,
      errors,
      allSuccessful: errors.length === 0,
      partialSuccess: successful.length > 0 && errors.length > 0
    };
  }
};
