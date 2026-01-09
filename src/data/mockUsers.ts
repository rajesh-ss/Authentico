import { UserRole } from '@/types/auth';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export const mockUsers: ManagedUser[] = [
  { id: '1', name: 'Dr. Sarah Johnson', email: 'issuer@university.edu', role: 'issuer', department: 'Computer Science', status: 'active', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Dr. Emily Davis', email: 'checker@university.edu', role: 'reevaluation_checker', department: 'Examination Cell', status: 'active', createdAt: new Date('2024-02-20') },
  { id: '3', name: 'Mr. James Wilson', email: 'updater@university.edu', role: 'reevaluation_updater', department: 'Examination Cell', status: 'active', createdAt: new Date('2024-03-10') },
  { id: '4', name: 'Dr. Michael Brown', email: 'approver@university.edu', role: 'reevaluation_approver', department: 'Quality Assurance', status: 'active', createdAt: new Date('2024-01-05') },
  { id: '5', name: 'Prof. Lisa Anderson', email: 'lisa@university.edu', role: 'issuer', department: 'Mathematics', status: 'inactive', createdAt: new Date('2023-11-20') },
  { id: '6', name: 'Dr. Robert Taylor', email: 'robert@university.edu', role: 'reevaluation_approver', department: 'Administration', status: 'active', createdAt: new Date('2024-04-01') },
  { id: '7', name: 'Prof. Anita Desai', email: 'maker@university.edu', role: 'maker', department: 'Computer Science', status: 'active', createdAt: new Date('2024-05-15') },
];

export const availableRoles: UserRole[] = ['issuer', 'reevaluation_checker', 'reevaluation_updater', 'reevaluation_approver', 'maker'];
