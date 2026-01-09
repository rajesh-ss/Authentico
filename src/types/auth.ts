export type UserRole = 
  | 'issuer' 
  | 'college_admin' 
  | 'reevaluation_checker' 
  | 'reevaluation_updater' 
  | 'reevaluation_approver' 
  | 'student'
  | 'maker';

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
  reevaluation_checker: 'Re-Evaluation Checker',
  reevaluation_updater: 'Re-Evaluation Updater',
  reevaluation_approver: 'Re-Evaluation Approver',
  student: 'Student',
  maker: 'Maker',
};

export const roleDescriptions: Record<UserRole, string> = {
  issuer: 'Generate and issue blockchain-verified marks cards',
  college_admin: 'Full administrative access to manage users and verify records',
  reevaluation_checker: 'Review and check re-evaluation requests',
  reevaluation_updater: 'Update marks after re-evaluation approval',
  reevaluation_approver: 'Provide final approval and digital signatures for verification',
  student: 'View marks cards and submit re-evaluation requests',
  maker: 'Validate and initiate re-evaluation requests from students',
};
