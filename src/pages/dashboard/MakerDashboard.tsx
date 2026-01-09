import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsGrid } from '@/components/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClipboardCheck, CheckCircle, XCircle, Clock, Eye, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';

const pendingRequests = [
  { 
    id: 'REQ-2024-001', 
    studentName: 'Rahul Kumar', 
    subject: 'Database Management Systems',
    currentMarks: 68,
    submittedAt: '2 hours ago',
    reason: 'Answer sheet evaluation discrepancy in Q3 and Q5'
  },
  { 
    id: 'REQ-2024-002', 
    studentName: 'Priya Sharma', 
    subject: 'Computer Networks',
    currentMarks: 55,
    submittedAt: '4 hours ago',
    reason: 'Believe practical marks were not properly counted'
  },
  { 
    id: 'REQ-2024-003', 
    studentName: 'Amit Patel', 
    subject: 'Software Engineering',
    currentMarks: 72,
    submittedAt: '1 day ago',
    reason: 'Discrepancy in theory section marks calculation'
  },
];

export default function MakerDashboard() {
  const stats = [
    { label: 'Pending Approvals', value: '3', icon: Clock, trend: { value: 2, isPositive: false } },
    { label: 'Approved This Week', value: '8', icon: CheckCircle, trend: { value: 15, isPositive: true } },
    { label: 'Rejected This Week', value: '2', icon: XCircle },
    { label: 'Total Reviewed', value: '45', icon: ClipboardCheck, trend: { value: 12, isPositive: true } },
  ];

  return (
    <DashboardLayout 
      title="Maker Dashboard" 
      subtitle="Validate and initiate student re-evaluation requests"
    >
      <div className="space-y-6">
        <StatsGrid stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Re-Evaluation Requests
            </CardTitle>
            <CardDescription>
              Review and validate student requests for marks re-evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {request.id}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{request.submittedAt}</span>
                      </div>
                      <div>
                        <p className="font-medium">{request.studentName}</p>
                        <p className="text-sm text-muted-foreground">{request.subject}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Current Marks: <strong>{request.currentMarks}</strong></span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                      <Button size="sm" variant="default" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-2">
                        <ThumbsDown className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}