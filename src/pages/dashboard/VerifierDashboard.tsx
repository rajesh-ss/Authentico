import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SignatureProgress } from '@/components/reevaluation/SignatureProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockchainInfo } from '@/components/blockchain/BlockchainInfo';
import { 
  Shield, 
  Pen, 
  CheckCircle2, 
  Clock,
  FileText,
  User,
  ArrowLeftRight,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

// Mock pending signatures
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
          transactionHash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
        },
        {
          adminId: '2',
          adminName: 'Prof. Robert Chen',
          timestamp: new Date(Date.now() - 3600000),
          signature: 'sig2',
          transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
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
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        },
      ],
      status: 'pending' as const,
    },
    submittedAt: new Date(Date.now() - 172800000),
  },
];

export default function VerifierDashboard() {
  return (
    <DashboardLayout 
      title="Verification Dashboard" 
      subtitle="Digital signature and blockchain verification"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Pending Signatures"
          value="6"
          icon={Pen}
          variant="warning"
        />
        <StatsCard
          title="Signed Today"
          value="4"
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Awaiting Others"
          value="3"
          icon={Clock}
          variant="blockchain"
        />
        <StatsCard
          title="Total Verified"
          value="128"
          icon={Shield}
          variant="default"
        />
      </div>

      {/* Pending Signatures */}
      <div className="space-y-6">
        {pendingSignatures.map((sig) => (
          <Card key={sig.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <CardTitle className="text-lg font-semibold">{sig.id}</CardTitle>
                  <Badge variant="pending">{sig.type}</Badge>
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
                {/* Student & Marks Info */}
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

                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-3 bg-background rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Subject</p>
                        <p className="font-medium text-foreground">{sig.subject}</p>
                      </div>
                    </div>
                  </div>

                  {/* Marks Comparison */}
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
                        <p className="text-2xl font-bold text-accent">+{sig.newMarks - sig.oldMarks}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Progress */}
                <SignatureProgress 
                  approval={sig.approval}
                  canSign={true}
                  onSign={() => console.log('Sign', sig.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
