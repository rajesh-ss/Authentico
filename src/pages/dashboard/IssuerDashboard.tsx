import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecentMarksCards } from '@/components/dashboard/RecentMarksCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, RefreshCcw, ArrowRight } from 'lucide-react';
import { MarksCard } from '@/types/blockchain';
import { Link } from 'react-router-dom';

const mockCards: MarksCard[] = [
  {
    id: '1', studentId: 'STU001', studentName: 'Priya Sharma', registrationNumber: '2021CS1045',
    semester: 'Sem 6', academicYear: '2023-24', subjects: [], totalMarks: 542, percentage: 78.5,
    grade: 'A', status: 'issued', version: 1, qrCode: 'qr-1',
    blockchain: { id: 'tx1', hash: '0x8f4a2c1e...', timestamp: new Date(), status: 'confirmed', type: 'issue' },
    issuedAt: new Date(), issuedBy: 'Dr. Sarah Johnson',
  },
  {
    id: '2', studentId: 'STU002', studentName: 'Rahul Verma', registrationNumber: '2021CS1089',
    semester: 'Sem 6', academicYear: '2023-24', subjects: [], totalMarks: 498, percentage: 72.1,
    grade: 'B+', status: 'reevaluated', version: 2, qrCode: 'qr-2',
    blockchain: { id: 'tx2', hash: '0x1a2b3c4d...', timestamp: new Date(Date.now() - 3600000), status: 'confirmed', type: 'reevaluation' },
    issuedAt: new Date(Date.now() - 86400000), issuedBy: 'Dr. Sarah Johnson', previousVersion: '0x...',
  },
  {
    id: '3', studentId: 'STU003', studentName: 'Ananya Patel', registrationNumber: '2021CS1023',
    semester: 'Sem 6', academicYear: '2023-24', subjects: [], totalMarks: 612, percentage: 88.7,
    grade: 'A+', status: 'pending_verification', version: 1, qrCode: 'qr-3',
    blockchain: { id: 'tx3', hash: '0xabcdef12...', timestamp: new Date(Date.now() - 1800000), status: 'pending', type: 'issue' },
    issuedAt: new Date(Date.now() - 1800000), issuedBy: 'Dr. Sarah Johnson',
  },
];

const quickActions = [
  { to: '/issue/template', icon: Upload, title: 'Issue New Cards', desc: 'Upload template & data', color: 'primary' },
  { to: '/cards', icon: FileText, title: 'View All Cards', desc: '1,248 issued cards', color: 'success' },
  { to: '/reevaluations', icon: RefreshCcw, title: 'Re-Evaluations', desc: '8 pending requests', color: 'warning', badge: '8' },
];

export default function IssuerDashboard() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, Dr. Sarah Johnson">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to}>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg bg-${action.color}/10 flex items-center justify-center group-hover:bg-${action.color}/20 transition-colors`}>
                  <action.icon className={`h-6 w-6 text-${action.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
                {action.badge ? (
                  <Badge variant="warning" className="group-hover:animate-pulse">{action.badge}</Badge>
                ) : (
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Marks Cards</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/cards">View All<ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <RecentMarksCards cards={mockCards} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
