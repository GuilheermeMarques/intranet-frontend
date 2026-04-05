import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll<T>(
  items: T[],
  pageSize: number,
  options: UseInfiniteScrollOptions = {},
) {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(items.length / pageSize);
  const currentItems = items.slice(0, currentPage * pageSize);

  useEffect(() => {
    setHasMore(currentPage < totalPages);
  }, [currentPage, totalPages]);

  const loadMore = useCallback(() => {
    if (hasMore && enabled) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, enabled]);

  useEffect(() => {
    if (!enabled || !loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observerRef.current = observer;
    observer.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, threshold, rootMargin, enabled]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  return {
    currentItems,
    hasMore,
    loadingRef,
    reset,
    currentPage,
    totalPages,
  };
}
