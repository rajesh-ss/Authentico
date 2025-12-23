import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, ConfirmDialog, FormDialog, MobileCard, StatusBadge, StatsGrid, type Column } from '@/components/shared';
import { mockReEvaluations, reEvaluationStatusOptions, type ReEvaluationItem } from '@/data';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ReEvaluationStatus } from '@/types/blockchain';

export default function PendingApprovals() {
  const [requests, setRequests] = useState<ReEvaluationItem[]>(
    mockReEvaluations.filter(r => r.status === 'submitted' || r.status === 'under_review')
  );
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComment, setActionComment] = useState('');

  const viewDialog = useDialog<ReEvaluationItem>();
  const actionDialog = useDialog<ReEvaluationItem>();

  const { searchQuery, setSearchQuery, filterValue, setFilterValue, filteredData } = useSearch({
    data: requests,
    searchFields: ['studentName', 'studentId', 'id'],
    filterField: 'status',
  });

  const counts = {
    submitted: requests.filter(r => r.status === 'submitted').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
  };

  const stats = [
    { icon: Clock, value: counts.submitted, label: 'New Requests', color: 'warning' as const },
    { icon: AlertCircle, value: counts.under_review, label: 'Under Review', color: 'accent' as const },
  ];

  const openActionDialog = (request: ReEvaluationItem, action: 'approve' | 'reject') => {
    setActionType(action);
    setActionComment('');
    actionDialog.open(request);
  };

  const handleAction = () => {
    if (!actionDialog.data || !actionType) return;
    const newStatus: ReEvaluationStatus = actionType === 'approve' ? 'approved' : 'rejected';
    setRequests(requests.filter(r => r.id !== actionDialog.data!.id));
    actionDialog.close();
    toast.success(`Request ${actionDialog.data.id} ${actionType === 'approve' ? 'approved' : 'rejected'}`);
  };

  const columns: Column<ReEvaluationItem>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-sm">{r.id}</span> },
    { key: 'student', header: 'Student', render: (r) => <div><p className="font-medium">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.studentId}</p></div> },
    { key: 'semester', header: 'Semester', render: (r) => r.semester },
    { key: 'subjects', header: 'Subjects', render: (r) => <span className="text-muted-foreground">{r.subjects.length} subject(s)</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'submitted', header: 'Submitted', render: (r) => <span className="text-muted-foreground">{r.submittedAt.toLocaleDateString()}</span> },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (r) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'approve')}><CheckCircle className="h-4 w-4 text-success" /></Button>
        <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'reject')}><XCircle className="h-4 w-4 text-destructive" /></Button>
      </div>
    )},
  ];

  const filterOptions = [
    { value: 'all', label: 'All Pending' },
    { value: 'submitted', label: 'New' },
    { value: 'under_review', label: 'Under Review' },
  ];

  return (
    <DashboardLayout title="Pending Approvals" subtitle="Review and approve re-evaluation requests">
      <StatsGrid stats={stats} columns={2} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search requests..."
        filters={[{ value: filterValue, onChange: setFilterValue, options: filterOptions, placeholder: 'Status' }]}
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable data={filteredData} columns={columns} title="Pending Requests" keyExtractor={(r) => r.id} emptyMessage="No pending requests" />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredData.map(request => (
          <MobileCard
            key={request.id}
            header={
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">{request.id}</p>
                <p className="font-medium truncate">{request.studentName}</p>
                <p className="text-xs text-muted-foreground">{request.semester}</p>
              </div>
            }
            badges={<StatusBadge status={request.status} size="sm" />}
            footer={<span className="text-xs text-muted-foreground">{request.submittedAt.toLocaleDateString()}</span>}
            actions={
              <>
                <DropdownMenuItem onClick={() => viewDialog.open(request)}>View Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openActionDialog(request, 'approve')} className="text-success">Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openActionDialog(request, 'reject')} className="text-destructive">Reject</DropdownMenuItem>
              </>
            }
          />
        ))}
      </div>

      {/* View Dialog */}
      <FormDialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()} title="Request Details" description={`ID: ${viewDialog.data?.id}`} onSubmit={viewDialog.close} submitLabel="Close" maxWidth="2xl">
        {viewDialog.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Student</Label><p className="font-medium text-sm">{viewDialog.data.studentName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Semester</Label><p className="font-medium text-sm">{viewDialog.data.semester}</p></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Subjects</Label><div className="flex flex-wrap gap-1 mt-1">{viewDialog.data.subjects.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
            <div><Label className="text-xs text-muted-foreground">Reason</Label><p className="text-sm bg-muted/50 p-3 rounded-lg mt-1">{viewDialog.data.reason}</p></div>
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
            <AlertCircle className={`h-5 w-5 ${actionType === 'approve' ? 'text-success' : 'text-destructive'}`} />
            <div><p className="font-medium text-sm">{actionDialog.data?.id}</p><p className="text-xs text-muted-foreground">{actionDialog.data?.studentName}</p></div>
          </div>
          <div><Label>Comment (optional)</Label><Textarea value={actionComment} onChange={(e) => setActionComment(e.target.value)} rows={3} className="mt-1" /></div>
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
