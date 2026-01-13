import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsGrid } from '@/components/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClipboardCheck, CheckCircle, XCircle, Clock, Eye, ThumbsUp, ThumbsDown, User, ArrowRight, Hash } from 'lucide-react';

const pendingRequests = [
  { 
    id: 'DET-2024-001', 
    studentName: 'Rahul Sharma', 
    field: 'Student Name',
    currentValue: 'Rahul Sharma',
    requestedValue: 'Rahul Kumar Sharma',
    submittedAt: '2 hours ago',
    reason: 'Full legal name as per official documents'
  },
  { 
    id: 'DET-2024-002', 
    studentName: 'Priya Patel', 
    field: 'Roll Number',
    currentValue: '2024CS045',
    requestedValue: '2024CS054',
    submittedAt: '4 hours ago',
    reason: 'Clerical error in roll number assignment'
  },
  { 
    id: 'DET-2024-003', 
    studentName: 'Amit Singh', 
    field: 'Registration Number',
    currentValue: 'REG2024078',
    requestedValue: 'REG2024087',
    submittedAt: '1 day ago',
    reason: 'Registration number was swapped with another student'
  },
];

export default function MakerDashboard() {
  const stats = [
    { label: 'Pending Requests', value: '5', icon: Clock, trend: { value: 2, isPositive: false } },
    { label: 'Approved This Week', value: '8', icon: CheckCircle, trend: { value: 15, isPositive: true } },
    { label: 'Rejected This Week', value: '2', icon: XCircle },
    { label: 'Total Reviewed', value: '45', icon: ClipboardCheck, trend: { value: 12, isPositive: true } },
  ];

  return (
    <DashboardLayout 
      title="Maker Dashboard" 
      subtitle="Review and validate student details update requests"
    >
      <div className="space-y-6">
        <StatsGrid stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pending Details Update Requests
            </CardTitle>
            <CardDescription>
              Review and validate student requests for personal details correction
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
                        <p className="text-sm text-muted-foreground">{request.field}</p>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Hash className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground line-through">{request.currentValue}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-primary">{request.requestedValue}</span>
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
