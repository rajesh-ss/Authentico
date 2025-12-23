import { LucideIcon, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  message = 'No data found',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-3" />
      {title && <h3 className="font-medium text-foreground mb-1">{title}</h3>}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
