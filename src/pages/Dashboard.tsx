import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getRoleDefaultRoute } from '@/lib/roleRoutes';
import IssuerDashboard from './dashboard/IssuerDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import StudentDashboard from './dashboard/StudentDashboard';
import ApproverDashboard from './dashboard/ApproverDashboard';
import VerifierDashboard from './dashboard/VerifierDashboard';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // For college_admin, show the admin dashboard
  // For other roles, redirect to their default route
  switch (user.role) {
    case 'college_admin':
      return <AdminDashboard />;
    case 'issuer':
      return <IssuerDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'reevaluation_approver':
      return <ApproverDashboard />;
    case 'reevaluation_updater':
      return <ApproverDashboard />;
    case 'verifying_admin':
      return <VerifierDashboard />;
    default:
      return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
  }
}
