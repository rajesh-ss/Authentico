import { UserRole } from '@/types/auth';

// Demo accounts for login
export const demoAccounts = [
  { email: 'issuer@university.edu', role: 'Marks Card Issuer' },
  { email: 'admin@university.edu', role: 'College Admin' },
  { email: 'approver@university.edu', role: 'Re-Evaluation Approver' },
  { email: 'verifier@university.edu', role: 'Verifying Admin' },
  { email: 'student@university.edu', role: 'Student' },
];

// Role filter options
export const roleFilterOptions = (roles: UserRole[]) => [
  { value: 'all', label: 'All Roles' },
  ...roles.map(role => ({ value: role, label: roleLabels[role] })),
];

// Role labels mapping
export const roleLabels: Record<UserRole, string> = {
  issuer: 'Marks Card Issuer',
  college_admin: 'College Admin',
  reevaluation_approver: 'Re-Evaluation Approver',
  reevaluation_updater: 'Re-Evaluation Updater',
  verifying_admin: 'Verifying Admin',
  student: 'Student',
};

// Status badge variants mapping
export const marksCardStatusVariant = {
  issued: 'issued' as const,
  reevaluated: 'reevaluated' as const,
  superseded: 'superseded' as const,
};
