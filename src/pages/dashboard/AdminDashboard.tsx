import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Shield, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" subtitle="System overview and management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Users', value: '—', color: 'primary' },
          { icon: FileText, label: 'Total Uploads', value: '—', color: 'success' },
          { icon: Shield, label: 'Active Issuers', value: '—', color: 'warning' },
          { icon: Activity, label: 'Transactions', value: '—', color: 'accent' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 text-${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin features coming soon.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
