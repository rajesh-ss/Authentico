// Student data types for batch details
export interface StudentSubject {
  code: string;
  name: string;
  credits: number;
  internal: number;
  external: number;
  total: number;
  grade: string;
}

export interface Student {
  id: string;
  studentName: string;
  registrationNo: string;
  rollNo: string;
  semester: string;
  academicYear: string;
  department: string;
  subjects: StudentSubject[];
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: 'verified' | 'pending';
  blockchainHash: string;
  issuedAt: Date;
}

// Constants for student generation
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Anika', 'Aadhya', 'Kiara', 'Riya', 'Pari', 'Aisha'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Joshi', 'Rao', 'Mehta', 'Shah', 'Desai', 'Pillai'];
const SUBJECTS = [
  { code: 'CS601', name: 'Machine Learning', credits: 4 },
  { code: 'CS602', name: 'Cloud Computing', credits: 4 },
  { code: 'CS603', name: 'Data Mining', credits: 3 },
  { code: 'CS604', name: 'Cyber Security', credits: 3 },
  { code: 'CS605', name: 'Big Data Analytics', credits: 3 },
];
const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];

// Generate mock student data for a batch
export function generateMockStudents(batchId: string, count: number): Student[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const studentSubjects = SUBJECTS.map(sub => {
      const internal = Math.floor(Math.random() * 10) + 20;
      const external = Math.floor(Math.random() * 20) + 40;
      return {
        ...sub,
        internal,
        external,
        total: internal + external,
        grade: GRADES[Math.floor(Math.random() * GRADES.length)],
      };
    });
    
    const totalMarks = studentSubjects.reduce((sum, s) => sum + s.total, 0);
    const percentage = (totalMarks / (SUBJECTS.length * 100)) * 100;
    
    return {
      id: `MC-${batchId.slice(-6)}-${String(i + 1).padStart(4, '0')}`,
      studentName: `${firstName} ${lastName}`,
      registrationNo: `REG${2024}${String(i + 1).padStart(4, '0')}`,
      rollNo: `${String(i + 1).padStart(3, '0')}`,
      semester: 'Semester 6',
      academicYear: '2023-2024',
      department: 'Computer Science & Engineering',
      subjects: studentSubjects,
      totalMarks,
      maxMarks: SUBJECTS.length * 100,
      percentage: Math.round(percentage * 100) / 100,
      grade: percentage >= 75 ? 'First Class with Distinction' : percentage >= 60 ? 'First Class' : percentage >= 50 ? 'Second Class' : 'Pass',
      status: 'verified' as const,
      blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      issuedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    };
  });
}

// Historical batch data
export const historicalBatches: Record<string, { fileName: string; totalCards: number; completedAt: Date }> = {
  'hist_batch_001': { fileName: 'CS_Semester6_2024_Batch1.xlsx', totalCards: 120, completedAt: new Date('2024-12-20T10:35:00') },
  'hist_batch_002': { fileName: 'ECE_Semester4_2024.xlsx', totalCards: 85, completedAt: new Date('2024-12-18T14:04:00') },
  'hist_batch_003': { fileName: 'ME_Semester2_2024.xlsx', totalCards: 95, completedAt: new Date('2024-12-15T09:20:00') },
  'hist_batch_004': { fileName: 'Civil_Semester8_2024.xlsx', totalCards: 60, completedAt: new Date('2024-12-10T11:03:00') },
  'hist_batch_005': { fileName: 'IT_Semester6_2024.xlsx', totalCards: 110, completedAt: new Date('2024-12-05T16:36:00') },
};
