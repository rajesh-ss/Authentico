import { ReEvaluationStatus } from '@/types/blockchain';

export interface ReEvaluationItem {
  id: string;
  studentName: string;
  studentId: string;
  marksCardId: string;
  semester: string;
  field: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: ReEvaluationStatus;
  submittedAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  // Keep subjects for backward compatibility
  subjects: string[];
}

export const mockReEvaluations: ReEvaluationItem[] = [
  {
    id: 'DET-001',
    studentName: 'Alex Thompson',
    studentId: 'STU-2024-001',
    marksCardId: 'MC-2024-CS-001',
    semester: 'Semester 6',
    field: 'Student Name',
    currentValue: 'Alex Thompson',
    requestedValue: 'Alexander James Thompson',
    subjects: [],
    reason: 'Full legal name as per passport and official documents needs to be updated.',
    status: 'submitted',
    submittedAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: 'DET-002',
    studentName: 'Maria Garcia',
    studentId: 'STU-2024-015',
    marksCardId: 'MC-2024-CS-015',
    semester: 'Semester 4',
    field: 'Roll Number',
    currentValue: '2024CS015',
    requestedValue: '2024CS051',
    subjects: [],
    reason: 'Clerical error in roll number assignment during admission.',
    status: 'under_review',
    submittedAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-21'),
    assignedTo: 'Dr. Emily Davis',
  },
  {
    id: 'DET-003',
    studentName: 'John Smith',
    studentId: 'STU-2024-023',
    marksCardId: 'MC-2024-EE-023',
    semester: 'Semester 5',
    field: 'Registration Number',
    currentValue: 'REG2024023',
    requestedValue: 'REG2024032',
    subjects: [],
    reason: 'Registration number was swapped with another student during data entry.',
    status: 'approved',
    submittedAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-19'),
    assignedTo: 'Mr. James Wilson',
  },
  {
    id: 'DET-004',
    studentName: 'Emily Chen',
    studentId: 'STU-2024-042',
    marksCardId: 'MC-2024-ME-042',
    semester: 'Semester 3',
    field: 'Student Name',
    currentValue: 'Emily Chen',
    requestedValue: 'Emily Wei Chen',
    subjects: [],
    reason: 'Middle name missing from records, needs to match official documents.',
    status: 'rejected',
    submittedAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-14'),
  },
];

export const reEvaluationStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
];
