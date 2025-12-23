import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, RefreshCcw, AlertCircle, FileCheck } from 'lucide-react';

type StatusType = 
  | 'active' | 'inactive' 
  | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'marks_updated' | 'pending_verification' | 'completed'
  | 'issued' | 'reevaluated' | 'superseded'
  | 'pending' | 'confirmed' | 'failed';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  icon?: React.ComponentType<{ className?: string }>;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // User status
  active: { label: 'Active', variant: 'success', icon: CheckCircle },
  inactive: { label: 'Inactive', variant: 'secondary', icon: XCircle },
  
  // Re-evaluation status
  submitted: { label: 'Submitted', variant: 'secondary', icon: Clock },
  under_review: { label: 'Under Review', variant: 'warning', icon: RefreshCcw },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  marks_updated: { label: 'Marks Updated', variant: 'default', icon: FileCheck },
  pending_verification: { label: 'Pending Verification', variant: 'warning', icon: Clock },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
  
  // Marks card status
  issued: { label: 'Original', variant: 'success' },
  reevaluated: { label: 'Re-evaluated', variant: 'warning' },
  superseded: { label: 'Superseded', variant: 'secondary' },
  
  // Blockchain status
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'success', icon: CheckCircle },
  failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  label?: string;
  className?: string;
  size?: 'sm' | 'default';
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  label,
  className,
  size = 'default',
}: StatusBadgeProps) {
  const config = statusConfigs[status] || { label: status, variant: 'secondary' as const };
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        size === 'sm' && 'text-xs px-1.5 py-0',
        className
      )}
    >
      {showIcon && Icon && <Icon className={cn('h-3 w-3', (label || config.label) && 'mr-1')} />}
      {label || config.label}
    </Badge>
  );
}

export { statusConfigs };
export type { StatusType };
