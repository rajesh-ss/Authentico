import { Badge } from '@/components/ui/badge';
import { TransactionStatus } from '@/types/blockchain';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

interface TransactionBadgeProps {
  status: TransactionStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function TransactionBadge({ status, showIcon = true, size = 'default' }: TransactionBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      variant: 'pending' as const,
      icon: Loader2,
      iconClass: 'animate-spin',
    },
    confirmed: {
      label: 'Confirmed',
      variant: 'confirmed' as const,
      icon: CheckCircle2,
      iconClass: '',
    },
    failed: {
      label: 'Failed',
      variant: 'failed' as const,
      icon: XCircle,
      iconClass: '',
    },
  };

  const { label, variant, icon: Icon, iconClass } = config[status];

  return (
    <Badge 
      variant={variant} 
      className={`gap-1 ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}`}
    >
      {showIcon && <Icon className={`h-3 w-3 ${iconClass}`} />}
      {label}
    </Badge>
  );
}
