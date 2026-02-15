import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  DataTable,
  ConfirmDialog,
  FormDialog,
  MobileCard,
  StatusBadge,
  StatsGrid,
  FilterBar,
  type Column,
} from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import {
  User as UserIcon,
  FileText,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { workflowService, WorkflowItem, ActionPayload } from '@/services/workflow.service';
import { authService } from '@/services/auth.service';
import { User as AuthUser, Roles } from '@/types/auth';

export default function Inbox() {
  const [requests, setRequests] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [updatedMarks, setUpdatedMarks] = useState<string>(''); // For Checker Reevaluation

  const viewDialog = useDialog<WorkflowItem>();
  const actionDialog = useDialog<WorkflowItem>();

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, res] = await Promise.all([
        authService.getCurrentUser(),
        workflowService.getPendingRequests(),
      ]);
      console.log('user', user?.roles);
      setCurrentUser(user);
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error('Failed to load inbox:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { searchQuery, setSearchQuery, filterValue, setFilterValue, filteredData } = useSearch({
    data: requests,
    searchFields: ['rollNo', '_id', 'type'],
    filterField: 'type',
  });

  const counts = {
    all: requests.length,
    reevaluation: requests.filter((r) => r.type === 'REEVALUATION').length,
    details: requests.filter((r) => r.type === 'DETAILS_CHANGE').length,
  };

  const stats = [
    { icon: FileText, value: counts.all, label: 'Total Pending', color: 'primary' as const },
    {
      icon: AlertCircle,
      value: counts.reevaluation,
      label: 'Re-evaluations',
      color: 'warning' as const,
    },
    { icon: UserIcon, value: counts.details, label: 'Details Changes', color: 'accent' as const },
  ];

  const openActionDialog = (request: WorkflowItem, action: 'APPROVE' | 'REJECT') => {
    setActionType(action);
    setActionComment('');
    setUpdatedMarks('');
    actionDialog.open(request);
  };

  const handleAction = async () => {
    if (!actionDialog.data || !actionType) return;

    try {
      const payload: ActionPayload = {
        requestId: actionDialog.data._id,
        type: actionDialog.data.type,
        action: actionType,
        remarks: actionComment,
      };

      // If it's a re-evaluation approved by a checker, include updated marks
      // Note: Logic depends on exact role/status. Assuming Checker needs to input marks for Reeval.
      // We can check if currentUser has Checker role and request type is Reevaluation
      // For now, let's keep it simple: if updatedMarks is entered, send it.
      if (updatedMarks) {
        payload.updatedMarks = Number(updatedMarks);
      }

      await workflowService.processAction(payload);
      toast.success(`Request ${actionType === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      actionDialog.close();
      loadData();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(`Failed to ${actionType.toLowerCase()} request`);
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'REEVALUATION' ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
        Re-eval
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
        Details
      </Badge>
    );
  };

  const columns: Column<WorkflowItem>[] = [
    {
      key: '_id',
      header: 'ID',
      render: (r) => <span className="font-mono text-xs">{r._id.slice(-8).toUpperCase()}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => getTypeBadge(r.type),
    },
    {
      key: 'student',
      header: 'Student',
      render: (r) => (
        <div>
          <p className="font-medium text-sm">Roll: {r.rollNo}</p>
          <p className="text-xs text-muted-foreground">{r.requestedBy.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (r) => {
        if (r.type === 'REEVALUATION') {
          return (
            <span className="text-sm">
              {r.subjectCode} ({r.passYear})
            </span>
          );
        }
        // Details Change: show summary
        const changeCount = Object.keys(r.changes || {}).length;
        return <span className="text-sm">{changeCount} field(s) changed</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status as any} />,
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
          <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'APPROVE')}>
            <CheckCircle className="h-4 w-4 text-success" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'REJECT')}>
            <XCircle className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Inbox" subtitle="Manage your pending approvals">
      <StatsGrid stats={stats} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Roll No or ID..."
        filters={[
          {
            value: filterValue,
            onChange: setFilterValue,
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Re-evaluation', value: 'REEVALUATION' },
              { label: 'Details Change', value: 'DETAILS_CHANGE' },
            ],
            placeholder: 'Filter Type',
          },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading actions...</span>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <DataTable
              data={filteredData}
              columns={columns}
              title="Pending Items"
              keyExtractor={(r) => r._id}
              emptyMessage="No pending items found"
            />
          </div>

          <div className="md:hidden space-y-3">
            {filteredData.map((item) => (
              <MobileCard
                key={item._id}
                header={
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-mono text-xs text-muted-foreground">
                        {item._id.slice(-8).toUpperCase()}
                      </p>
                      {getTypeBadge(item.type)}
                    </div>
                    <p className="font-medium mt-1">Roll: {item.rollNo}</p>
                  </div>
                }
                badges={<StatusBadge status={item.status as any} size="sm" />}
                footer={
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), 'PP')}
                  </span>
                }
                actions={
                  <>
                    <DropdownMenuItem onClick={() => viewDialog.open(item)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openActionDialog(item, 'APPROVE')}
                      className="text-success"
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openActionDialog(item, 'REJECT')}
                      className="text-destructive"
                    >
                      Reject
                    </DropdownMenuItem>
                  </>
                }
              />
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
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Roll No</Label>
                <p className="font-medium">{viewDialog.data.rollNo}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="mt-1">{getTypeBadge(viewDialog.data.type)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <StatusBadge status={viewDialog.data.status as any} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Submitted</Label>
                <p className="text-sm">{format(new Date(viewDialog.data.createdAt), 'PPpp')}</p>
              </div>
            </div>

            {/* Re-evaluation Specifics */}
            {viewDialog.data.type === 'REEVALUATION' && (
              <div className="border rounded-lg p-3 bg-muted/30">
                <h4 className="font-medium text-sm mb-2">Re-evaluation Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Subject Code</span>
                    <span className="font-mono">{viewDialog.data.subjectCode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Pass Year</span>
                    <span>{viewDialog.data.passYear}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Details Change Specifics */}
            {viewDialog.data.type === 'DETAILS_CHANGE' && viewDialog.data.changes && (
              <div className="border rounded-lg p-3 bg-muted/30">
                <h4 className="font-medium text-sm mb-2">Requested Changes</h4>
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
            )}

            {viewDialog.data.reason && (
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <div className="text-sm bg-muted/50 p-3 rounded-lg mt-1 italic">
                  "{viewDialog.data.reason}"
                </div>
              </div>
            )}
          </div>
        )}
      </FormDialog>

      {/* Action Dialog */}
      <ConfirmDialog
        open={actionDialog.isOpen}
        onOpenChange={(open) => !open && actionDialog.close()}
        title={`${actionType === 'APPROVE' ? 'Approve' : 'Reject'} Request`}
        onConfirm={handleAction}
        confirmLabel={actionType === 'APPROVE' ? 'Approve' : 'Reject'}
        variant={actionType === 'APPROVE' ? 'default' : 'destructive'}
      >
        <div className="space-y-4">
          {/* If this is a Reevaluation and user is Checker and Action is Approve, show marks input */}
          {/* Note: In a real app we'd check roles more strictly. Assuming 'PENDING_CHECKER' + 'REEVALUATION' + 'APPROVE' */}
          {/* If this is a Reevaluation and user is Checker and Action is Approve, show marks input */}
          {actionDialog.data?.type === 'REEVALUATION' &&
            actionDialog.data?.status === 'PENDING_CHECKER' &&
            currentUser?.roles?.includes(Roles.CHECKER) &&
            actionType === 'APPROVE' && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 text-sm">
                <Label className="mb-1 block text-yellow-900">Updated Marks (from Checker)</Label>
                <Input
                  type="number"
                  value={updatedMarks}
                  onChange={(e) => setUpdatedMarks(e.target.value)}
                  placeholder="Enter new marks..."
                  className="bg-white"
                />
              </div>
            )}

          <div>
            <Label>
              Remarks / Comment {currentUser?.roles} {actionType === 'REJECT' && '(Required)'}
            </Label>
            <Textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              className="mt-1"
              placeholder={
                actionType === 'REJECT' ? 'Reason for rejection...' : 'Optional remarks...'
              }
            />
          </div>
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
