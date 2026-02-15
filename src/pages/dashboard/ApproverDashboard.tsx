import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsGrid } from '@/components/shared';
import { SignatureProgress } from '@/components/reevaluation/SignatureProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Pen,
  CheckCircle2,
  Clock,
  User,
  ArrowLeftRight,
  Eye,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { detailsChangeService, DetailsChangeData } from '@/services/details-change.service';

const pendingSignatures = [
  {
    id: 'SIG-2024-045',
    studentName: 'Rahul Verma',
    regNo: '2021CS1089',
    type: 'Re-Evaluation',
    subject: 'Data Structures',
    oldMarks: 35,
    newMarks: 42,
    approval: {
      requiredSignatures: 3,
      currentSignatures: [
        {
          adminId: '1',
          adminName: 'Dr. Emily Davis',
          timestamp: new Date(Date.now() - 7200000),
          signature: 'sig1',
          transactionHash: '0x8f4a2c1e...',
        },
        {
          adminId: '2',
          adminName: 'Prof. Robert Chen',
          timestamp: new Date(Date.now() - 3600000),
          signature: 'sig2',
          transactionHash: '0x1a2b3c4d...',
        },
      ],
      status: 'pending' as const,
    },
    submittedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'SIG-2024-044',
    studentName: 'Priya Sharma',
    regNo: '2021CS1045',
    type: 'Re-Evaluation',
    subject: 'Database Management',
    oldMarks: 42,
    newMarks: 48,
    approval: {
      requiredSignatures: 3,
      currentSignatures: [
        {
          adminId: '3',
          adminName: 'Dr. Emily Davis',
          timestamp: new Date(Date.now() - 14400000),
          signature: 'sig3',
          transactionHash: '0xabcdef12...',
        },
      ],
      status: 'pending' as const,
    },
    submittedAt: new Date(Date.now() - 172800000),
  },
];

export default function ApproverDashboard() {
  const [detailsRequests, setDetailsRequests] = useState<DetailsChangeData[]>([]);

  useEffect(() => {
    const fetchDetailsRequests = async () => {
      try {
        const response = await detailsChangeService.getPendingRequests();
        if (response.success) {
          setDetailsRequests(response.data);
        }
      } catch (err) {
        console.error('Error fetching details requests:', err);
      }
    };

    fetchDetailsRequests();
  }, []);

  const handleDetailsAction = (id: string, action: string) => {
    toast.info(`${action} functionality for request ${id.slice(-6)} coming soon`);
  };

  const stats = [
    {
      icon: Pen,
      value: pendingSignatures.length + detailsRequests.length,
      label: 'Pending',
      color: 'warning' as const,
    },
    { icon: CheckCircle2, value: 4, label: 'Approved Today', color: 'success' as const },
    { icon: Clock, value: 3, label: 'Awaiting Others', color: 'accent' as const },
    { icon: Shield, value: 128, label: 'Total Approved', color: 'primary' as const },
  ];

  return (
    <DashboardLayout
      title="Approver Dashboard"
      subtitle="Final approval and blockchain verification"
    >
      <StatsGrid stats={stats} columns={4} />

      <div className="space-y-6">
        {/* Details Change Requests Section */}
        {detailsRequests.length > 0 && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Pending Details Approvals
              </CardTitle>
              <Badge variant="default">{detailsRequests.length} pending</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detailsRequests.map((req) => (
                  <div key={req._id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">ID: {req._id.slice(-8).toUpperCase()}</span>
                          <span>• {format(new Date(req.createdAt), 'MMM d, h:mm a')}</span>
                          <span>• Recommended by: {req.requestedBy.slice(0, 8)}...</span>
                        </div>
                        <p className="font-medium">Student Roll No: {req.rollNo}</p>
                        <div className="space-y-1">
                          {Object.entries(req.changes).map(([field, val]) => (
                            <div key={field} className="flex items-center gap-2 text-sm">
                              <span className="font-medium capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="font-bold text-primary">{val as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDetailsAction(req._id, 'Review')}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDetailsAction(req._id, 'Sign & Approve')}
                          className="bg-primary hover:bg-primary/90 text-white gap-2"
                        >
                          <Pen className="h-3 w-3" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Signature Requests */}
        {pendingSignatures.map((sig) => (
          <Card key={sig.id}>
            <CardHeader className="flex flex-col md:flex-row md:items-start justify-between pb-2 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <CardTitle className="text-lg font-semibold">{sig.id}</CardTitle>
                  <Badge variant="warning">{sig.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Submitted {format(sig.submittedAt, 'PPp')}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Full Record
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{sig.studentName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{sig.regNo}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Subject</p>
                      <p className="font-medium text-foreground">{sig.subject}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-3">Marks Update</p>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Previous</p>
                        <p className="text-2xl font-bold text-foreground">{sig.oldMarks}</p>
                      </div>
                      <ArrowLeftRight className="h-5 w-5 text-muted-foreground mx-4" />
                      <div className="text-center flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Updated</p>
                        <p className="text-2xl font-bold text-success">{sig.newMarks}</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Change</p>
                        <p className="text-2xl font-bold text-accent">
                          +{sig.newMarks - sig.oldMarks}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <SignatureProgress
                  approval={sig.approval}
                  canSign={true}
                  onSign={() =>
                    toast.info('Digital signature functionality requires backend integration')
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
