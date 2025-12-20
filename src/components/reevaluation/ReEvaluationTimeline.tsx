import { ReEvaluationTimelineEvent, ReEvaluationStatus } from '@/types/blockchain';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Clock, 
  Shield,
  Loader2
} from 'lucide-react';

interface ReEvaluationTimelineProps {
  events: ReEvaluationTimelineEvent[];
  currentStatus: ReEvaluationStatus;
}

const statusConfig: Record<ReEvaluationStatus, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bg: string;
}> = {
  submitted: {
    icon: FileText,
    label: 'Submitted',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  under_review: {
    icon: Search,
    label: 'Under Review',
    color: 'text-info',
    bg: 'bg-info/10',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  marks_updated: {
    icon: RefreshCcw,
    label: 'Marks Updated',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  pending_verification: {
    icon: Clock,
    label: 'Pending Verification',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  completed: {
    icon: Shield,
    label: 'Completed',
    color: 'text-success',
    bg: 'bg-success/10',
  },
};

const allSteps: ReEvaluationStatus[] = [
  'submitted',
  'under_review',
  'approved',
  'marks_updated',
  'pending_verification',
  'completed',
];

export function ReEvaluationTimeline({ events, currentStatus }: ReEvaluationTimelineProps) {
  const currentIndex = allSteps.indexOf(currentStatus);
  const isRejected = currentStatus === 'rejected';

  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
      
      {/* Progress bar fill */}
      <div 
        className={cn(
          "absolute top-5 left-0 h-0.5 transition-all duration-500",
          isRejected ? "bg-destructive" : "bg-success"
        )}
        style={{ 
          width: isRejected 
            ? `${((allSteps.indexOf('under_review') + 1) / allSteps.length) * 100}%`
            : `${((currentIndex + 1) / allSteps.length) * 100}%` 
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {allSteps.map((step, index) => {
          const config = statusConfig[step];
          const Icon = config.icon;
          const event = events.find(e => e.status === step);
          
          const isCompleted = index < currentIndex || currentStatus === 'completed';
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const isRejectedStep = isRejected && step === 'approved';

          return (
            <div key={step} className="flex flex-col items-center">
              {/* Step circle */}
              <div 
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted && "bg-success border-success",
                  isCurrent && !isRejected && "bg-accent border-accent pulse-pending",
                  isPending && "bg-background border-border",
                  isRejectedStep && "bg-destructive border-destructive",
                  isRejected && step === 'under_review' && "bg-destructive border-destructive"
                )}
              >
                {isCurrent && !isRejected ? (
                  <Loader2 className="h-5 w-5 text-accent-foreground animate-spin" />
                ) : isRejectedStep ? (
                  <XCircle className="h-5 w-5 text-destructive-foreground" />
                ) : (
                  <Icon 
                    className={cn(
                      "h-5 w-5",
                      isCompleted && "text-success-foreground",
                      isPending && "text-muted-foreground",
                      isRejected && step === 'under_review' && "text-destructive-foreground"
                    )} 
                  />
                )}
              </div>

              {/* Label */}
              <span 
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  (isCompleted || isCurrent) && "text-foreground",
                  isPending && "text-muted-foreground",
                  isRejectedStep && "text-destructive"
                )}
              >
                {isRejectedStep ? 'Rejected' : config.label}
              </span>

              {/* Event details */}
              {event && (
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    {format(event.timestamp, 'MMM d, h:mm a')}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {event.actor}
                  </p>
                  {event.transactionHash && (
                    <div className="mt-1">
                      <TransactionHash 
                        hash={event.transactionHash} 
                        showLink={false} 
                        showCopy={false}
                        className="text-[8px]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
