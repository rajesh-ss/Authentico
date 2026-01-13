import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsGrid } from '@/components/shared';
import { Users, RefreshCcw, UserPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const userStats = [
  { role: 'Marks Card Issuers', count: 5, active: 4 },
  { role: 'Re-Evaluation Checkers', count: 3, active: 3 },
  { role: 'Re-Evaluation Updaters', count: 2, active: 2 },
  { role: 'Re-Evaluation Approvers', count: 6, active: 5 },
];

export default function AdminDashboard() {
  const stats = [
    { icon: Users, value: 16, label: 'Total Users', color: 'primary' as const },
    { icon: RefreshCcw, value: 12, label: 'Re-Evals', color: 'warning' as const },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="System overview and management">
      <StatsGrid stats={stats} columns={2} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Link to="/users">
          <Card className="group hover:border-primary/50 transition-colors h-full">
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
        <Link to="/reevaluations">
          <Card className="group hover:border-primary/50 transition-colors h-full">
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

      {/* User Management Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">User Management</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/users">Manage Users<ArrowRight className="h-4 w-4 ml-1" /></Link>
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
    </DashboardLayout>
  );
}
