import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for debouncing values to reduce API calls
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * @param callback - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());

  return ((...args) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    }
  }) as T;
}

/**
 * Custom hook for caching expensive computations
 * @param computeFn - Function to compute the value
 * @param dependencies - Dependencies array
 * @param cacheKey - Optional cache key for persistence
 * @returns Cached value and cache management functions
 */
export function useComputedCache<T>(
  computeFn: () => T,
  dependencies: any[],
  cacheKey?: string
) {
  const [cachedValue, setCachedValue] = useState<T | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const lastDepsRef = useRef<any[]>([]);

  // Check if dependencies have changed
  const depsChanged = dependencies.some(
    (dep, index) => dep !== lastDepsRef.current[index]
  );

  useEffect(() => {
    if (depsChanged || cachedValue === null) {
      setIsComputing(true);
      
      // Use requestIdleCallback for non-blocking computation
      const computeAsync = () => {
        try {
          const result = computeFn();
          setCachedValue(result);
          lastDepsRef.current = [...dependencies];
          
          // Optionally cache to localStorage
          if (cacheKey && typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                `computed_cache_${cacheKey}`,
                JSON.stringify({
                  value: result,
                  timestamp: Date.now(),
                  dependencies: dependencies
                })
              );
            } catch (e) {
              console.warn('Failed to cache computed value:', e);
            }
          }
        } catch (error) {
          console.error('Computation failed:', error);
        } finally {
          setIsComputing(false);
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(computeAsync);
      } else {
        setTimeout(computeAsync, 0);
      }
    }
  }, [depsChanged, cachedValue, computeFn, dependencies, cacheKey]);

  // Try to load from cache on mount
  useEffect(() => {
    if (cacheKey && typeof window !== 'undefined' && cachedValue === null) {
      try {
        const cached = localStorage.getItem(`computed_cache_${cacheKey}`);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const cacheAge = Date.now() - parsedCache.timestamp;
          
          // Use cache if less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            setCachedValue(parsedCache.value);
            lastDepsRef.current = parsedCache.dependencies || [];
          }
        }
      } catch (e) {
        console.warn('Failed to load cached value:', e);
      }
    }
  }, [cacheKey]);

  const clearCache = () => {
    setCachedValue(null);
    if (cacheKey && typeof window !== 'undefined') {
      localStorage.removeItem(`computed_cache_${cacheKey}`);
    }
  };

  return {
    value: cachedValue,
    isComputing,
    clearCache
  };
}
