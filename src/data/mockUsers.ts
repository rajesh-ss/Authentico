import { Roles, User } from '@/types/auth';

export interface ManagedUser extends User {
  status: 'active' | 'inactive';
  createdAt: Date;
}

export const mockUsers: ManagedUser[] = [
  {
    userId: '1',
    email: 'issuer@university.edu',
    name: 'Dr. Sarah Johnson',
    roles: [Roles.ISSUER],
    department: 'Computer Science',
    institution: 'State University',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    userId: '2',
    email: 'admin@university.edu',
    name: 'Admin User',
    roles: [Roles.ADMIN],
    department: 'Administration',
    institution: 'State University',
    status: 'active',
    createdAt: new Date('2024-01-10'),
  },
  {
    userId: '3',
    email: 'checker@university.edu',
    name: 'Robert Wilson',
    roles: [Roles.CHECKER],
    department: 'Examination',
    institution: 'State University',
    status: 'active',
    createdAt: new Date('2024-01-20'),
  },
  {
    userId: '4',
    email: 'approver@university.edu',
    name: 'Dr. Emily Chen',
    roles: [Roles.APPROVER],
    department: 'Registry',
    institution: 'State University',
    status: 'active',
    createdAt: new Date('2024-01-22'),
  },
  {
    userId: '5',
    email: 'student@university.edu',
    name: 'John Doe',
    roles: [Roles.STUDENT],
    department: 'Engineering',
    institution: 'State University',
    status: 'active',
    createdAt: new Date('2024-01-25'),
  },
  {
    userId: '6',
    email: 'maker@university.edu',
    name: 'Alice Smith',
    roles: [Roles.MAKER],
    department: 'Examination',
    institution: 'State University',
    status: 'active',
    createdAt: new Date('2024-02-01'),
  },
];

export const availableRoles = Object.values(Roles);
