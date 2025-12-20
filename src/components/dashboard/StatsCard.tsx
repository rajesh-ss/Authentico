import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'blockchain' | 'danger';
}

export function StatsCard({ title, value, change, icon: Icon, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    default: 'border-l-primary',
    success: 'border-l-success',
    warning: 'border-l-warning',
    blockchain: 'border-l-accent',
    danger: 'border-l-destructive',
  };

  const iconBgStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    blockchain: 'bg-accent/10 text-accent',
    danger: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card variant="stats" className={cn("p-5", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                change.trend === 'up' && "text-success",
                change.trend === 'down' && "text-destructive",
                change.trend === 'neutral' && "text-muted-foreground"
              )}>
                {change.trend === 'up' && '+'}
                {change.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconBgStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
