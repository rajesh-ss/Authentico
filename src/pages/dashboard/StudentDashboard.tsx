import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionBadge } from '@/components/blockchain/TransactionBadge';
import { StatusBadge, StatsGrid } from '@/components/shared';
import { mockMarksCards } from '@/data';
import { GraduationCap, Download, Eye, QrCode, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const stats = [
    { icon: GraduationCap, value: mockMarksCards.length, label: 'Marks Cards', color: 'accent' as const },
    { icon: CheckCircle2, value: '8.2', label: 'Latest CGPA', color: 'success' as const },
  ];

  return (
    <DashboardLayout title="My Dashboard" subtitle="Welcome back, Alex Thompson">
      <StatsGrid stats={stats} columns={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marks Cards List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">My Marks Cards</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/my-cards">View All<ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {mockMarksCards.slice(0, 3).map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{card.semester}</h3>
                          <StatusBadge status={card.status} label={card.status === 'reevaluated' ? `v${card.version}` : 'Original'} size="sm" />
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
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><QrCode className="h-4 w-4" /></Button>
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
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Quick Actions</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/verify"><QrCode className="h-4 w-4 mr-2" />Verify Certificate</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />Download All Cards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
