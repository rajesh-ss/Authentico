import { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Roles, getPrimaryRole } from '@/types/auth';

// Lazy load dashboard components
const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'));
const IssuerDashboard = lazy(() => import('./dashboard/IssuerDashboard'));
const StudentDashboard = lazy(() => import('./dashboard/StudentDashboard'));
const CheckerDashboard = lazy(() => import('./dashboard/CheckerDashboard'));
const ApproverDashboard = lazy(() => import('./dashboard/ApproverDashboard'));
const MakerDashboard = lazy(() => import('./dashboard/MakerDashboard'));

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const primaryRole = getPrimaryRole(user.roles);

  const renderDashboard = () => {
    if (primaryRole === Roles.ADMIN) return <AdminDashboard />;
    if (primaryRole === Roles.ISSUER) return <IssuerDashboard />;
    if (primaryRole === Roles.STUDENT) return <StudentDashboard />;
    if (primaryRole === Roles.CHECKER) return <CheckerDashboard />;
    if (primaryRole === Roles.APPROVER) return <ApproverDashboard />;
    if (primaryRole === Roles.MAKER) return <MakerDashboard />;

    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Dashboard Not Found</h2>
        <p className="text-muted-foreground mt-2">
          We couldn't find a dashboard for your assigned roles.
        </p>
      </div>
    );
  };

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">Loading dashboard...</div>
      }
    >
      {renderDashboard()}
    </Suspense>
  );
}
