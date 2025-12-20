export type UserRole = 
  | 'issuer' 
  | 'college_admin' 
  | 'reevaluation_approver' 
  | 'reevaluation_updater' 
  | 'verifying_admin' 
  | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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

export const roleLabels: Record<UserRole, string> = {
  issuer: 'Marks Card Issuer',
  college_admin: 'College Administrator',
  reevaluation_approver: 'Re-Evaluation Approver',
  reevaluation_updater: 'Re-Evaluation Updater',
  verifying_admin: 'Verifying Admin',
  student: 'Student',
};

export const roleDescriptions: Record<UserRole, string> = {
  issuer: 'Generate and issue blockchain-verified marks cards',
  college_admin: 'Full administrative access to manage users and verify records',
  reevaluation_approver: 'Review and approve re-evaluation requests',
  reevaluation_updater: 'Update marks after re-evaluation approval',
  verifying_admin: 'Provide digital signatures for multi-party verification',
  student: 'View marks cards and submit re-evaluation requests',
};
