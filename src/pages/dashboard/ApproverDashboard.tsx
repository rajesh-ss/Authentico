import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight,
  Eye,
  FileText,
  User,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Mock pending requests
const pendingRequests = [
  {
    id: 'REV-2024-108',
    studentName: 'Priya Sharma',
    regNo: '2021CS1045',
    subjects: ['Database Management', 'Computer Networks'],
    reason: 'Discrepancy in answer evaluation for Q3 and Q5',
    submittedAt: new Date(Date.now() - 3600000),
    documents: 2,
    oldMarks: { 'Database Management': 42, 'Computer Networks': 38 },
  },
  {
    id: 'REV-2024-107',
    studentName: 'Rahul Verma',
    regNo: '2021CS1089',
    subjects: ['Data Structures'],
    reason: 'Answer sheet review requested for practical exam',
    submittedAt: new Date(Date.now() - 7200000),
    documents: 1,
    oldMarks: { 'Data Structures': 35 },
  },
  {
    id: 'REV-2024-106',
    studentName: 'Ananya Patel',
    regNo: '2021CS1023',
    subjects: ['Machine Learning', 'Artificial Intelligence'],
    reason: 'Re-totaling of marks required',
    submittedAt: new Date(Date.now() - 14400000),
    documents: 3,
    oldMarks: { 'Machine Learning': 48, 'Artificial Intelligence': 45 },
  },
];

export default function ApproverDashboard() {
  return (
    <DashboardLayout 
      title="Re-Evaluation Approvals" 
      subtitle="Review and approve re-evaluation requests"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Pending Approvals"
          value="8"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Approved Today"
          value="3"
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Rejected Today"
          value="1"
          icon={XCircle}
          variant="danger"
        />
        <StatsCard
          title="Total This Month"
          value="45"
          icon={ClipboardCheck}
          variant="default"
        />
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Pending Requests</CardTitle>
          <Badge variant="warning">{pendingRequests.length} pending</Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div 
                key={request.id}
                className="border rounded-lg p-4 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono">{request.id}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(request.submittedAt, 'MMM d, h:mm a')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{request.studentName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{request.regNo}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {request.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}: {request.oldMarks[subject as keyof typeof request.oldMarks]} marks
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-start gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {request.documents} supporting document{request.documents > 1 ? 's' : ''} attached
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button variant="approve" size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="reject" size="sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
