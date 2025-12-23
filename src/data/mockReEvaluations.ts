import { ReEvaluationStatus } from '@/types/blockchain';

export interface ReEvaluationItem {
  id: string;
  studentName: string;
  studentId: string;
  marksCardId: string;
  semester: string;
  subjects: string[];
  reason: string;
  status: ReEvaluationStatus;
  submittedAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export const mockReEvaluations: ReEvaluationItem[] = [
  {
    id: 'RE-001',
    studentName: 'Alex Thompson',
    studentId: 'STU-2024-001',
    marksCardId: 'MC-2024-CS-001',
    semester: 'Semester 6',
    subjects: ['Database Systems', 'Computer Networks'],
    reason: 'Discrepancy in answer evaluation for Q3 and Q5 in Database Systems paper.',
    status: 'submitted',
    submittedAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: 'RE-002',
    studentName: 'Maria Garcia',
    studentId: 'STU-2024-015',
    marksCardId: 'MC-2024-CS-015',
    semester: 'Semester 4',
    subjects: ['Data Structures'],
    reason: 'Missing marks for practical component.',
    status: 'under_review',
    submittedAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-21'),
    assignedTo: 'Dr. Emily Davis',
  },
  {
    id: 'RE-003',
    studentName: 'John Smith',
    studentId: 'STU-2024-023',
    marksCardId: 'MC-2024-EE-023',
    semester: 'Semester 5',
    subjects: ['Digital Electronics', 'Signals & Systems'],
    reason: 'Calculation error in total marks.',
    status: 'approved',
    submittedAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-19'),
    assignedTo: 'Mr. James Wilson',
  },
  {
    id: 'RE-004',
    studentName: 'Emily Chen',
    studentId: 'STU-2024-042',
    marksCardId: 'MC-2024-ME-042',
    semester: 'Semester 3',
    subjects: ['Thermodynamics'],
    reason: 'Request re-evaluation due to significant deviation.',
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
  { value: 'marks_updated', label: 'Marks Updated' },
  { value: 'completed', label: 'Completed' },
];
