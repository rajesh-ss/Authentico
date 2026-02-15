import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  FilterBar,
  DataTable,
  ConfirmDialog,
  FormDialog,
  MobileCard,
  StatusBadge,
  StatsGrid,
  type Column,
} from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import {
  FileText,
  Clock,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Eye,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { detailsChangeService, DetailsChangeData } from '@/services/details-change.service';
import { authService } from '@/services/auth.service';
import { User as AuthUser, Roles } from '@/types/auth';
import { format } from 'date-fns';

export default function ReEvaluationsAdmin() {
  const [requests, setRequests] = useState<DetailsChangeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComment, setActionComment] = useState('');

  const viewDialog = useDialog<DetailsChangeData>();
  const actionDialog = useDialog<DetailsChangeData>();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [user, pendingRes] = await Promise.all([
          authService.getCurrentUser(),
          detailsChangeService.getPendingRequests(),
        ]);

        setCurrentUser(user);

        if (pendingRes.success) {
          setRequests(pendingRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const { searchQuery, setSearchQuery, filterValue, setFilterValue, filteredData } = useSearch({
    data: requests,
    searchFields: ['rollNo', '_id'],
    filterField: 'status',
  });

  const counts = {
    all: requests.length,
    pending: requests.filter(
      (r) =>
        r.status === 'PENDING_MAKER' ||
        r.status === 'PENDING_CHECKER' ||
        r.status === 'PENDING_APPROVER'
    ).length,
    // Add other statuses as we know them
  };

  const stats = [
    { icon: FileText, value: counts.all, label: 'Total Requests', color: 'primary' as const },
    { icon: Clock, value: counts.pending, label: 'Pending', color: 'warning' as const },
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

      // Refresh list
      const res = await detailsChangeService.getPendingRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(`Failed to ${actionType} request`);
    } finally {
      actionDialog.close();
    }
  };

  // Determine if user can act
  // "if the role is checker we give approve/reject option. for admin just list"
  const canAct =
    currentUser?.roles?.includes(Roles.CHECKER) ||
    currentUser?.roles?.includes(Roles.MAKER) ||
    currentUser?.roles?.includes(Roles.APPROVER);

  const columns: Column<DetailsChangeData>[] = [
    {
      key: '_id',
      header: 'ID',
      render: (r) => <span className="font-mono text-xs">{r._id.slice(-8).toUpperCase()}</span>,
    },
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div>
          <p className="font-medium text-sm">Roll: {r.rollNo}</p>
          <p className="text-xs text-muted-foreground">Reg by: {r.requestedBy.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (r) => (
        <div className="space-y-1 max-w-[200px]">
          {Object.entries(r.changes).map(([k, v]) => (
            <div key={k} className="text-xs truncate" title={`${k}: ${v}`}>
              <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>:{' '}
              {v as string}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status.includes('PENDING') ? 'warning' : 'outline'}>{r.status}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (r) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(r.createdAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}>
            <Eye className="h-4 w-4" />
          </Button>
          {canAct && (
            <>
              <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'approve')}>
                <CheckCircle className="h-4 w-4 text-success" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'reject')}>
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Details Change Requests"
      subtitle="Manage student detail update requests"
    >
      <StatsGrid stats={stats} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Roll No or ID..."
        filters={[]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading requests...</span>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <DataTable
              data={filteredData}
              columns={columns}
              title="Requests"
              keyExtractor={(r) => r._id}
              emptyMessage="No requests found"
            />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredData.map((request) => (
              <MobileCard
                key={request._id}
                header={
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">
                      {request._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="font-medium truncate">Roll: {request.rollNo}</p>
                  </div>
                }
                badges={
                  <Badge variant={request.status.includes('PENDING') ? 'warning' : 'outline'}>
                    {request.status}
                  </Badge>
                }
                footer={
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(request.createdAt), 'PP')}
                  </span>
                }
                actions={
                  <>
                    <DropdownMenuItem onClick={() => viewDialog.open(request)}>
                      View Details
                    </DropdownMenuItem>
                    {canAct && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openActionDialog(request, 'approve')}
                          className="text-success"
                        >
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openActionDialog(request, 'reject')}
                          className="text-destructive"
                        >
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                }
              >
                <div className="mt-2 space-y-1">
                  {Object.entries(request.changes).map(([k, v]) => (
                    <div key={k} className="text-xs flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {k.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium truncate max-w-[120px]">{v as string}</span>
                    </div>
                  ))}
                </div>
              </MobileCard>
            ))}
          </div>
        </>
      )}

      {/* View Dialog */}
      <FormDialog
        open={viewDialog.isOpen}
        onOpenChange={(open) => !open && viewDialog.close()}
        title="Request Details"
        description={`ID: ${viewDialog.data?._id}`}
        onSubmit={viewDialog.close}
        submitLabel="Close"
        maxWidth="2xl"
      >
        {viewDialog.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Student Roll No</Label>
                <p className="font-medium text-sm">{viewDialog.data.rollNo}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Requested By</Label>
                <p className="font-medium text-sm text-muted-foreground">
                  {viewDialog.data.requestedBy}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge>{viewDialog.data.status}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Submitted</Label>
                <p className="font-medium text-sm">
                  {format(new Date(viewDialog.data.createdAt), 'PPpp')}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-muted/30">
              <Label className="text-xs text-muted-foreground mb-2 block">Changes</Label>
              <div className="space-y-2">
                {Object.entries(viewDialog.data.changes).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center gap-2 text-sm bg-background p-2 rounded border"
                  >
                    <span className="font-medium min-w-[100px] capitalize">
                      {k.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-bold text-primary">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {viewDialog.data.reason && (
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg mt-1 italic">
                  "{viewDialog.data.reason}"
                </p>
              </div>
            )}
          </div>
        )}
      </FormDialog>

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
