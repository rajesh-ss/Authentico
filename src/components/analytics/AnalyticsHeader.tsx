import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface AnalyticsHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  setLast7Days: () => void;
  setLast30Days: () => void;
  setLast90Days: () => void;
  lastUpdated: Date;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  countdown: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AnalyticsHeader({
  dateRange,
  setDateRange,
  setLast7Days,
  setLast30Days,
  setLast90Days,
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  countdown,
  isRefreshing,
  onRefresh,
}: AnalyticsHeaderProps) {
  return (
    <>
      {/* Page Header with Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into credential issuance, verification, and security
          </p>
        </div>
        
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full sm:w-auto sm:min-w-[280px]",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Select date range"
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              className="pointer-events-auto sm:hidden"
            />
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="pointer-events-auto hidden sm:block"
            />
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 p-3 border-t">
              <Button variant="ghost" size="sm" onClick={setLast7Days}>
                7 days
              </Button>
              <Button variant="ghost" size="sm" onClick={setLast30Days}>
                30 days
              </Button>
              <Button variant="ghost" size="sm" onClick={setLast90Days}>
                90 days
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Auto-refresh Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </span>
          </div>
          {autoRefresh && (
            <Badge variant="secondary" className="text-xs">
              Next refresh in {countdown}s
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
              Auto-refresh
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </Button>
        </div>
      </div>
    </>
  );
}
