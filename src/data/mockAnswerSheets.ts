export interface QuestionMark {
  questionNo: string;
  maxMarks: number;
  obtainedMarks: number;
  remarks?: string;
}

export interface SubjectMarksBreakdown {
  subjectCode: string;
  subjectName: string;
  theoryMax: number;
  theoryObtained: number;
  practicalMax: number;
  practicalObtained: number;
  internalMax: number;
  internalObtained: number;
  totalMax: number;
  totalObtained: number;
  grade: string;
  questions: QuestionMark[];
  answerSheetUrl?: string;
}

export interface StudentAnswerSheet {
  requestId: string;
  studentId: string;
  studentName: string;
  semester: string;
  examDate: string;
  subjects: SubjectMarksBreakdown[];
}

export const mockAnswerSheets: StudentAnswerSheet[] = [
  {
    requestId: 'RE-001',
    studentId: 'STU-2024-001',
    studentName: 'Alex Thompson',
    semester: 'Semester 6',
    examDate: '2024-11-15',
    subjects: [
      {
        subjectCode: 'CS601',
        subjectName: 'Database Systems',
        theoryMax: 70,
        theoryObtained: 48,
        practicalMax: 20,
        practicalObtained: 15,
        internalMax: 10,
        internalObtained: 8,
        totalMax: 100,
        totalObtained: 71,
        grade: 'B+',
        questions: [
          { questionNo: '1a', maxMarks: 5, obtainedMarks: 4, remarks: 'Good explanation' },
          { questionNo: '1b', maxMarks: 5, obtainedMarks: 3 },
          { questionNo: '2a', maxMarks: 10, obtainedMarks: 7, remarks: 'Missing normalization steps' },
          { questionNo: '2b', maxMarks: 10, obtainedMarks: 8 },
          { questionNo: '3', maxMarks: 15, obtainedMarks: 10, remarks: 'Incomplete ER diagram' },
          { questionNo: '4a', maxMarks: 5, obtainedMarks: 4 },
          { questionNo: '4b', maxMarks: 10, obtainedMarks: 6, remarks: 'SQL query partially correct' },
          { questionNo: '5', maxMarks: 10, obtainedMarks: 6, remarks: 'Transaction concepts unclear' },
        ],
        answerSheetUrl: '/placeholder.svg',
      },
      {
        subjectCode: 'CS602',
        subjectName: 'Computer Networks',
        theoryMax: 70,
        theoryObtained: 52,
        practicalMax: 20,
        practicalObtained: 18,
        internalMax: 10,
        internalObtained: 9,
        totalMax: 100,
        totalObtained: 79,
        grade: 'A',
        questions: [
          { questionNo: '1a', maxMarks: 5, obtainedMarks: 5 },
          { questionNo: '1b', maxMarks: 5, obtainedMarks: 4 },
          { questionNo: '2a', maxMarks: 10, obtainedMarks: 8 },
          { questionNo: '2b', maxMarks: 10, obtainedMarks: 9 },
          { questionNo: '3', maxMarks: 15, obtainedMarks: 12 },
          { questionNo: '4a', maxMarks: 5, obtainedMarks: 4 },
          { questionNo: '4b', maxMarks: 10, obtainedMarks: 5, remarks: 'Routing algorithm incomplete' },
          { questionNo: '5', maxMarks: 10, obtainedMarks: 5 },
        ],
        answerSheetUrl: '/placeholder.svg',
      },
    ],
  },
  {
    requestId: 'RE-002',
    studentId: 'STU-2024-015',
    studentName: 'Maria Garcia',
    semester: 'Semester 4',
    examDate: '2024-11-12',
    subjects: [
      {
        subjectCode: 'CS401',
        subjectName: 'Data Structures',
        theoryMax: 70,
        theoryObtained: 38,
        practicalMax: 20,
        practicalObtained: 12,
        internalMax: 10,
        internalObtained: 7,
        totalMax: 100,
        totalObtained: 57,
        grade: 'C+',
        questions: [
          { questionNo: '1a', maxMarks: 5, obtainedMarks: 3 },
          { questionNo: '1b', maxMarks: 5, obtainedMarks: 2, remarks: 'Tree traversal incorrect' },
          { questionNo: '2a', maxMarks: 10, obtainedMarks: 6 },
          { questionNo: '2b', maxMarks: 10, obtainedMarks: 5, remarks: 'Graph algorithms partial' },
          { questionNo: '3', maxMarks: 15, obtainedMarks: 8, remarks: 'AVL rotation missing' },
          { questionNo: '4a', maxMarks: 5, obtainedMarks: 4 },
          { questionNo: '4b', maxMarks: 10, obtainedMarks: 6 },
          { questionNo: '5', maxMarks: 10, obtainedMarks: 4, remarks: 'Hash function incorrect' },
        ],
        answerSheetUrl: '/placeholder.svg',
      },
    ],
  },
];

export function getAnswerSheetByRequestId(requestId: string): StudentAnswerSheet | undefined {
  return mockAnswerSheets.find(sheet => sheet.requestId === requestId);
}
