import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StatsGrid } from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/shared';
import { useSearch } from '@/hooks/useSearch';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Hash,
  FileText,
  Search,
  ArrowRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { format } from 'date-fns';

import { toast } from 'sonner';
import { detailsChangeService, DetailsChangeData } from '@/services/details-change.service';

const getFieldIcon = (field: string) => {
  if (field.toLowerCase().includes('name')) return User;
  if (field.toLowerCase().includes('roll')) return Hash;
  return FileText;
};

export default function MakerDetailsApprovals() {
  const [requests, setRequests] = useState<DetailsChangeData[]>([]);
  const [loading, setLoading] = useState(true);
  const viewDialog = useDialog<DetailsChangeData>();

  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComment, setActionComment] = useState('');
  const actionDialog = useDialog<DetailsChangeData>();

  // Refresh data function
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await detailsChangeService.getPendingRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRequests();
  }, []);

  const { searchQuery, setSearchQuery, filteredData } = useSearch<DetailsChangeData>({
    data: requests,
    searchFields: ['rollNo', '_id', 'requestedBy'],
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status.includes('PENDING')).length,
  };

  const stats = [
    { label: 'Total Requests', value: counts.all.toString(), icon: Clock },
    {
      label: 'Pending',
      value: counts.pending.toString(),
      icon: AlertCircle,
      color: 'warning' as const,
    },
  ];

  const openActionDialog = (request: DetailsChangeData, action: 'approve' | 'reject') => {
    setActionType(action);
    setActionComment('');
    actionDialog.open(request);
  };

  const handleAction = async () => {
    if (!actionDialog.data || !actionType) return;

    try {
      if (actionType === 'approve') {
        await detailsChangeService.approveRequest(actionDialog.data._id);
        toast.success('Request approved successfully');
      } else {
        await detailsChangeService.rejectRequest(actionDialog.data._id, actionComment);
        toast.success('Request rejected successfully');
      }

      actionDialog.close();
      loadRequests();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(`Failed to ${actionType} request`);
    }
  };

  return (
    <DashboardLayout
      title="Details Update Requests"
      subtitle="Review and approve student details correction requests"
    >
      <div className="space-y-6">
        <StatsGrid stats={stats} />

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or request..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Workflow Info */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">Approval Workflow:</span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  Student
                </Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="default" className="text-xs">
                  Maker (You)
                </Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs">
                  Checker
                </Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs">
                  Approver
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading requests...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No details update requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((request) => {
              // We'll just take the first change key for the icon, or generic
              const firstChangeKey = Object.keys(request.changes)[0] || 'details';
              const FieldIcon = getFieldIcon(firstChangeKey);

              return (
                <Card key={request._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {request._id.slice(-8).toUpperCase()}
                          </Badge>
                          <Badge
                            variant={request.status.includes('PENDING') ? 'warning' : 'secondary'}
                            className="text-xs"
                          >
                            {request.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>

                        <div>
                          <p className="font-medium">Roll No: {request.rollNo}</p>
                          <p className="text-sm text-muted-foreground">
                            Requester: {request.requestedBy.slice(0, 8)}...
                          </p>
                        </div>

                        {/* Field Change Preview - Show all changes */}
                        <div className="space-y-2">
                          {Object.entries(request.changes).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <FieldIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-primary truncate">
                                    {value as string}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:min-w-[140px]">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => viewDialog.open(request)}
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-2"
                          onClick={() => openActionDialog(request, 'approve')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => openActionDialog(request, 'reject')}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Details Update Request
            </DialogTitle>
            <DialogDescription>
              {viewDialog.data?._id.slice(-8).toUpperCase()} • Roll: {viewDialog.data?.rollNo}
            </DialogDescription>
          </DialogHeader>

          {viewDialog.data && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                  <Label className="text-xs text-muted-foreground">Student Roll No</Label>
                  <p className="font-medium font-mono">{viewDialog.data.rollNo}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                  <Label className="text-xs text-muted-foreground">Requested By</Label>
                  <p className="font-medium text-sm truncate">{viewDialog.data.requestedBy}</p>
                </div>
              </div>

              {/* Change Details */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Requested Changes</Label>
                <div className="space-y-3">
                  {Object.entries(viewDialog.data.changes).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <div className="bg-success/10 text-success p-2 rounded">
                        <span className="font-mono text-sm">{value as string}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              {viewDialog.data.reason && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reason for Request</Label>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm leading-relaxed">{viewDialog.data.reason}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => openActionDialog(viewDialog.data!, 'approve')}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Forward
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => openActionDialog(viewDialog.data!, 'reject')}
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <ConfirmDialog
        open={actionDialog.isOpen}
        onOpenChange={(open) => !open && actionDialog.close()}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Request`}
        onConfirm={handleAction}
        confirmLabel={actionType === 'approve' ? 'Approve' : 'Reject'}
        variant={actionType === 'approve' ? 'default' : 'destructive'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <AlertCircle
              className={`h-5 w-5 ${actionType === 'approve' ? 'text-success' : 'text-destructive'}`}
            />
            <div>
              <p className="font-medium text-sm">
                Action: {actionType === 'approve' ? 'Approve' : 'Reject'}
              </p>
              <p className="text-xs text-muted-foreground">Roll No: {actionDialog.data?.rollNo}</p>
            </div>
          </div>
          <div>
            <Label>Comment (optional)</Label>
            <Textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
