import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  getPracticeTests, 
  getAllPracticeTests,
  getAssessmentTests, 
  getLiveTests, 
  Test, 
  AssessmentTest, 
  LiveTest 
} from "@/lib/apis/tests";
import { 
  CACHE_KEYS, 
  isCacheTimestampFresh,
  clearTestCache 
} from "@/lib/utils/cache-helpers";

// Practice Tests Hook
export function usePracticeTests(selectedCategory?: string) {
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tests based on selected category
  useEffect(() => {
    if (!selectedCategory) {
      setTests(allTests);
    } else {
      const filteredTests = allTests.filter(test => test.category === selectedCategory);
      setTests(filteredTests);
    }
  }, [allTests, selectedCategory]);

  // Update local test cache
  const updateTestLocal = useCallback((testId: string, updates: Partial<Test>) => {
    setAllTests(prevTests => {
      const updatedTests = prevTests.map(test => 
        test.id === testId ? { 
          ...test, 
          ...updates
        } : test
      );
      // Update localStorage cache
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEYS.PRACTICE_TESTS, JSON.stringify(updatedTests));
        localStorage.setItem(CACHE_KEYS.PRACTICE_TESTS_LAST_SYNC, new Date().toISOString());
      }
      return updatedTests;
    });
  }, []);

  // Check if cache is fresh
  const isCacheFresh = useCallback((cachedTests: Test[]): boolean => {
    if (typeof window === "undefined") return false;
    
    const lastSync = localStorage.getItem(CACHE_KEYS.PRACTICE_TESTS_LAST_SYNC);
    if (!lastSync) return false;

    const lastSyncTime = new Date(lastSync);
    return isCacheTimestampFresh(lastSyncTime);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const cached = localStorage.getItem(CACHE_KEYS.PRACTICE_TESTS);
    if (cached) {
      try {
        const cachedTests = JSON.parse(cached);
        const processedTests = cachedTests.map((test: any) => ({
          ...test,
          createdAt: test.createdAt ? new Date(test.createdAt) : undefined,
        }));

        if (isCacheFresh(processedTests)) {
          setAllTests(processedTests);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached practice tests:', e);
        clearTestCache('practice');
      }
    }
    
    refresh();
    // eslint-disable-next-line
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try incremental update first if we have cached data
      const cachedTests = allTests.length > 0 ? allTests : (() => {
        if (typeof window === "undefined") return [];
        const cached = localStorage.getItem(CACHE_KEYS.PRACTICE_TESTS);
        if (!cached) return [];
        try {
          return JSON.parse(cached).map((test: any) => ({
            ...test,
            createdAt: test.createdAt ? new Date(test.createdAt) : undefined,
          }));
        } catch (e) {
          return [];
        }
      })();

      let lastSyncTime: Date | undefined;
      if (cachedTests.length > 0 && typeof window !== "undefined") {
        const lastSync = localStorage.getItem(CACHE_KEYS.PRACTICE_TESTS_LAST_SYNC);
        if (lastSync) {
          lastSyncTime = new Date(lastSync);
        }
      }

      // Fetch tests (incremental if we have a last sync time)
      const response = await getAllPracticeTests(lastSyncTime);
      
      if (response.success && response.data) {
        const newOrUpdatedTests = response.data;
        
        let finalTestList: Test[];
        
        if (lastSyncTime && cachedTests.length > 0) {
          // Incremental update: merge new/updated tests with cached tests
          const updatedTestsMap = new Map(newOrUpdatedTests.map(test => [test.id, test]));
          finalTestList = cachedTests.map((cachedTest: Test) => 
            updatedTestsMap.get(cachedTest.id) || cachedTest
          );
          
          // Add any completely new tests
          newOrUpdatedTests.forEach(test => {
            if (!cachedTests.some((cachedTest: Test) => cachedTest.id === test.id)) {
              finalTestList.push(test);
            }
          });
          
          // Sort by createdAt desc to maintain order
          finalTestList.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        } else {
          // Full refresh
          finalTestList = newOrUpdatedTests;
        }
        
        setAllTests(finalTestList);
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEYS.PRACTICE_TESTS, JSON.stringify(finalTestList));
          localStorage.setItem(CACHE_KEYS.PRACTICE_TESTS_LAST_SYNC, new Date().toISOString());
        }
      } else {
        setError(response.error || "Failed to fetch practice tests");
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [allTests]);

  const clearCache = useCallback(() => {
    clearTestCache('practice');
    setAllTests([]);
    setTests([]);
    setError(null);
  }, []);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        allTests
          .map(test => test.category)
          .filter((category): category is string => Boolean(category))
      )
    );
    allTests.forEach(test => {
        console.log('Category:', test.category);
        
    });
    return uniqueCategories.sort();
  }, [allTests]);

  return { 
    tests, 
    allTests,
    categories,
    loading, 
    error, 
    refresh, 
    updateTestLocal,
    clearCache 
  };
}

// Assessment Tests Hook
export function useAssessmentTests() {
  const [tests, setTests] = useState<AssessmentTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const updateTestLocal = useCallback((testId: string, updates: Partial<AssessmentTest>) => {
    setTests(prevTests => {
      const updatedTests = prevTests.map(test => 
        test.id === testId ? { 
          ...test, 
          ...updates
        } : test
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEYS.ASSESSMENT_TESTS, JSON.stringify(updatedTests));
        localStorage.setItem(CACHE_KEYS.ASSESSMENT_TESTS_LAST_SYNC, new Date().toISOString());
      }
      return updatedTests;
    });
  }, []);

  const isCacheFresh = useCallback((cachedTests: AssessmentTest[]): boolean => {
    if (typeof window === "undefined") return false;
    
    const lastSync = localStorage.getItem(CACHE_KEYS.ASSESSMENT_TESTS_LAST_SYNC);
    if (!lastSync) return false;

    const lastSyncTime = new Date(lastSync);
    return isCacheTimestampFresh(lastSyncTime);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const cached = localStorage.getItem(CACHE_KEYS.ASSESSMENT_TESTS);
    if (cached) {
      try {
        const cachedTests = JSON.parse(cached);
        const processedTests = cachedTests.map((test: any) => ({
          ...test,
          createdAt: test.createdAt ? new Date(test.createdAt) : undefined,
        }));

        if (isCacheFresh(processedTests)) {
          setTests(processedTests);
          setHasMore(processedTests.length > 0);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached assessment tests:', e);
        clearTestCache('assessment');
      }
    }
    
    refresh();
    // eslint-disable-next-line
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAssessmentTests([], 6);
      
      if (response.success && response.data) {
        setTests(response.data);
        setHasMore(response.data.length > 0);
        
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEYS.ASSESSMENT_TESTS, JSON.stringify(response.data));
          localStorage.setItem(CACHE_KEYS.ASSESSMENT_TESTS_LAST_SYNC, new Date().toISOString());
        }
      } else {
        setError(response.error || "Failed to fetch assessment tests");
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAssessmentTests(tests, 6);
      
      if (response.success && response.data) {
        const newTests = [...tests, ...response.data];
        setTests(newTests);
        setHasMore(response.data.length > 0);
        
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEYS.ASSESSMENT_TESTS, JSON.stringify(newTests));
          localStorage.setItem(CACHE_KEYS.ASSESSMENT_TESTS_LAST_SYNC, new Date().toISOString());
        }
      } else {
        setError(response.error || "Failed to load more assessment tests");
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [tests, loading, hasMore]);

  const clearCache = useCallback(() => {
    clearTestCache('assessment');
    setTests([]);
    setHasMore(true);
    setError(null);
  }, []);

  return { 
    tests, 
    loading, 
    error, 
    hasMore,
    refresh, 
    loadMore,
    updateTestLocal,
    clearCache 
  };
}

// Live Tests Hook
export function useLiveTests() {
  const [tests, setTests] = useState<LiveTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const updateTestLocal = useCallback((testId: string, updates: Partial<LiveTest>) => {
    setTests(prevTests => {
      const updatedTests = prevTests.map(test => 
        test.id === testId ? { 
          ...test, 
          ...updates
        } : test
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEYS.LIVE_TESTS, JSON.stringify(updatedTests));
        localStorage.setItem(CACHE_KEYS.LIVE_TESTS_LAST_SYNC, new Date().toISOString());
      }
      return updatedTests;
    });
  }, []);

  const isCacheFresh = useCallback((cachedTests: LiveTest[]): boolean => {
    if (typeof window === "undefined") return false;
    
    const lastSync = localStorage.getItem(CACHE_KEYS.LIVE_TESTS_LAST_SYNC);
    if (!lastSync) return false;

    const lastSyncTime = new Date(lastSync);
    return isCacheTimestampFresh(lastSyncTime);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const cached = localStorage.getItem(CACHE_KEYS.LIVE_TESTS);
    if (cached) {
      try {
        const cachedTests = JSON.parse(cached);
        const processedTests = cachedTests.map((test: any) => ({
          ...test,
          createdAt: test.createdAt ? new Date(test.createdAt) : undefined,
          startsAt: test.startsAt ? new Date(test.startsAt) : undefined,
        }));

        if (isCacheFresh(processedTests)) {
          setTests(processedTests);
          setHasMore(processedTests.length > 0);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached live tests:', e);
        clearTestCache('live');
      }
    }
    
    refresh();
    // eslint-disable-next-line
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getLiveTests([], 3);
      
      if (response.success && response.data) {
        setTests(response.data);
        setHasMore(response.data.length > 0);
        
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEYS.LIVE_TESTS, JSON.stringify(response.data));
          localStorage.setItem(CACHE_KEYS.LIVE_TESTS_LAST_SYNC, new Date().toISOString());
        }
      } else {
        setError(response.error || "Failed to fetch live tests");
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getLiveTests(tests, 3);
      
      if (response.success && response.data) {
        const newTests = [...tests, ...response.data];
        setTests(newTests);
        setHasMore(response.data.length > 0);
        
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEYS.LIVE_TESTS, JSON.stringify(newTests));
          localStorage.setItem(CACHE_KEYS.LIVE_TESTS_LAST_SYNC, new Date().toISOString());
        }
      } else {
        setError(response.error || "Failed to load more live tests");
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [tests, loading, hasMore]);

  const clearCache = useCallback(() => {
    clearTestCache('live');
    setTests([]);
    setHasMore(true);
    setError(null);
  }, []);

  return { 
    tests, 
    loading, 
    error, 
    hasMore,
    refresh, 
    loadMore,
    updateTestLocal,
    clearCache 
  };
}
