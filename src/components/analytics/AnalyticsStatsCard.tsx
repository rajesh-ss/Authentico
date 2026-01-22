import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AnalyticsStatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

export function AnalyticsStatsCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  className,
}: AnalyticsStatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardDescription className={cn(Icon && 'flex items-center gap-2')}>
          {Icon && <Icon className={cn('h-4 w-4', iconClassName)} />}
          {title}
        </CardDescription>
        <CardTitle className={cn('text-2xl lg:text-3xl', valueClassName)}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
