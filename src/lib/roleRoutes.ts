import { UserRole } from '@/types/auth';

export const getRoleDefaultRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    issuer: '/dashboard',
    college_admin: '/dashboard',
    reevaluation_checker: '/approvals',
    reevaluation_updater: '/update-marks',
    reevaluation_approver: '/signatures',
    student: '/my-cards',
    maker: '/maker/approvals',
  };
  return routes[role] || '/dashboard';
};
