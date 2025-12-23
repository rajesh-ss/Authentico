import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, ConfirmDialog, FormDialog, MobileCard, StatusBadge, StatsGrid, type Column } from '@/components/shared';
import { mockReEvaluations, reEvaluationStatusOptions, type ReEvaluationItem } from '@/data';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { FileText, Clock, RefreshCcw, CheckCircle, XCircle, Eye, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ReEvaluationStatus } from '@/types/blockchain';

export default function ReEvaluationsAdmin() {
  const [requests, setRequests] = useState<ReEvaluationItem[]>(mockReEvaluations);
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
    all: requests.length,
    submitted: requests.filter(r => r.status === 'submitted').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const stats = [
    { icon: FileText, value: counts.all, label: 'Total', color: 'primary' as const },
    { icon: Clock, value: counts.submitted, label: 'Pending', color: 'warning' as const },
    { icon: RefreshCcw, value: counts.under_review, label: 'Review', color: 'accent' as const },
    { icon: CheckCircle, value: counts.approved, label: 'Approved', color: 'success' as const },
    { icon: XCircle, value: counts.rejected, label: 'Rejected', color: 'destructive' as const },
  ];

  const openActionDialog = (request: ReEvaluationItem, action: 'approve' | 'reject') => {
    setActionType(action);
    setActionComment('');
    actionDialog.open(request);
  };

  const handleAction = () => {
    if (!actionDialog.data || !actionType) return;
    const newStatus: ReEvaluationStatus = actionType === 'approve' ? 'approved' : 'rejected';
    setRequests(requests.map(r => r.id === actionDialog.data!.id ? { ...r, status: newStatus, updatedAt: new Date() } : r));
    actionDialog.close();
    toast.success(`Request ${actionDialog.data.id} ${actionType === 'approve' ? 'approved' : 'rejected'}`);
  };

  const handleAssign = (request: ReEvaluationItem) => {
    setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'under_review' as ReEvaluationStatus, assignedTo: 'Dr. Emily Davis', updatedAt: new Date() } : r));
    toast.success(`Request ${request.id} assigned for review`);
  };

  const columns: Column<ReEvaluationItem>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-sm">{r.id}</span> },
    { key: 'student', header: 'Student', render: (r) => <div><p className="font-medium">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.studentId}</p></div> },
    { key: 'semester', header: 'Semester', render: (r) => r.semester },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'submitted', header: 'Submitted', render: (r) => <span className="text-muted-foreground">{r.submittedAt.toLocaleDateString()}</span> },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (r) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" onClick={() => viewDialog.open(r)}><Eye className="h-4 w-4" /></Button>
        {(r.status === 'submitted' || r.status === 'under_review') && (
          <>
            <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'approve')}><CheckCircle className="h-4 w-4 text-success" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openActionDialog(r, 'reject')}><XCircle className="h-4 w-4 text-destructive" /></Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <DashboardLayout title="Re-Evaluations" subtitle="Manage re-evaluation requests">
      <StatsGrid stats={stats} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search requests..."
        filters={[{ value: filterValue, onChange: setFilterValue, options: reEvaluationStatusOptions, placeholder: 'Status' }]}
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable data={filteredData} columns={columns} title="Requests" keyExtractor={(r) => r.id} emptyMessage="No requests found" />
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
                <DropdownMenuItem onClick={() => viewDialog.open(request)}>View</DropdownMenuItem>
                {request.status === 'submitted' && <DropdownMenuItem onClick={() => handleAssign(request)}><User className="h-4 w-4 mr-2" />Assign</DropdownMenuItem>}
                {(request.status === 'submitted' || request.status === 'under_review') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openActionDialog(request, 'approve')} className="text-success">Approve</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openActionDialog(request, 'reject')} className="text-destructive">Reject</DropdownMenuItem>
                  </>
                )}
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
