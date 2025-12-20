import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  RefreshCcw, 
  Shield, 
  UserPlus,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const mockActivity = [
  {
    id: '1',
    type: 'user' as const,
    title: 'New User Created',
    description: 'Mr. James Wilson added as Re-Evaluation Updater',
    timestamp: new Date(Date.now() - 600000),
    actor: 'Prof. Robert Chen',
  },
  {
    id: '2',
    type: 'approval' as const,
    title: 'Re-evaluation Completed',
    description: 'Request #REV-2024-089 fully verified',
    timestamp: new Date(Date.now() - 3600000),
    actor: 'Multi-sig (3/3)',
    transactionHash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
  },
  {
    id: '3',
    type: 'issue' as const,
    title: 'Batch Issue Complete',
    description: '156 marks cards registered on blockchain',
    timestamp: new Date(Date.now() - 7200000),
    actor: 'Dr. Sarah Johnson',
    transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: '4',
    type: 'verification' as const,
    title: 'Audit Log Exported',
    description: 'Monthly audit report generated',
    timestamp: new Date(Date.now() - 14400000),
    actor: 'System',
  },
];

const userStats = [
  { role: 'Marks Card Issuers', count: 5, active: 4 },
  { role: 'Re-Evaluation Approvers', count: 3, active: 3 },
  { role: 'Re-Evaluation Updaters', count: 2, active: 2 },
  { role: 'Verifying Admins', count: 6, active: 5 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="System overview and management"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value="24"
          change={{ value: 8, trend: 'up' }}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Marks Cards Issued"
          value="4,582"
          change={{ value: 15, trend: 'up' }}
          icon={FileText}
          variant="success"
        />
        <StatsCard
          title="Re-Evaluations Active"
          value="12"
          icon={RefreshCcw}
          variant="warning"
        />
        <StatsCard
          title="Blockchain Integrity"
          value="100%"
          icon={Shield}
          variant="blockchain"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/users">
          <Card variant="interactive" className="group h-full">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <UserPlus className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Add User</h3>
                <p className="text-xs text-muted-foreground">Create new account</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/verify">
          <Card variant="interactive" className="group h-full">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Verify Records</h3>
                <p className="text-xs text-muted-foreground">QR verification</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/audit">
          <Card variant="interactive" className="group h-full">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Audit Logs</h3>
                <p className="text-xs text-muted-foreground">View all activity</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reevaluations">
          <Card variant="interactive" className="group h-full">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                <RefreshCcw className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Re-Evaluations</h3>
                <p className="text-xs text-muted-foreground">12 in progress</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">User Management</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/users">
                  Manage Users
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {userStats.map((stat) => (
                  <div key={stat.role} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-sm font-medium text-foreground">{stat.role}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{stat.active}</span>
                        <span className="text-sm text-muted-foreground">/{stat.count}</span>
                      </div>
                      <Badge variant={stat.active === stat.count ? 'success' : 'warning'} className="text-xs">
                        {stat.active === stat.count ? 'All Active' : `${stat.count - stat.active} Inactive`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">System Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Blockchain Sync</span>
                    <Badge variant="success">Healthy</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Last block: #18,234,567</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pending Signatures</span>
                    <Badge variant="warning">6 pending</Badge>
                  </div>
                  <Progress value={40} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">4 completed today</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Storage Usage</span>
                    <span className="text-sm font-medium">2.4 GB</span>
                  </div>
                  <Progress value={24} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">10 GB allocated</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">API Health</span>
                    <Badge variant="success">99.9%</Badge>
                  </div>
                  <Progress value={99} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Uptime this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <div>
          <Card className="h-fit">
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
