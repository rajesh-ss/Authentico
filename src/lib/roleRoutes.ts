import { Roles, getPrimaryRole } from '@/types/auth';

export const getRoleDefaultRoute = (roles: Roles[]): string => {
  const primaryRole = getPrimaryRole(roles);

  if (!primaryRole) return '/';

  console.log('primaryRole', primaryRole);

  // Define priority of roles and their routes
  switch (primaryRole) {
    case Roles.ADMIN:
      return '/admin/dashboard';
    case Roles.ISSUER:
    case Roles.APPROVER:
    case Roles.CHECKER:
    case Roles.MAKER:
    case Roles.STUDENT:
      return '/dashboard';
    default:
      return '/';
  }
};
