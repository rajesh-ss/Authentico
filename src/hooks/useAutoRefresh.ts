import { useState, useEffect, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number;
  enabled?: boolean;
  onRefresh?: () => void;
}

interface UseAutoRefreshReturn {
  lastUpdated: Date;
  isRefreshing: boolean;
  autoRefresh: boolean;
  countdown: number;
  setAutoRefresh: (enabled: boolean) => void;
  refresh: () => void;
}

export function useAutoRefresh({
  interval = 30000,
  enabled = true,
  onRefresh,
}: UseAutoRefreshOptions = {}): UseAutoRefreshReturn {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(enabled);
  const [countdown, setCountdown] = useState(Math.floor(interval / 1000));
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setLastUpdated(new Date());
      setIsRefreshing(false);
      onRefresh?.();
    }, 500);
  }, [onRefresh]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      refresh();
    }, interval);

    return () => clearInterval(timer);
  }, [autoRefresh, interval, refresh]);

  // Countdown timer
  useEffect(() => {
    if (!autoRefresh) {
      setCountdown(Math.floor(interval / 1000));
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return Math.floor(interval / 1000);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshKey, interval]);

  return {
    lastUpdated,
    isRefreshing,
    autoRefresh,
    countdown,
    setAutoRefresh,
    refresh,
  };
}
