import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  paginatedData: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  startIndex: number;
  endIndex: number;
  setPageSize: (size: number) => void;
}

export function usePagination<T>({
  data,
  pageSize: initialPageSize = 10,
  initialPage = 0,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(data.length / pageSize)), 
    [data.length, pageSize]
  );

  // Reset to first page if current page exceeds total pages
  const validatedPage = useMemo(() => 
    Math.min(currentPage, totalPages - 1),
    [currentPage, totalPages]
  );

  const paginatedData = useMemo(() => {
    const start = validatedPage * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, validatedPage, pageSize]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(0);
  }, []);

  const startIndex = validatedPage * pageSize + 1;
  const endIndex = Math.min((validatedPage + 1) * pageSize, data.length);

  return {
    currentPage: validatedPage,
    totalPages,
    pageSize,
    paginatedData,
    setPage,
    nextPage,
    prevPage,
    canGoNext: validatedPage < totalPages - 1,
    canGoPrev: validatedPage > 0,
    startIndex,
    endIndex,
    setPageSize,
  };
}
