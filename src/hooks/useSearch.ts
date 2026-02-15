import { useState, useMemo, useCallback } from 'react';

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterField?: keyof T;
  filterValue?: string;
}

interface UseSearchReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  filteredData: T[];
  resetFilters: () => void;
}

export function useSearch<T>({
  data,
  searchFields,
  filterField,
  filterValue: initialFilterValue = 'all',
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState(initialFilterValue);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        });

      // Category filter
      const matchesFilter =
        filterValue === 'all' ||
        (filterField &&
          (() => {
            const val = item[filterField];
            if (Array.isArray(val)) {
              return (val as string[]).includes(filterValue);
            }
            return val === filterValue;
          })());

      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filterValue, searchFields, filterField]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterValue('all');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    filteredData,
    resetFilters,
  };
}
