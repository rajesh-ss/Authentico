import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsGrid } from '@/components/shared';
import { SignatureProgress } from '@/components/reevaluation/SignatureProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pen, CheckCircle2, Clock, User, ArrowLeftRight, Eye, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MultiSignatureApproval } from '@/types/blockchain';

interface PendingSignature {
  id: string;
  studentName: string;
  regNo: string;
  type: string;
  subject: string;
  oldMarks: number;
  newMarks: number;
  approval: MultiSignatureApproval;
  submittedAt: Date;
}

const initialPendingSignatures: PendingSignature[] = [
  {
    id: 'SIG-2024-045', studentName: 'Rahul Verma', regNo: '2021CS1089',
    type: 'Re-Evaluation', subject: 'Data Structures', oldMarks: 35, newMarks: 42,
    approval: {
      requiredSignatures: 3,
      currentSignatures: [
        { adminId: '1', adminName: 'Dr. Emily Davis', timestamp: new Date(Date.now() - 7200000), signature: 'sig1', transactionHash: '0x8f4a2c1e...' },
        { adminId: '2', adminName: 'Prof. Robert Chen', timestamp: new Date(Date.now() - 3600000), signature: 'sig2', transactionHash: '0x1a2b3c4d...' },
      ],
      status: 'pending',
    },
    submittedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'SIG-2024-044', studentName: 'Priya Sharma', regNo: '2021CS1045',
    type: 'Re-Evaluation', subject: 'Database Management', oldMarks: 42, newMarks: 48,
    approval: {
      requiredSignatures: 3,
      currentSignatures: [
        { adminId: '3', adminName: 'Dr. Emily Davis', timestamp: new Date(Date.now() - 14400000), signature: 'sig3', transactionHash: '0xabcdef12...' },
      ],
      status: 'pending',
    },
    submittedAt: new Date(Date.now() - 172800000),
  },
];

export default function PendingSignatures() {
  const [signatures, setSignatures] = useState(initialPendingSignatures);

  const stats = [
    { icon: Pen, value: signatures.length, label: 'Pending Signatures', color: 'warning' as const },
    { icon: Clock, value: signatures.filter(s => s.approval.currentSignatures.length > 0).length, label: 'Partially Signed', color: 'accent' as const },
    { icon: CheckCircle2, value: 4, label: 'Signed Today', color: 'success' as const },
    { icon: Shield, value: 128, label: 'Total Verified', color: 'primary' as const },
  ];

  const handleSign = (sigId: string) => {
    setSignatures(prev => prev.map(sig => {
      if (sig.id !== sigId) return sig;
      const newSig = {
        adminId: 'current',
        adminName: 'Dr. Michael Brown',
        timestamp: new Date(),
        signature: `sig_${Date.now()}`,
        transactionHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
      };
      const updated = [...sig.approval.currentSignatures, newSig];
      return {
        ...sig,
        approval: { ...sig.approval, currentSignatures: updated, status: updated.length >= sig.approval.requiredSignatures ? 'approved' as const : 'pending' as const },
      };
    }));
    toast.success('Signature added successfully');
  };

  return (
    <DashboardLayout title="Pending Approvals" subtitle="Final approval and blockchain verification">
      <StatsGrid stats={stats} columns={4} />
      <div className="space-y-6">
        {signatures.map((sig) => (
          <Card key={sig.id}>
            <CardHeader className="flex flex-col md:flex-row md:items-start justify-between pb-2 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <CardTitle className="text-lg font-semibold">{sig.id}</CardTitle>
                  <Badge variant="warning">{sig.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Submitted {format(sig.submittedAt, 'PPp')}</p>
              </div>
              <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
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
                        <p className="font-medium">{sig.studentName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{sig.regNo}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Subject</p>
                      <p className="font-medium">{sig.subject}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-3">Marks Update</p>
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between">
                      <div className="text-center flex-1"><p className="text-xs text-muted-foreground">Previous</p><p className="text-xl sm:text-2xl font-bold">{sig.oldMarks}</p></div>
                      <div className="hidden sm:flex items-center justify-center"><ArrowLeftRight className="h-5 w-5 text-muted-foreground" /></div>
                      <div className="text-center flex-1"><p className="text-xs text-muted-foreground">Updated</p><p className="text-xl sm:text-2xl font-bold text-success">{sig.newMarks}</p></div>
                      <div className="text-center flex-1"><p className="text-xs text-muted-foreground">Change</p><p className="text-xl sm:text-2xl font-bold text-accent">+{sig.newMarks - sig.oldMarks}</p></div>
                    </div>
                  </div>
                </div>
                <SignatureProgress approval={sig.approval} canSign={true} onSign={() => handleSign(sig.id)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
