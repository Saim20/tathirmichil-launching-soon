/**
 * Cache management utilities for user data
 */

export const CACHE_KEYS = {
  USERS: "cached_users",
  USERS_LAST_SYNC: "cached_users_last_sync",
  PRACTICE_TESTS: "cached_practice_tests",
  PRACTICE_TESTS_LAST_SYNC: "cached_practice_tests_last_sync",
  ASSESSMENT_TESTS: "cached_assessment_tests",
  ASSESSMENT_TESTS_LAST_SYNC: "cached_assessment_tests_last_sync",
  CHALLENGE_TESTS: "cached_challenge_tests",
  CHALLENGE_TESTS_LAST_SYNC: "cached_challenge_tests_last_sync",
  LIVE_TESTS: "cached_live_tests",
  LIVE_TESTS_LAST_SYNC: "cached_live_tests_last_sync",
  // Test Results Cache Keys
  PRACTICE_TEST_RESULTS: "cached_practice_test_results",
  ASSESSMENT_TEST_RESULTS: "cached_assessment_test_results",
  LIVE_TEST_RESULTS: "cached_live_test_results",
} as const;

export const CACHE_CONFIG = {
  // Cache is considered fresh for 5 minutes
  FRESHNESS_DURATION: 5 * 60 * 1000,
} as const;

/**
 * Clear all user-related cache data
 */
export function clearUserCache(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(CACHE_KEYS.USERS);
  localStorage.removeItem(CACHE_KEYS.USERS_LAST_SYNC);
}

/**
 * Clear test cache data for a specific test type
 */
export function clearTestCache(testType: 'practice' | 'assessment' | 'challenge' | 'live'): void {
  if (typeof window === "undefined") return;
  
  const cacheKey = testType.toUpperCase() + '_TESTS' as keyof typeof CACHE_KEYS;
  const syncKey = testType.toUpperCase() + '_TESTS_LAST_SYNC' as keyof typeof CACHE_KEYS;
  
  localStorage.removeItem(CACHE_KEYS[cacheKey]);
  localStorage.removeItem(CACHE_KEYS[syncKey]);
}

/**
 * Clear all test cache data
 */
export function clearAllTestCache(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(CACHE_KEYS.PRACTICE_TESTS);
  localStorage.removeItem(CACHE_KEYS.PRACTICE_TESTS_LAST_SYNC);
  localStorage.removeItem(CACHE_KEYS.ASSESSMENT_TESTS);
  localStorage.removeItem(CACHE_KEYS.ASSESSMENT_TESTS_LAST_SYNC);
  localStorage.removeItem(CACHE_KEYS.CHALLENGE_TESTS);
  localStorage.removeItem(CACHE_KEYS.CHALLENGE_TESTS_LAST_SYNC);
  localStorage.removeItem(CACHE_KEYS.LIVE_TESTS);
  localStorage.removeItem(CACHE_KEYS.LIVE_TESTS_LAST_SYNC);
}

/**
 * Clear all test result cache data
 */
export function clearAllTestResultCache(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(CACHE_KEYS.PRACTICE_TEST_RESULTS);
  localStorage.removeItem(CACHE_KEYS.ASSESSMENT_TEST_RESULTS);
  localStorage.removeItem(CACHE_KEYS.LIVE_TEST_RESULTS);
}

/**
 * Get cached test result
 */
export function getCachedTestResult(testType: 'practice' | 'assessment' | 'live', testId: string, userId: string): any | null {
  if (typeof window === "undefined") return null;
  
  const cacheKey = testType === 'practice' ? CACHE_KEYS.PRACTICE_TEST_RESULTS :
                   testType === 'assessment' ? CACHE_KEYS.ASSESSMENT_TEST_RESULTS :
                   CACHE_KEYS.LIVE_TEST_RESULTS;
  
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return null;
  
  try {
    const cachedResults = JSON.parse(cached);
    const resultKey = `${userId}_${testId}`;
    const result = cachedResults[resultKey];
    
    if (result) {
      // Convert date strings back to Date objects
      return {
        ...result,
        submittedAt: result.submittedAt ? new Date(result.submittedAt) : null,
      };
    }
    
    return null;
  } catch (e) {
    console.warn(`Failed to parse cached ${testType} test results:`, e);
    return null;
  }
}

/**
 * Cache test result
 */
export function cacheTestResult(testType: 'practice' | 'assessment' | 'live', testId: string, userId: string, result: any): void {
  if (typeof window === "undefined") return;
  
  const cacheKey = testType === 'practice' ? CACHE_KEYS.PRACTICE_TEST_RESULTS :
                   testType === 'assessment' ? CACHE_KEYS.ASSESSMENT_TEST_RESULTS :
                   CACHE_KEYS.LIVE_TEST_RESULTS;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    const cachedResults = cached ? JSON.parse(cached) : {};
    
    const resultKey = `${userId}_${testId}`;
    cachedResults[resultKey] = result;
    
    localStorage.setItem(cacheKey, JSON.stringify(cachedResults));
  } catch (e) {
    console.warn(`Failed to cache ${testType} test result:`, e);
  }
}

/**
 * Get the last cache sync time
 */
export function getLastCacheSyncTime(): Date | null {
  if (typeof window === "undefined") return null;
  
  const lastSync = localStorage.getItem(CACHE_KEYS.USERS_LAST_SYNC);
  return lastSync ? new Date(lastSync) : null;
}

/**
 * Check if the cache timestamp indicates fresh data
 */
export function isCacheTimestampFresh(lastSyncTime: Date): boolean {
  const now = new Date();
  const cutoff = new Date(now.getTime() - CACHE_CONFIG.FRESHNESS_DURATION);
  return lastSyncTime > cutoff;
}

/**
 * Force refresh user cache by clearing timestamps
 */
export function forceUserCacheRefresh(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(CACHE_KEYS.USERS_LAST_SYNC);
}
