import { ReEvaluationRequest, ReEvaluationStatus } from '@/types/blockchain';

export interface ReEvaluationFormData {
  marksCardId: string;
  subjects: string[];
  reason: string;
  supportingDocuments: File[];
}

export interface SubjectOption {
  code: string;
  name: string;
  currentMarks: number;
  maxMarks: number;
  grade: string;
}

export interface MarksCardOption {
  id: string;
  semester: string;
  academicYear: string;
  subjects: SubjectOption[];
}
