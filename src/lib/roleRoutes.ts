import { UserRole } from '@/types/auth';

export const getRoleDefaultRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    issuer: '/dashboard',
    college_admin: '/dashboard',
    reevaluation_approver: '/approvals',
    reevaluation_updater: '/update-marks',
    verifying_admin: '/signatures',
    student: '/my-cards',
  };
  return routes[role] || '/dashboard';
};
