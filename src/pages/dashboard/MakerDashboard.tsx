import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsGrid } from '@/components/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { workflowService, WorkflowItem } from '@/services/workflow.service';
import { format } from 'date-fns';

export default function MakerDashboard() {
  const [requests, setRequests] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await workflowService.getPendingRequests();
        if (response.success) {
          setRequests(response.data);
        } else {
          setError(response.message || 'Failed to fetch pending requests');
        }
      } catch (err) {
        setError('Failed to fetch requests. Please try again.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const stats = [
    {
      label: 'Pending Requests',
      value: requests.length,
      icon: Clock,
      trend: { value: requests.length, isPositive: false },
    },
    {
      label: 'Approved This Week',
      value: '0',
      icon: CheckCircle,
      trend: { value: 0, isPositive: true },
    },
    { label: 'Rejected This Week', value: '0', icon: XCircle },
    {
      label: 'Total Reviewed',
      value: '0',
      icon: ClipboardCheck,
      trend: { value: 0, isPositive: true },
    },
  ];

  return (
    <DashboardLayout title="Maker Dashboard" subtitle="Overview of pending student requests">
      <div className="space-y-6">
        <StatsGrid stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pending Workflow Requests
            </CardTitle>
            <CardDescription>Recent automated requests awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading requests...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12 text-destructive">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && requests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending requests found</p>
              </div>
            )}

            {!loading && !error && requests.length > 0 && (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {request._id.slice(-8).toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), 'PPp')}
                          </span>
                          <Badge
                            variant={request.status.includes('REJECT') ? 'destructive' : 'warning'}
                            className="text-xs"
                          >
                            {request.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {request.type}
                          </Badge>
                        </div>

                        <div>
                          <p className="font-medium">Student Roll No: {request.rollNo}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            Requested by: {request.requestedBy}
                          </p>
                        </div>

                        {/* Details Change Specific */}
                        {request.type === 'DETAILS_CHANGE' && (
                          <div className="space-y-2">
                            {Object.entries(request.changes).map(([field, value]) => (
                              <div
                                key={field}
                                className="flex items-center gap-3 p-2 rounded bg-muted/50 max-w-2xl"
                              >
                                <span className="text-sm font-medium min-w-[120px] capitalize">
                                  {field.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium text-primary break-all">
                                  {value as string}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Re-evaluation Specific */}
                        {request.type === 'REEVALUATION' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 rounded bg-muted/50 max-w-2xl">
                              <span className="text-sm font-medium min-w-[120px]">
                                Subject Code
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-primary">
                                {request.subjectCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded bg-muted/50 max-w-2xl">
                              <span className="text-sm font-medium min-w-[120px]">Pass Year</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-primary">
                                {request.passYear}
                              </span>
                            </div>
                          </div>
                        )}

                        {request.reason && (
                          <div className="p-2 bg-muted/30 rounded text-sm text-muted-foreground italic">
                            "{request.reason}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 min-w-[120px] pt-2 md:pt-0">
                        <a href="/maker/approvals">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 flex-1 md:flex-none w-full"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
