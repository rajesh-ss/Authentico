import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getRoleDefaultRoute } from '@/lib/roleRoutes';
import IssuerDashboard from './dashboard/IssuerDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import StudentDashboard from './dashboard/StudentDashboard';
import CheckerDashboard from './dashboard/CheckerDashboard';
import ApproverDashboard from './dashboard/ApproverDashboard';
import MakerDashboard from './dashboard/MakerDashboard';

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
    case 'reevaluation_checker':
      return <CheckerDashboard />;
    case 'reevaluation_updater':
      return <CheckerDashboard />;
    case 'reevaluation_approver':
      return <ApproverDashboard />;
    case 'maker':
      return <MakerDashboard />;
    default:
      return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
  }
}
