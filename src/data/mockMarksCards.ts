export interface MarksCardSubject {
  code: string;
  name: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  credits: number;
}

export interface MarksCard {
  id: string;
  semester: string;
  academicYear: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  cgpa: number;
  status: 'issued' | 'reevaluated' | 'superseded';
  version: number;
  issuedAt: Date;
  subjects: MarksCardSubject[];
  blockchain: {
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    timestamp?: Date;
  };
}

export const mockMarksCards: MarksCard[] = [
  {
    id: '1',
    semester: 'Semester 6',
    academicYear: '2023-24',
    totalMarks: 542,
    maxMarks: 700,
    percentage: 77.4,
    grade: 'A',
    cgpa: 8.2,
    status: 'issued',
    version: 1,
    issuedAt: new Date('2024-05-15'),
    subjects: [
      { code: 'CS601', name: 'Machine Learning', internalMarks: 22, externalMarks: 50, totalMarks: 72, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS602', name: 'Data Structures', internalMarks: 18, externalMarks: 47, totalMarks: 65, maxMarks: 100, grade: 'B+', credits: 4 },
      { code: 'CS603', name: 'Algorithms', internalMarks: 20, externalMarks: 38, totalMarks: 58, maxMarks: 100, grade: 'B', credits: 3 },
      { code: 'CS604', name: 'Database Systems', internalMarks: 25, externalMarks: 53, totalMarks: 78, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS605', name: 'Computer Networks', internalMarks: 23, externalMarks: 47, totalMarks: 70, maxMarks: 100, grade: 'A', credits: 3 },
      { code: 'CS606', name: 'Software Engineering', internalMarks: 24, externalMarks: 51, totalMarks: 75, maxMarks: 100, grade: 'A', credits: 3 },
      { code: 'CS607', name: 'Project Work', internalMarks: 90, externalMarks: 34, totalMarks: 124, maxMarks: 200, grade: 'B+', credits: 6 },
    ],
    blockchain: {
      hash: '0x8f4a2c1e9b7d3f6a5c8e1b4d7f2a9c6e3b8d1f4a7c0e3b6d9f2a5c8e1b4d7f2a',
      status: 'confirmed',
      blockNumber: 18234567,
      timestamp: new Date('2024-05-15T10:30:00'),
    },
  },
  {
    id: '2',
    semester: 'Semester 5',
    academicYear: '2023-24',
    totalMarks: 498,
    maxMarks: 700,
    percentage: 71.1,
    grade: 'B+',
    cgpa: 7.8,
    status: 'reevaluated',
    version: 2,
    issuedAt: new Date('2024-01-10'),
    subjects: [
      { code: 'CS501', name: 'Operating Systems', internalMarks: 20, externalMarks: 48, totalMarks: 68, maxMarks: 100, grade: 'B+', credits: 4 },
      { code: 'CS502', name: 'Software Engineering', internalMarks: 22, externalMarks: 53, totalMarks: 75, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS503', name: 'Web Technologies', internalMarks: 25, externalMarks: 57, totalMarks: 82, maxMarks: 100, grade: 'A+', credits: 3 },
      { code: 'CS504', name: 'Compiler Design', internalMarks: 15, externalMarks: 40, totalMarks: 55, maxMarks: 100, grade: 'B', credits: 3 },
      { code: 'CS505', name: 'Cloud Computing', internalMarks: 21, externalMarks: 44, totalMarks: 65, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS506', name: 'Cryptography', internalMarks: 19, externalMarks: 38, totalMarks: 57, maxMarks: 100, grade: 'B', credits: 3 },
      { code: 'CS507', name: 'Mini Project', internalMarks: 70, externalMarks: 26, totalMarks: 96, maxMarks: 200, grade: 'C+', credits: 4 },
    ],
    blockchain: {
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678',
      status: 'confirmed',
      blockNumber: 18123456,
      timestamp: new Date('2024-01-10T14:20:00'),
    },
  },
  {
    id: '3',
    semester: 'Semester 4',
    academicYear: '2022-23',
    totalMarks: 512,
    maxMarks: 700,
    percentage: 73.1,
    grade: 'A',
    cgpa: 7.9,
    status: 'issued',
    version: 1,
    issuedAt: new Date('2023-06-20'),
    subjects: [
      { code: 'CS401', name: 'Theory of Computation', internalMarks: 18, externalMarks: 52, totalMarks: 70, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS402', name: 'Design Patterns', internalMarks: 23, externalMarks: 45, totalMarks: 68, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS403', name: 'Computer Architecture', internalMarks: 21, externalMarks: 54, totalMarks: 75, maxMarks: 100, grade: 'A', credits: 4 },
      { code: 'CS404', name: 'Discrete Mathematics', internalMarks: 20, externalMarks: 42, totalMarks: 62, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS405', name: 'Artificial Intelligence', internalMarks: 24, externalMarks: 56, totalMarks: 80, maxMarks: 100, grade: 'A+', credits: 4 },
      { code: 'CS406', name: 'Mobile App Development', internalMarks: 22, externalMarks: 45, totalMarks: 67, maxMarks: 100, grade: 'B+', credits: 3 },
      { code: 'CS407', name: 'Lab Work', internalMarks: 60, externalMarks: 30, totalMarks: 90, maxMarks: 200, grade: 'C+', credits: 4 },
    ],
    blockchain: {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
      status: 'confirmed',
      blockNumber: 17234567,
      timestamp: new Date('2023-06-20T09:15:00'),
    },
  },
];
