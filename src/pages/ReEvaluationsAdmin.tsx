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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar,
  MessageSquare,
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
    reason: 'Discrepancy in answer evaluation for Q3 and Q5 in Database Systems paper. Request detailed re-checking.',
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
    reason: 'Missing marks for practical component. Submitted all lab assignments.',
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
    reason: 'Calculation error in total marks. Individual subject marks do not add up.',
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
    reason: 'Request re-evaluation due to significant deviation from expected performance.',
    status: 'rejected',
    submittedAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-14'),
  },
  {
    id: 'RE-005',
    studentName: 'David Wilson',
    studentId: 'STU-2024-067',
    marksCardId: 'MC-2024-CS-067',
    semester: 'Semester 6',
    subjects: ['Machine Learning'],
    reason: 'Answer sheet review requested. Believe some answers were not evaluated.',
    status: 'marks_updated',
    submittedAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-18'),
    assignedTo: 'Mr. James Wilson',
  },
  {
    id: 'RE-006',
    studentName: 'Sarah Johnson',
    studentId: 'STU-2024-089',
    marksCardId: 'MC-2024-CS-089',
    semester: 'Semester 4',
    subjects: ['Operating Systems', 'Computer Architecture'],
    reason: 'Totaling error in marks. Request verification of marks addition.',
    status: 'completed',
    submittedAt: new Date('2024-11-28'),
    updatedAt: new Date('2024-12-10'),
  },
];

const statusConfig: Record<ReEvaluationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  submitted: { label: 'Submitted', variant: 'secondary' },
  under_review: { label: 'Under Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  marks_updated: { label: 'Marks Updated', variant: 'default' },
  pending_verification: { label: 'Pending Verification', variant: 'warning' },
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

  const getStatusCounts = () => {
    return {
      all: requests.length,
      submitted: requests.filter(r => r.status === 'submitted').length,
      under_review: requests.filter(r => r.status === 'under_review').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      completed: requests.filter(r => r.status === 'completed' || r.status === 'marks_updated').length,
    };
  };

  const counts = getStatusCounts();

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
      r.id === selectedRequest.id 
        ? { ...r, status: newStatus, updatedAt: new Date() }
        : r
    ));

    setIsActionDialogOpen(false);
    toast.success(`Request ${selectedRequest.id} ${actionType === 'approve' ? 'approved' : 'rejected'}`);
    setSelectedRequest(null);
    setActionType(null);
  };

  const handleAssign = (request: ReEvaluationItem) => {
    setRequests(requests.map(r => 
      r.id === request.id 
        ? { ...r, status: 'under_review' as ReEvaluationStatus, assignedTo: 'Dr. Emily Davis', updatedAt: new Date() }
        : r
    ));
    toast.success(`Request ${request.id} assigned for review`);
  };

  return (
    <DashboardLayout 
      title="Re-Evaluations" 
      subtitle="Manage and process re-evaluation requests"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.all}</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.submitted}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <RefreshCcw className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.under_review}</p>
              <p className="text-xs text-muted-foreground">In Review</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="marks_updated">Marks Updated</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Re-Evaluation Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Subjects</TableHead>
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
                    <div>
                      <p className="font-medium text-foreground">{request.studentName}</p>
                      <p className="text-xs text-muted-foreground">{request.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{request.semester}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {request.subjects.slice(0, 2).map((subject, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {request.subjects.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{request.subjects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[request.status].variant}>
                      {statusConfig[request.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.submittedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {request.status === 'submitted' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAssign(request)}>
                              <User className="h-4 w-4 mr-2" />
                              Assign for Review
                            </DropdownMenuItem>
                          </>
                        )}
                        {(request.status === 'submitted' || request.status === 'under_review') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOpenActionDialog(request, 'approve')}
                              className="text-success focus:text-success"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenActionDialog(request, 'reject')}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No re-evaluation requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Re-Evaluation Request Details</DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Student Name</Label>
                  <p className="font-medium">{selectedRequest.studentName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Student ID</Label>
                  <p className="font-medium">{selectedRequest.studentId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Marks Card ID</Label>
                  <p className="font-medium font-mono text-sm">{selectedRequest.marksCardId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Semester</Label>
                  <p className="font-medium">{selectedRequest.semester}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Submitted On</Label>
                  <p className="font-medium">{selectedRequest.submittedAt.toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge variant={statusConfig[selectedRequest.status].variant}>
                    {statusConfig[selectedRequest.status].label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Subjects for Re-Evaluation</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Reason for Request</Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.assignedTo && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Assigned To</Label>
                  <p className="font-medium">{selectedRequest.assignedTo}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            {selectedRequest && (selectedRequest.status === 'submitted' || selectedRequest.status === 'under_review') && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenActionDialog(selectedRequest, 'reject');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenActionDialog(selectedRequest, 'approve');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This will approve the re-evaluation request and forward it for marks update.'
                : 'This will reject the re-evaluation request. Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className={`h-5 w-5 ${actionType === 'approve' ? 'text-success' : 'text-destructive'}`} />
              <div>
                <p className="font-medium text-sm">{selectedRequest?.id}</p>
                <p className="text-xs text-muted-foreground">{selectedRequest?.studentName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder={actionType === 'approve' 
                  ? 'Add any notes for the updater...'
                  : 'Provide reason for rejection...'}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Cancel</Button>
            <Button 
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
