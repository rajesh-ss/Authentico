import { cn } from '@/lib/utils';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { format } from 'date-fns';
import { CheckCircle2, Upload, RefreshCcw, Shield, FileText, Users } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'issue' | 'upload' | 'reevaluation' | 'verification' | 'approval' | 'user';
  title: string;
  description: string;
  timestamp: Date;
  actor: string;
  transactionHash?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  maxItems?: number;
}

const eventConfig = {
  issue: { icon: FileText, color: 'text-success', bg: 'bg-success/10' },
  upload: { icon: Upload, color: 'text-accent', bg: 'bg-accent/10' },
  reevaluation: { icon: RefreshCcw, color: 'text-warning', bg: 'bg-warning/10' },
  verification: { icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
  approval: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  user: { icon: Users, color: 'text-info', bg: 'bg-info/10' },
};

export function ActivityTimeline({ events, maxItems = 5 }: ActivityTimelineProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {displayEvents.map((event, index) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        const isLast = index === displayEvents.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div className={cn(
              "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              config.bg
            )}>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {format(event.timestamp, 'h:mm a')}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground">by {event.actor}</span>
                {event.transactionHash && (
                  <TransactionHash 
                    hash={event.transactionHash} 
                    showLink={false}
                    showCopy={false}
                    className="text-[10px]"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
