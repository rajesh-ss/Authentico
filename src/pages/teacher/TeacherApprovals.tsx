import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FilterBar, DataTable, ConfirmDialog, MobileCard, StatusBadge, StatsGrid, type Column } from '@/components/shared';
import { mockReEvaluations, type ReEvaluationItem } from '@/data';
import { getAnswerSheetByRequestId } from '@/data/mockAnswerSheets';
import { MarksBreakdown } from '@/components/teacher/MarksBreakdown';
import { AnswerSheetViewer } from '@/components/teacher/AnswerSheetViewer';
import { useDialog } from '@/hooks/useDialog';
import { useSearch } from '@/hooks/useSearch';
import { Clock, CheckCircle, XCircle, Eye, AlertCircle, FileText, Calculator, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { ReEvaluationStatus } from '@/types/blockchain';

export default function TeacherApprovals() {
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

  const answerSheetData = viewDialog.data ? getAnswerSheetByRequestId(viewDialog.data.id) : undefined;

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
    <DashboardLayout title="Pending Approvals" subtitle="Validate and approve student re-evaluation requests">
      <StatsGrid stats={stats} columns={2} />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by student name or ID..."
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

      {/* Enhanced View Dialog with Tabs */}
      <Dialog open={viewDialog.isOpen} onOpenChange={(open) => !open && viewDialog.close()}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="truncate">Re-Evaluation Request Details</span>
            </DialogTitle>
            <DialogDescription className="truncate">
              {viewDialog.data?.id} • {viewDialog.data?.studentName}
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.data && (
            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="px-6 pt-4 border-b flex-shrink-0">
                <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                  <TabsTrigger value="overview" className="gap-2">
                    <ClipboardList className="h-4 w-4 hidden sm:inline" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="marks" className="gap-2">
                    <Calculator className="h-4 w-4 hidden sm:inline" />
                    Marks
                  </TabsTrigger>
                  <TabsTrigger value="answersheet" className="gap-2">
                    <FileText className="h-4 w-4 hidden sm:inline" />
                    Answer Sheet
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <TabsContent value="overview" className="m-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Student Name</Label>
                        <p className="font-medium">{viewDialog.data.studentName}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Student ID</Label>
                        <p className="font-medium font-mono">{viewDialog.data.studentId}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Semester</Label>
                        <p className="font-medium">{viewDialog.data.semester}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                        <Label className="text-xs text-muted-foreground">Submitted Date</Label>
                        <p className="font-medium">{viewDialog.data.submittedAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Subjects for Re-Evaluation</Label>
                      <div className="flex flex-wrap gap-2">
                        {viewDialog.data.subjects.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-sm">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reason for Re-Evaluation</Label>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm leading-relaxed">{viewDialog.data.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button className="flex-1 gap-2" onClick={() => { viewDialog.close(); openActionDialog(viewDialog.data!, 'approve'); }}>
                        <CheckCircle className="h-4 w-4" />
                        Approve Request
                      </Button>
                      <Button variant="destructive" className="flex-1 gap-2" onClick={() => { viewDialog.close(); openActionDialog(viewDialog.data!, 'reject'); }}>
                        <XCircle className="h-4 w-4" />
                        Reject Request
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="marks" className="m-0">
                    {answerSheetData ? (
                      <MarksBreakdown subjects={answerSheetData.subjects} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No marks breakdown available for this request</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="answersheet" className="m-0">
                    {answerSheetData ? (
                      <AnswerSheetViewer subjects={answerSheetData.subjects} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No answer sheets available for this request</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </div>
            </Tabs>
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
            <AlertCircle className={`h-5 w-5 ${actionType === 'approve' ? 'text-success' : 'text-destructive'}`} />
            <div><p className="font-medium text-sm">{actionDialog.data?.id}</p><p className="text-xs text-muted-foreground">{actionDialog.data?.studentName}</p></div>
          </div>
          <div><Label>Comment (optional)</Label><Textarea value={actionComment} onChange={(e) => setActionComment(e.target.value)} rows={3} className="mt-1" placeholder="Add any comments or feedback..." /></div>
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
