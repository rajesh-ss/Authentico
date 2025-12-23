import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatItem {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent' | 'info';
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: number;
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
};

export function StatsGrid({ stats, columns = 5, className }: StatsGridProps) {
  return (
    <div 
      className={cn(
        'grid gap-3 md:gap-4 mb-6',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-2 md:grid-cols-3',
        columns === 4 && 'grid-cols-2 md:grid-cols-4',
        columns === 5 && 'grid-cols-2 md:grid-cols-5',
        className
      )}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClass = colorClasses[stat.color || 'primary'];
        
        return (
          <Card key={index} className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={cn('h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
