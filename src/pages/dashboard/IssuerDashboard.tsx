import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { RecentMarksCards } from '@/components/dashboard/RecentMarksCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  RefreshCcw, 
  Shield, 
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { MarksCard, BlockchainTransaction } from '@/types/blockchain';
import { Link } from 'react-router-dom';

// Mock data
const mockCards: MarksCard[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'Priya Sharma',
    registrationNumber: '2021CS1045',
    semester: 'Sem 6',
    academicYear: '2023-24',
    subjects: [],
    totalMarks: 542,
    percentage: 78.5,
    grade: 'A',
    status: 'issued',
    version: 1,
    qrCode: 'qr-code-1',
    blockchain: {
      id: 'tx1',
      hash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
      timestamp: new Date(),
      status: 'confirmed',
      type: 'issue',
    },
    issuedAt: new Date(),
    issuedBy: 'Dr. Sarah Johnson',
  },
  {
    id: '2',
    studentId: 'STU002',
    studentName: 'Rahul Verma',
    registrationNumber: '2021CS1089',
    semester: 'Sem 6',
    academicYear: '2023-24',
    subjects: [],
    totalMarks: 498,
    percentage: 72.1,
    grade: 'B+',
    status: 'reevaluated',
    version: 2,
    qrCode: 'qr-code-2',
    blockchain: {
      id: 'tx2',
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
      timestamp: new Date(Date.now() - 3600000),
      status: 'confirmed',
      type: 'reevaluation',
    },
    issuedAt: new Date(Date.now() - 86400000),
    issuedBy: 'Dr. Sarah Johnson',
    previousVersion: '0x...',
  },
  {
    id: '3',
    studentId: 'STU003',
    studentName: 'Ananya Patel',
    registrationNumber: '2021CS1023',
    semester: 'Sem 6',
    academicYear: '2023-24',
    subjects: [],
    totalMarks: 612,
    percentage: 88.7,
    grade: 'A+',
    status: 'pending_verification',
    version: 1,
    qrCode: 'qr-code-3',
    blockchain: {
      id: 'tx3',
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
      timestamp: new Date(Date.now() - 1800000),
      status: 'pending',
      type: 'issue',
    },
    issuedAt: new Date(Date.now() - 1800000),
    issuedBy: 'Dr. Sarah Johnson',
  },
];

const mockActivity = [
  {
    id: '1',
    type: 'issue' as const,
    title: 'Marks Cards Issued',
    description: '45 marks cards generated for Semester 6 batch',
    timestamp: new Date(Date.now() - 300000),
    actor: 'Dr. Sarah Johnson',
    transactionHash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
  },
  {
    id: '2',
    type: 'reevaluation' as const,
    title: 'Re-evaluation Request',
    description: 'New request received from Rahul Verma',
    timestamp: new Date(Date.now() - 3600000),
    actor: 'System',
  },
  {
    id: '3',
    type: 'verification' as const,
    title: 'Blockchain Verified',
    description: 'Batch verification completed successfully',
    timestamp: new Date(Date.now() - 7200000),
    actor: 'Blockchain Network',
    transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: '4',
    type: 'upload' as const,
    title: 'Data Uploaded',
    description: 'Excel file with 156 student records processed',
    timestamp: new Date(Date.now() - 14400000),
    actor: 'Dr. Sarah Johnson',
  },
];

export default function IssuerDashboard() {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back, Dr. Sarah Johnson"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Marks Cards"
          value="1,248"
          change={{ value: 12, trend: 'up' }}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Pending Verifications"
          value="23"
          change={{ value: 5, trend: 'down' }}
          icon={Shield}
          variant="warning"
        />
        <StatsCard
          title="Re-Evaluation Requests"
          value="8"
          icon={RefreshCcw}
          variant="blockchain"
        />
        <StatsCard
          title="Blockchain Txns Today"
          value="156"
          change={{ value: 23, trend: 'up' }}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Link to="/issue/template">
          <Card variant="interactive" className="group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Issue New Cards</h3>
                <p className="text-sm text-muted-foreground">Upload template & data</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/cards">
          <Card variant="interactive" className="group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">View All Cards</h3>
                <p className="text-sm text-muted-foreground">1,248 issued cards</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/reevaluations">
          <Card variant="interactive" className="group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                <RefreshCcw className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Re-Evaluations</h3>
                <p className="text-sm text-muted-foreground">8 pending requests</p>
              </div>
              <Badge variant="warning" className="group-hover:animate-pulse">8</Badge>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cards */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Marks Cards</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/cards">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <RecentMarksCards cards={mockCards} />
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityTimeline events={mockActivity} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
