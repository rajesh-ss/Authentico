import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { TransactionHash } from '@/components/blockchain/TransactionHash';
import { ReEvaluationTimeline } from '@/components/reevaluation/ReEvaluationTimeline';
import { 
  GraduationCap, 
  Download, 
  Eye, 
  RefreshCcw, 
  Shield,
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Mock data for student's marks cards
const studentMarksCards = [
  {
    id: '1',
    semester: 'Semester 6',
    academicYear: '2023-24',
    totalMarks: 542,
    percentage: 78.5,
    grade: 'A',
    status: 'issued' as const,
    version: 1,
    issuedAt: new Date('2024-05-15'),
    blockchain: {
      hash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
      status: 'confirmed' as const,
    },
  },
  {
    id: '2',
    semester: 'Semester 5',
    academicYear: '2023-24',
    totalMarks: 498,
    percentage: 72.1,
    grade: 'B+',
    status: 'reevaluated' as const,
    version: 2,
    issuedAt: new Date('2024-01-10'),
    blockchain: {
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
      status: 'confirmed' as const,
    },
  },
  {
    id: '3',
    semester: 'Semester 4',
    academicYear: '2022-23',
    totalMarks: 512,
    percentage: 74.2,
    grade: 'A',
    status: 'issued' as const,
    version: 1,
    issuedAt: new Date('2023-06-20'),
    blockchain: {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
      status: 'confirmed' as const,
    },
  },
];

// Mock re-evaluation request
const activeReEvaluation = {
  id: 'REV-2024-102',
  subjects: ['Data Structures', 'Algorithms'],
  currentStatus: 'marks_updated' as const,
  timeline: [
    {
      id: '1',
      status: 'submitted' as const,
      timestamp: new Date('2024-06-01'),
      actor: 'Alex Thompson',
      actorRole: 'Student',
    },
    {
      id: '2',
      status: 'under_review' as const,
      timestamp: new Date('2024-06-02'),
      actor: 'Dr. Emily Davis',
      actorRole: 'Re-Evaluation Approver',
    },
    {
      id: '3',
      status: 'approved' as const,
      timestamp: new Date('2024-06-05'),
      actor: 'Dr. Emily Davis',
      actorRole: 'Re-Evaluation Approver',
      comment: 'Approved for re-evaluation',
    },
    {
      id: '4',
      status: 'marks_updated' as const,
      timestamp: new Date('2024-06-08'),
      actor: 'Mr. James Wilson',
      actorRole: 'Re-Evaluation Updater',
      transactionHash: '0x9a8b7c6d5e4f3210fedcba9876543210fedcba9876543210fedcba98765432',
    },
  ],
};

const statusBadgeVariant = {
  issued: 'issued' as const,
  reevaluated: 'reevaluated' as const,
  superseded: 'superseded' as const,
  pending_verification: 'pending' as const,
};

export default function StudentDashboard() {
  return (
    <DashboardLayout 
      title="My Dashboard" 
      subtitle="Welcome back, Alex Thompson"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="blockchain" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Marks Cards</p>
              <p className="text-3xl font-bold text-foreground mt-1">6</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">All blockchain verified</p>
        </Card>

        <Card variant="success" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Latest CGPA</p>
              <p className="text-3xl font-bold text-foreground mt-1">8.2</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Semester 6</p>
        </Card>

        <Card variant="warning" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Re-Evaluation</p>
              <p className="text-3xl font-bold text-foreground mt-1">1</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <RefreshCcw className="h-6 w-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">In progress</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marks Cards List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">My Marks Cards</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/my-cards">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {studentMarksCards.map((card) => (
                  <div 
                    key={card.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{card.semester}</h3>
                          <Badge variant={statusBadgeVariant[card.status]} className="text-[10px]">
                            {card.status === 'reevaluated' ? `v${card.version}` : 'Original'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">{card.academicYear}</span>
                          <span className="text-sm font-medium text-foreground">{card.percentage}%</span>
                          <Badge variant="outline" className="text-xs">{card.grade}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TransactionBadge status={card.blockchain.status} size="sm" showIcon={false} />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/request-reevaluation">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Request Re-Evaluation
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/verify">
                  <QrCode className="h-4 w-4 mr-2" />
                  Verify Certificate
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download All Cards
              </Button>
            </CardContent>
          </Card>

          {/* Active Re-Evaluation */}
          {activeReEvaluation && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Re-Evaluation Status</CardTitle>
                  <Badge variant="pending">{activeReEvaluation.id}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Subjects: {activeReEvaluation.subjects.join(', ')}
                </p>
                <ReEvaluationTimeline 
                  events={activeReEvaluation.timeline}
                  currentStatus={activeReEvaluation.currentStatus}
                />
                <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-center gap-2 text-warning">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Pending Verification</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting multi-signature approval (1 of 3 completed)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
