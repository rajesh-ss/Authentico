import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReEvaluationStatus } from '@/types/blockchain';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  User,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ReEvaluationItem {
  id: string;
  studentName: string;
  studentId: string;
  marksCardId: string;
  semester: string;
  subjects: string[];
  reason: string;
  status: ReEvaluationStatus;
  submittedAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

const initialRequests: ReEvaluationItem[] = [
  {
    id: 'RE-001',
    studentName: 'Alex Thompson',
    studentId: 'STU-2024-001',
    marksCardId: 'MC-2024-CS-001',
    semester: 'Semester 6',
    subjects: ['Database Systems', 'Computer Networks'],
    reason: 'Discrepancy in answer evaluation for Q3 and Q5 in Database Systems paper.',
    status: 'submitted',
    submittedAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: 'RE-002',
    studentName: 'Maria Garcia',
    studentId: 'STU-2024-015',
    marksCardId: 'MC-2024-CS-015',
    semester: 'Semester 4',
    subjects: ['Data Structures'],
    reason: 'Missing marks for practical component.',
    status: 'under_review',
    submittedAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-21'),
    assignedTo: 'Dr. Emily Davis',
  },
  {
    id: 'RE-003',
    studentName: 'John Smith',
    studentId: 'STU-2024-023',
    marksCardId: 'MC-2024-EE-023',
    semester: 'Semester 5',
    subjects: ['Digital Electronics', 'Signals & Systems'],
    reason: 'Calculation error in total marks.',
    status: 'approved',
    submittedAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-19'),
    assignedTo: 'Mr. James Wilson',
  },
  {
    id: 'RE-004',
    studentName: 'Emily Chen',
    studentId: 'STU-2024-042',
    marksCardId: 'MC-2024-ME-042',
    semester: 'Semester 3',
    subjects: ['Thermodynamics'],
    reason: 'Request re-evaluation due to significant deviation.',
    status: 'rejected',
    submittedAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-14'),
  },
];

const statusConfig: Record<ReEvaluationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  submitted: { label: 'Submitted', variant: 'secondary' },
  under_review: { label: 'Under Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  marks_updated: { label: 'Marks Updated', variant: 'default' },
  pending_verification: { label: 'Pending', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
};

export default function ReEvaluationsAdmin() {
  const [requests, setRequests] = useState<ReEvaluationItem[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ReEvaluationItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionComment, setActionComment] = useState('');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: requests.length,
    submitted: requests.filter(r => r.status === 'submitted').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const handleViewRequest = (request: ReEvaluationItem) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleOpenActionDialog = (request: ReEvaluationItem, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionComment('');
    setIsActionDialogOpen(true);
  };

  const handleAction = () => {
    if (!selectedRequest || !actionType) return;
    const newStatus: ReEvaluationStatus = actionType === 'approve' ? 'approved' : 'rejected';
    setRequests(requests.map(r => 
      r.id === selectedRequest.id ? { ...r, status: newStatus, updatedAt: new Date() } : r
    ));
    setIsActionDialogOpen(false);
    toast.success(`Request ${selectedRequest.id} ${actionType === 'approve' ? 'approved' : 'rejected'}`);
  };

  const handleAssign = (request: ReEvaluationItem) => {
    setRequests(requests.map(r => 
      r.id === request.id ? { ...r, status: 'under_review' as ReEvaluationStatus, assignedTo: 'Dr. Emily Davis', updatedAt: new Date() } : r
    ));
    toast.success(`Request ${request.id} assigned for review`);
  };

  return (
    <DashboardLayout title="Re-Evaluations" subtitle="Manage re-evaluation requests">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {[
          { icon: FileText, count: counts.all, label: 'Total', color: 'primary' },
          { icon: Clock, count: counts.submitted, label: 'Pending', color: 'warning' },
          { icon: RefreshCcw, count: counts.under_review, label: 'Review', color: 'accent' },
          { icon: CheckCircle, count: counts.approved, label: 'Approved', color: 'success' },
          { icon: XCircle, count: counts.rejected, label: 'Rejected', color: 'destructive' },
        ].map((stat, i) => (
          <Card key={i} className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`h-8 w-8 md:h-10 md:w-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-4 w-4 md:h-5 md:w-5 text-${stat.color}`} />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader><CardTitle className="text-lg">Requests ({filteredRequests.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-sm">{request.id}</TableCell>
                  <TableCell>
                    <p className="font-medium">{request.studentName}</p>
                    <p className="text-xs text-muted-foreground">{request.studentId}</p>
                  </TableCell>
                  <TableCell>{request.semester}</TableCell>
                  <TableCell><Badge variant={statusConfig[request.status].variant}>{statusConfig[request.status].label}</Badge></TableCell>
                  <TableCell>{request.submittedAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewRequest(request)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                        {request.status === 'submitted' && <DropdownMenuItem onClick={() => handleAssign(request)}><User className="h-4 w-4 mr-2" />Assign</DropdownMenuItem>}
                        {(request.status === 'submitted' || request.status === 'under_review') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenActionDialog(request, 'approve')} className="text-success"><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenActionDialog(request, 'reject')} className="text-destructive"><XCircle className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{request.id}</p>
                  <p className="font-medium truncate">{request.studentName}</p>
                  <p className="text-xs text-muted-foreground">{request.semester}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewRequest(request)}>View</DropdownMenuItem>
                    {(request.status === 'submitted' || request.status === 'under_review') && (
                      <>
                        <DropdownMenuItem onClick={() => handleOpenActionDialog(request, 'approve')}>Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenActionDialog(request, 'reject')}>Reject</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between mt-3">
                <Badge variant={statusConfig[request.status].variant} className="text-xs">{statusConfig[request.status].label}</Badge>
                <span className="text-xs text-muted-foreground">{request.submittedAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>ID: {selectedRequest?.id}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Student</Label><p className="font-medium text-sm">{selectedRequest.studentName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Semester</Label><p className="font-medium text-sm">{selectedRequest.semester}</p></div>
              </div>
              <div><Label className="text-xs text-muted-foreground">Subjects</Label><div className="flex flex-wrap gap-1 mt-1">{selectedRequest.subjects.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
              <div><Label className="text-xs text-muted-foreground">Reason</Label><p className="text-sm bg-muted/50 p-3 rounded-lg mt-1">{selectedRequest.reason}</p></div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Approve' : 'Reject'} Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className={`h-5 w-5 ${actionType === 'approve' ? 'text-success' : 'text-destructive'}`} />
              <div><p className="font-medium text-sm">{selectedRequest?.id}</p><p className="text-xs text-muted-foreground">{selectedRequest?.studentName}</p></div>
            </div>
            <div><Label>Comment (optional)</Label><Textarea value={actionComment} onChange={(e) => setActionComment(e.target.value)} rows={3} className="mt-1" /></div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Cancel</Button>
            <Button variant={actionType === 'approve' ? 'default' : 'destructive'} onClick={handleAction}>{actionType === 'approve' ? 'Approve' : 'Reject'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
