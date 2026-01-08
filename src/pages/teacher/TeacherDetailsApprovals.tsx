import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StatsGrid } from '@/components/shared';
import { useDialog } from '@/hooks/useDialog';
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
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock data for details update requests
interface DetailsUpdateRequest {
  id: string;
  marksCardId: string;
  studentId: string;
  studentName: string;
  semester: string;
  field: 'name' | 'roll_number' | 'registration_number' | 'other';
  fieldLabel: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  supportingDocuments: string[];
  status: 'submitted' | 'under_review';
  submittedAt: Date;
}

const mockDetailsRequests: DetailsUpdateRequest[] = [
  {
    id: 'DET-2024-001',
    marksCardId: 'MC-2024-001',
    studentId: 'STU001',
    studentName: 'Rahul Sharma',
    semester: 'Semester 6',
    field: 'name',
    fieldLabel: 'Student Name',
    currentValue: 'Rahul Sharma',
    requestedValue: 'Rahul Kumar Sharma',
    reason: 'My full legal name as per official documents is "Rahul Kumar Sharma" but it was recorded incorrectly during admission. I have attached my Aadhaar card and 10th certificate as proof.',
    supportingDocuments: ['aadhaar_card.pdf', 'class10_certificate.pdf'],
    status: 'submitted',
    submittedAt: new Date('2024-01-05'),
  },
  {
    id: 'DET-2024-002',
    marksCardId: 'MC-2024-045',
    studentId: 'STU045',
    studentName: 'Priya Patel',
    semester: 'Semester 4',
    field: 'roll_number',
    fieldLabel: 'Roll Number',
    currentValue: '2024CS045',
    requestedValue: '2024CS054',
    reason: 'There was a clerical error in my roll number assignment. The correct roll number should be 2024CS054 as per my admission letter.',
    supportingDocuments: ['admission_letter.pdf'],
    status: 'submitted',
    submittedAt: new Date('2024-01-04'),
  },
  {
    id: 'DET-2024-003',
    marksCardId: 'MC-2024-078',
    studentId: 'STU078',
    studentName: 'Amit Singh',
    semester: 'Semester 6',
    field: 'registration_number',
    fieldLabel: 'Registration Number',
    currentValue: 'REG2024078',
    requestedValue: 'REG2024087',
    reason: 'My registration number was swapped with another student during data entry. Please correct it to REG2024087 as per my university registration confirmation.',
    supportingDocuments: ['university_registration.pdf'],
    status: 'under_review',
    submittedAt: new Date('2024-01-03'),
  },
];

const getFieldIcon = (field: string) => {
  switch (field) {
    case 'name': return User;
    case 'roll_number': return Hash;
    case 'registration_number': return Hash;
    default: return FileText;
  }
};

export default function TeacherDetailsApprovals() {
  const [requests, setRequests] = useState<DetailsUpdateRequest[]>(mockDetailsRequests);
  const viewDialog = useDialog<DetailsUpdateRequest>();
  const { searchQuery, setSearchQuery, filteredData } = useSearch<DetailsUpdateRequest>({
    data: requests,
    searchFields: ['studentName', 'studentId', 'id', 'currentValue', 'requestedValue'],
  });

  const counts = {
    submitted: requests.filter(r => r.status === 'submitted').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
  };

  const stats = [
    { label: 'New Requests', value: counts.submitted.toString(), icon: Clock, trend: { value: 2, isPositive: false } },
    { label: 'Under Review', value: counts.under_review.toString(), icon: AlertCircle },
  ];

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    viewDialog.close();
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    viewDialog.close();
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
                <Badge variant="secondary" className="text-xs">Student</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="default" className="text-xs">Teacher (You)</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs">Approver</Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs">Verifier</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No details update requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((request) => {
              const FieldIcon = getFieldIcon(request.field);
              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {request.id}
                          </Badge>
                          <Badge 
                            variant={request.status === 'submitted' ? 'warning' : 'secondary'}
                            className="text-xs"
                          >
                            {request.status === 'submitted' ? 'New' : 'Under Review'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(request.submittedAt, 'MMM d, yyyy')}
                          </span>
                        </div>

                        <div>
                          <p className="font-medium">{request.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.studentId} • {request.semester}
                          </p>
                        </div>

                        {/* Field Change Preview */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FieldIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">{request.fieldLabel}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground line-through truncate">
                                {request.currentValue}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium text-primary truncate">
                                {request.requestedValue}
                              </span>
                            </div>
                          </div>
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
                          onClick={() => handleApprove(request.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="gap-2"
                          onClick={() => handleReject(request.id)}
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
              {viewDialog.data?.id} • {viewDialog.data?.studentName}
            </DialogDescription>
          </DialogHeader>

          {viewDialog.data && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                  <Label className="text-xs text-muted-foreground">Student Name</Label>
                  <p className="font-medium">{viewDialog.data.studentName}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                  <Label className="text-xs text-muted-foreground">Student ID</Label>
                  <p className="font-medium font-mono">{viewDialog.data.studentId}</p>
                </div>
              </div>

              {/* Change Details */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Requested Change</Label>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const FieldIcon = getFieldIcon(viewDialog.data.field);
                      return <FieldIcon className="h-4 w-4 text-primary" />;
                    })()}
                    <span className="font-medium">{viewDialog.data.fieldLabel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="font-mono text-sm bg-destructive/10 text-destructive p-2 rounded">
                        {viewDialog.data.currentValue}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Requested Value</p>
                      <p className="font-mono text-sm bg-success/10 text-success p-2 rounded">
                        {viewDialog.data.requestedValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Reason for Request</Label>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm leading-relaxed">{viewDialog.data.reason}</p>
                </div>
              </div>

              {/* Supporting Documents */}
              {viewDialog.data.supportingDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Supporting Documents</Label>
                  <div className="space-y-2">
                    {viewDialog.data.supportingDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <File className="h-4 w-4 text-primary" />
                        <span className="text-sm flex-1">{doc}</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => handleApprove(viewDialog.data!.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Forward to Approver
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 gap-2"
                  onClick={() => handleReject(viewDialog.data!.id)}
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}