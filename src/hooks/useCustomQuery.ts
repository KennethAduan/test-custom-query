import { useState, useEffect, useRef, useCallback } from "react";

// Define types for the cache and options
type Cache = Record<string, any>;
type QueryOptions = {
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
};

// Cache for in-memory storage
export const inMemoryCache: Cache = {};

// Helper function for delaying (mimicking stale time handling)
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCustomQuery<T>(
  queryKey: string,
  fetchFunction: () => Promise<Response>,
  options: QueryOptions = {}
) {
  const { staleTime = 5000, refetchOnWindowFocus = true } = options;

  // State management for data, error, and loading states
  const [data, setData] = useState<T | null>(
    () => inMemoryCache[queryKey] || null
  );
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!inMemoryCache[queryKey]);

  // Refs to keep track of the last fetch time and prevent unnecessary fetches
  const lastFetchRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(false);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(
    async (force: boolean = false) => {
      const now = Date.now();
      const isCacheStale = now - lastFetchRef.current > staleTime;

      if (!force && !isCacheStale && inMemoryCache[queryKey]) {
        console.log(`[${queryKey}] Cache hit, skipping fetch`);
        return;
      }

      // Increment and log fetch count
      fetchCountRef.current += 1;
      console.log(`[${queryKey}] Fetch attempt #${fetchCountRef.current}`);

      setIsLoading(true);
      try {
        const result = await fetchFunction();
        const jsonData: T = await result.json();
        inMemoryCache[queryKey] = jsonData;
        setData(jsonData);
        setError(null);
        lastFetchRef.current = now;
        console.log(`[${queryKey}] Fetch successful`);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
        setData(null);
        console.error(`[${queryKey}] Fetch error:`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [queryKey, fetchFunction, staleTime]
  );

  // Use a single useEffect for initial fetch
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  // Optional: Refetch on window focus (similar to React Query)
  useEffect(() => {
    const handleFocus = () => {
      if (refetchOnWindowFocus) {
        fetchData(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, fetchData]);

  return {
    data,
    error,
    isLoading,
    refetch: () => fetchData(true),
    fetchCount: fetchCountRef.current,
  };
}
