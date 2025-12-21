import { useState, useCallback } from 'react';
import { ReEvaluationFormData, MarksCardOption, SubjectOption } from '@/types/reevaluation';
import { ReEvaluationRequest, ReEvaluationTimelineEvent } from '@/types/blockchain';

// Mock marks cards data
const mockMarksCards: MarksCardOption[] = [
  {
    id: '1',
    semester: 'Semester 6',
    academicYear: '2023-24',
    subjects: [
      { code: 'CS601', name: 'Machine Learning', currentMarks: 72, maxMarks: 100, grade: 'A' },
      { code: 'CS602', name: 'Data Structures', currentMarks: 65, maxMarks: 100, grade: 'B+' },
      { code: 'CS603', name: 'Algorithms', currentMarks: 58, maxMarks: 100, grade: 'B' },
      { code: 'CS604', name: 'Database Systems', currentMarks: 78, maxMarks: 100, grade: 'A' },
      { code: 'CS605', name: 'Computer Networks', currentMarks: 70, maxMarks: 100, grade: 'A' },
    ],
  },
  {
    id: '2',
    semester: 'Semester 5',
    academicYear: '2023-24',
    subjects: [
      { code: 'CS501', name: 'Operating Systems', currentMarks: 68, maxMarks: 100, grade: 'B+' },
      { code: 'CS502', name: 'Software Engineering', currentMarks: 75, maxMarks: 100, grade: 'A' },
      { code: 'CS503', name: 'Web Technologies', currentMarks: 82, maxMarks: 100, grade: 'A+' },
      { code: 'CS504', name: 'Compiler Design', currentMarks: 55, maxMarks: 100, grade: 'B' },
    ],
  },
];

// Mock existing requests
const mockRequests: ReEvaluationRequest[] = [
  {
    id: 'REV-2024-102',
    marksCardId: '1',
    studentId: '6',
    studentName: 'Alex Thompson',
    subjects: ['CS602', 'CS603'],
    reason: 'I believe my answers in Data Structures and Algorithms papers deserve higher marks based on the marking scheme.',
    supportingDocuments: ['answer_sheet_copy.pdf'],
    status: 'marks_updated',
    timeline: [
      {
        id: '1',
        status: 'submitted',
        timestamp: new Date('2024-06-01'),
        actor: 'Alex Thompson',
        actorRole: 'Student',
      },
      {
        id: '2',
        status: 'under_review',
        timestamp: new Date('2024-06-02'),
        actor: 'Dr. Emily Davis',
        actorRole: 'Re-Evaluation Approver',
      },
      {
        id: '3',
        status: 'approved',
        timestamp: new Date('2024-06-05'),
        actor: 'Dr. Emily Davis',
        actorRole: 'Re-Evaluation Approver',
        comment: 'Approved for re-evaluation based on valid concerns',
      },
      {
        id: '4',
        status: 'marks_updated',
        timestamp: new Date('2024-06-08'),
        actor: 'Mr. James Wilson',
        actorRole: 'Re-Evaluation Updater',
        transactionHash: '0x9a8b7c6d5e4f3210fedcba9876543210fedcba9876543210fedcba98765432',
      },
    ],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-08'),
  },
];

export function useReEvaluation() {
  const [marksCards] = useState<MarksCardOption[]>(mockMarksCards);
  const [requests, setRequests] = useState<ReEvaluationRequest[]>(mockRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = useCallback(async (formData: ReEvaluationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newRequest: ReEvaluationRequest = {
        id: `REV-2024-${Math.floor(Math.random() * 1000)}`,
        marksCardId: formData.marksCardId,
        studentId: '6',
        studentName: 'Alex Thompson',
        subjects: formData.subjects,
        reason: formData.reason,
        supportingDocuments: formData.supportingDocuments.map((f) => f.name),
        status: 'submitted',
        timeline: [
          {
            id: '1',
            status: 'submitted',
            timestamp: new Date(),
            actor: 'Alex Thompson',
            actorRole: 'Student',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      setError('Failed to submit re-evaluation request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRequestById = useCallback(
    (id: string) => {
      return requests.find((r) => r.id === id);
    },
    [requests]
  );

  return {
    marksCards,
    requests,
    isLoading,
    error,
    submitRequest,
    getRequestById,
  };
}
