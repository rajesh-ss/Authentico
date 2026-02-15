export enum Roles {
  ADMIN = 'ADMIN',
  ISSUER = 'ISSUER',
  STUDENT = 'STUDENT',
  MAKER = 'MAKER',
  CHECKER = 'CHECKER',
  APPROVER = 'APPROVER',
}

export type RoleNameTypes = Roles;
export type UserRole = Roles;

export interface User {
  userId: string;
  email: string;
  name: string;
  roles: Roles[];
  avatar?: string;
  department?: string;
  institution?: string;
  walletConnected?: boolean;
  walletAddress?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const roleLabels: Record<Roles, string> = {
  [Roles.ISSUER]: 'Marks Card Issuer',
  [Roles.ADMIN]: 'System Administrator',
  [Roles.CHECKER]: 'Re-Evaluation Checker',
  [Roles.APPROVER]: 'Re-Evaluation Approver',
  [Roles.STUDENT]: 'Student',
  [Roles.MAKER]: 'Maker',
};

export const roleDescriptions: Record<Roles, string> = {
  [Roles.ISSUER]: 'Generate and issue blockchain-verified marks cards',
  [Roles.ADMIN]: 'Super admin access to all system features and user management',
  [Roles.CHECKER]: 'Review, check, and update re-evaluation requests',
  [Roles.APPROVER]: 'Provide final approval and digital signatures for verification',
  [Roles.STUDENT]: 'View marks cards and submit re-evaluation requests',
  [Roles.MAKER]: 'Validate and initiate re-evaluation requests from students',
};

export const rolePriority: Roles[] = [
  Roles.ADMIN,
  Roles.APPROVER,
  Roles.ISSUER,
  Roles.CHECKER,
  Roles.MAKER,
  Roles.STUDENT,
];

export const getPrimaryRole = (roles: Roles[]): Roles | undefined => {
  if (!roles || roles.length === 0) return undefined;
  return rolePriority.find((role) => roles.includes(role)) || roles[0];
};

export const getRoleLabel = (role: Roles): string => {
  return roleLabels[role] || role;
};
