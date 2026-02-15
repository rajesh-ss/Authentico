import { useMemo } from 'react';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

interface UseDateTimeOptions {
  /**
   * The format string to use (date-fns format).
   * @default 'PPP' (e.g., Apr 29th, 2023)
   */
  formatStr?: string;
  /**
   * If true, returns a relative time string (e.g., '3 days ago').
   * @default false
   */
  relative?: boolean;
  /**
   * If true, adds a suffix to the relative time string (e.g., 'ago').
   * @default true
   */
  addSuffix?: boolean;
  /**
   * If true, converts the date to UTC before formatting.
   * Note: This implementation uses native Date UTC methods for simple formatting.
   * @default false
   */
  useUTC?: boolean;
  /**
   * Fallback string to return if the date is invalid.
   * @default 'Invalid Date'
   */
  fallback?: string;
}

/**
 * A flexible hook for formatting dates and times.
 * Supports string, number, and Date objects.
 */
export function useDateTime(
  dateInput: string | number | Date | null | undefined,
  options: UseDateTimeOptions = {}
) {
  const {
    formatStr = 'PPP',
    relative = false,
    addSuffix = true,
    useUTC = false,
    fallback = 'Invalid Date',
  } = options;

  return useMemo(() => {
    if (!dateInput) return fallback;

    let date: Date;
    if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else {
      date = new Date(dateInput);
    }

    if (!isValid(date)) return fallback;

    if (relative) {
      return formatDistanceToNow(date, { addSuffix });
    }

    if (useUTC) {
      // Create a date object that represents the UTC time as if it were local
      // This is a common trick for simple UTC formatting without extra libs
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      );
      return format(utcDate, formatStr);
    }

    return format(date, formatStr);
  }, [dateInput, formatStr, relative, addSuffix, useUTC, fallback]);
}
