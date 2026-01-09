import { UserRole } from '@/types/auth';

// Demo accounts for login
export const demoAccounts = [
  { email: 'issuer@university.edu', role: 'Marks Card Issuer' },
  { email: 'admin@university.edu', role: 'College Admin' },
  { email: 'checker@university.edu', role: 'Re-Evaluation Checker' },
  { email: 'approver@university.edu', role: 'Re-Evaluation Approver' },
  { email: 'student@university.edu', role: 'Student' },
  { email: 'maker@university.edu', role: 'Maker' },
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
  reevaluation_checker: 'Re-Evaluation Checker',
  reevaluation_updater: 'Re-Evaluation Updater',
  reevaluation_approver: 'Re-Evaluation Approver',
  student: 'Student',
  maker: 'Maker',
};

// Status badge variants mapping
export const marksCardStatusVariant = {
  issued: 'issued' as const,
  reevaluated: 'reevaluated' as const,
  superseded: 'superseded' as const,
};
