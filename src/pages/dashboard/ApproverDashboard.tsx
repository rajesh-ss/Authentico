import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsGrid } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Pen, CheckCircle2, Clock, User, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { workflowService, ReevaluationItem, DetailsChangeItem } from '@/services/workflow.service';

export default function ApproverDashboard() {
  const [detailsRequests, setDetailsRequests] = useState<DetailsChangeItem[]>([]);
  const [reevaluationRequests, setReevaluationRequests] = useState<ReevaluationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        const response = await workflowService.getPendingRequests();
        if (response.success) {
          const reevalRequests = response.data.filter(
            (item): item is ReevaluationItem =>
              item.type === 'REEVALUATION' && item.status === 'PENDING_APPROVER'
          );
          const detailsChanges = response.data.filter(
            (item): item is DetailsChangeItem =>
              item.type === 'DETAILS_CHANGE' && item.status === 'PENDING_APPROVER'
          );

          setReevaluationRequests(reevalRequests);
          setDetailsRequests(detailsChanges);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        toast.error('Failed to load pending requests');
      } finally {
        setLoading(false);
      }
    };

    fetchAllRequests();
  }, []);

  const handleAction = async (
    id: string,
    type: 'REEVALUATION' | 'DETAILS_CHANGE',
    action: 'APPROVE' | 'REJECT'
  ) => {
    try {
      await workflowService.processAction({ requestId: id, type, action });
      toast.success(`Request ${action.toLowerCase()}d successfully`);
      // Refresh data
      const response = await workflowService.getPendingRequests();
      if (response.success) {
        const reevalRequests = response.data.filter(
          (item): item is ReevaluationItem =>
            item.type === 'REEVALUATION' && item.status === 'PENDING_APPROVER'
        );
        const detailsChanges = response.data.filter(
          (item): item is DetailsChangeItem =>
            item.type === 'DETAILS_CHANGE' && item.status === 'PENDING_APPROVER'
        );
        setReevaluationRequests(reevalRequests);
        setDetailsRequests(detailsChanges);
      }
    } catch (err) {
      console.error('Error processing action:', err);
      toast.error(`Failed to ${action.toLowerCase()} request`);
    }
  };

  const stats = [
    {
      icon: Pen,
      value: reevaluationRequests.length + detailsRequests.length,
      label: 'Pending',
      color: 'warning' as const,
    },
    { icon: CheckCircle2, value: 4, label: 'Approved Today', color: 'success' as const },
    { icon: Clock, value: 3, label: 'Awaiting Others', color: 'accent' as const },
    { icon: Shield, value: 128, label: 'Total Approved', color: 'primary' as const },
  ];

  if (loading) {
    return (
      <DashboardLayout
        title="Approver Dashboard"
        subtitle="Final approval and blockchain verification"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Approver Dashboard"
      subtitle="Final approval and blockchain verification"
    >
      <StatsGrid stats={stats} columns={4} />

      <div className="space-y-6">
        {/* Details Change Requests Section */}
        {detailsRequests.length > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Pending Details Approvals
              </CardTitle>
              <Badge variant="default">{detailsRequests.length} pending</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailsRequests.map((req) => (
                  <div key={req._id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">ID: {req._id.slice(-8).toUpperCase()}</span>
                          <span>• {format(new Date(req.createdAt), 'MMM d, h:mm a')}</span>
                          <span>• Recommended by: {req.requestedBy.slice(0, 8)}...</span>
                        </div>
                        <p className="font-medium">Student Roll No: {req.rollNo}</p>
                        <div className="space-y-1">
                          {Object.entries(req.changes).map(([field, val]) => (
                            <div key={field} className="flex items-center gap-2 text-sm">
                              <span className="font-medium capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="font-bold text-primary">{val as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Button
                          size="sm"
                          onClick={() => handleAction(req._id, 'DETAILS_CHANGE', 'APPROVE')}
                          className="bg-primary hover:bg-primary/90 text-white gap-2"
                        >
                          <Pen className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(req._id, 'DETAILS_CHANGE', 'REJECT')}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Re-Evaluation Requests Section */}
        {reevaluationRequests.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Marks Re-Evaluation</CardTitle>
              <Badge variant="warning">{reevaluationRequests.length} pending</Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {reevaluationRequests.map((request) => (
                  <div
                    key={request._id}
                    className="border rounded-lg p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge variant="outline" className="font-mono">
                            {request._id.slice(-8).toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              Roll No: {request.rollNo}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            Subject: {request.subjectCode}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Pass Year: {request.passYear}
                          </Badge>
                        </div>
                        {request.reason && (
                          <div className="flex items-start gap-2 mb-3">
                            <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">{request.reason}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAction(request._id, 'REEVALUATION', 'APPROVE')}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Pen className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(request._id, 'REEVALUATION', 'REJECT')}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
