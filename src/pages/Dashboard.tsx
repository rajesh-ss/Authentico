import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
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

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'issuer':
      return <IssuerDashboard />;
    case 'college_admin':
      return <AdminDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'reevaluation_approver':
      return <ApproverDashboard />;
    case 'reevaluation_updater':
      return <ApproverDashboard />; // Similar UI
    case 'verifying_admin':
      return <VerifierDashboard />;
    default:
      return <IssuerDashboard />;
  }
}
