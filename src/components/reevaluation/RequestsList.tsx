import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReEvaluationTimeline } from './ReEvaluationTimeline';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { 
  RefreshCcw, 
  Clock, 
  Calendar, 
  FileText, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ReEvaluationRequest, ReEvaluationStatus } from '@/types/blockchain';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface RequestsListProps {
  requests: ReEvaluationRequest[];
  onViewDetails?: (request: ReEvaluationRequest) => void;
}

const statusConfig: Record<ReEvaluationStatus, {
  label: string;
  variant: 'pending' | 'success' | 'destructive' | 'warning' | 'info' | 'default';
  icon: React.ComponentType<{ className?: string }>;
}> = {
  submitted: { label: 'Submitted', variant: 'info', icon: FileText },
  under_review: { label: 'Under Review', variant: 'pending', icon: Clock },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  marks_updated: { label: 'Marks Updated', variant: 'warning', icon: RefreshCcw },
  pending_verification: { label: 'Pending Verification', variant: 'pending', icon: Loader2 },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
};

export function RequestsList({ requests, onViewDetails }: RequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <RefreshCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No Re-Evaluation Requests</h3>
        <p className="text-muted-foreground mt-1">
          You haven't submitted any re-evaluation requests yet
        </p>
        <Button className="mt-4" asChild>
          <Link to="/request-reevaluation">
            Submit New Request
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const status = statusConfig[request.status];
        const StatusIcon = status.icon;
        const subjectNames = request.subjects.length > 2 
          ? `${request.subjects.slice(0, 2).join(', ')} +${request.subjects.length - 2} more`
          : request.subjects.join(', ');

        return (
          <Card 
            key={request.id} 
            variant="interactive"
            className="cursor-pointer"
            onClick={() => onViewDetails?.(request)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    status.variant === 'success' && "bg-success/10",
                    status.variant === 'destructive' && "bg-destructive/10",
                    status.variant === 'warning' && "bg-warning/10",
                    status.variant === 'pending' && "bg-warning/10",
                    status.variant === 'info' && "bg-info/10",
                    status.variant === 'default' && "bg-muted"
                  )}>
                    <StatusIcon className={cn(
                      "h-6 w-6",
                      status.variant === 'success' && "text-success",
                      status.variant === 'destructive' && "text-destructive",
                      status.variant === 'warning' && "text-warning",
                      status.variant === 'pending' && "text-warning animate-spin",
                      status.variant === 'info' && "text-info",
                      status.variant === 'default' && "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{request.id}</h3>
                      <Badge 
                        variant={
                          status.variant === 'success' ? 'success' :
                          status.variant === 'destructive' ? 'destructive' :
                          status.variant === 'warning' ? 'warning' :
                          status.variant === 'pending' ? 'pending' :
                          'default'
                        }
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {subjectNames}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(request.createdAt, 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last updated {format(request.updatedAt, 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface RequestDetailsProps {
  request: ReEvaluationRequest;
  onClose: () => void;
}

export function RequestDetails({ request, onClose }: RequestDetailsProps) {
  const status = statusConfig[request.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{request.id}</h2>
            <Badge 
              variant={
                status.variant === 'success' ? 'success' :
                status.variant === 'destructive' ? 'destructive' :
                status.variant === 'warning' ? 'warning' :
                'pending'
              }
            >
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Submitted on {format(request.createdAt, 'MMMM d, yyyy')}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to List
        </Button>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ReEvaluationTimeline 
            events={request.timeline} 
            currentStatus={request.status} 
          />
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.subjects.map((subject) => (
                <div 
                  key={subject}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{subject}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{request.reason}</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      {request.supportingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.supportingDocuments.map((doc, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>{doc}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Info */}
      {request.timeline.some((e) => e.transactionHash) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blockchain Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {request.timeline
                .filter((e) => e.transactionHash)
                .map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-blockchain/5 border border-blockchain/20"
                  >
                    <div>
                      <p className="font-medium">{statusConfig[event.status].label}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.timestamp, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <TransactionHash hash={event.transactionHash!} />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
