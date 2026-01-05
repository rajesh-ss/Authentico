import { useState, useMemo, useCallback } from 'react';
import { subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface UseDateRangeFilterOptions {
  initialDays?: number;
}

type DateFieldExtractor<T> = (item: T) => Date | string;

interface UseDateRangeFilterReturn {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  setLast7Days: () => void;
  setLast30Days: () => void;
  setLast90Days: () => void;
  filterByDateRange: <T>(data: T[], dateExtractor: DateFieldExtractor<T>) => T[];
}

export function useDateRangeFilter({
  initialDays = 30,
}: UseDateRangeFilterOptions = {}): UseDateRangeFilterReturn {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), initialDays),
    to: new Date(),
  });

  const setLast7Days = useCallback(() => {
    setDateRange({ from: subDays(new Date(), 7), to: new Date() });
  }, []);

  const setLast30Days = useCallback(() => {
    setDateRange({ from: subDays(new Date(), 30), to: new Date() });
  }, []);

  const setLast90Days = useCallback(() => {
    setDateRange({ from: subDays(new Date(), 90), to: new Date() });
  }, []);

  const filterByDateRange = useCallback(<T,>(
    data: T[],
    dateExtractor: DateFieldExtractor<T>
  ): T[] => {
    if (!dateRange?.from || !dateRange?.to) return data;
    
    return data.filter((item) => {
      const dateValue = dateExtractor(item);
      const itemDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return isWithinInterval(itemDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      });
    });
  }, [dateRange]);

  return {
    dateRange,
    setDateRange,
    setLast7Days,
    setLast30Days,
    setLast90Days,
    filterByDateRange,
  };
}
