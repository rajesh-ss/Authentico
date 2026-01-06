import { ReEvaluationRequest, ReEvaluationStatus, ReEvaluationType } from '@/types/blockchain';

export type DetailsUpdateField = 'name' | 'roll_number' | 'registration_number' | 'other';

export interface DetailsUpdateData {
  field: DetailsUpdateField;
  currentValue: string;
  requestedValue: string;
  otherFieldName?: string;
}

export interface ReEvaluationFormData {
  type: ReEvaluationType;
  marksCardId: string;
  // For marks revaluation
  subjects: string[];
  // For details update
  detailsUpdate?: DetailsUpdateData;
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
  studentName: string;
  rollNo: string;
  registrationNo: string;
}

// Workflow configuration based on request type
export const WORKFLOW_CONFIG: Record<ReEvaluationType, { route: string[]; description: string }> = {
  marks_revaluation: {
    route: ['student', 'approver'],
    description: 'Request goes directly to the Approver for review',
  },
  details_update: {
    route: ['student', 'teacher', 'approver', 'verifier'],
    description: 'Request goes through Teacher → Approver → Verifier for verification',
  },
};
