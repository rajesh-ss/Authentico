export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface BlockchainTransaction {
  id: string;
  hash: string;
  timestamp: Date;
  status: TransactionStatus;
  type: 'issue' | 'reevaluation' | 'verification' | 'approval';
  gasUsed?: string;
  blockNumber?: number;
}

export type MarksCardStatus = 'issued' | 'reevaluated' | 'superseded' | 'pending_verification';

export interface MarksCard {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  semester: string;
  academicYear: string;
  subjects: SubjectMark[];
  totalMarks: number;
  percentage: number;
  grade: string;
  status: MarksCardStatus;
  version: number;
  qrCode: string;
  blockchain: BlockchainTransaction;
  issuedAt: Date;
  issuedBy: string;
  previousVersion?: string;
}

export interface SubjectMark {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
}

export type ReEvaluationType = 'marks_revaluation' | 'details_update';

export interface ReEvaluationRequest {
  id: string;
  marksCardId: string;
  studentId: string;
  studentName: string;
  type: ReEvaluationType;
  subjects: string[];
  reason: string;
  supportingDocuments: string[];
  status: ReEvaluationStatus;
  timeline: ReEvaluationTimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
  // Details update specific fields
  detailsUpdate?: {
    field: 'name' | 'roll_number' | 'registration_number' | 'other';
    currentValue: string;
    requestedValue: string;
  };
}

export type ReEvaluationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'marks_updated' 
  | 'pending_verification' 
  | 'completed';

export interface ReEvaluationTimelineEvent {
  id: string;
  status: ReEvaluationStatus;
  timestamp: Date;
  actor: string;
  actorRole: string;
  comment?: string;
  transactionHash?: string;
}

export interface VerificationSignature {
  adminId: string;
  adminName: string;
  timestamp: Date;
  signature: string;
  transactionHash: string;
}

export interface MultiSignatureApproval {
  requiredSignatures: number;
  currentSignatures: VerificationSignature[];
  status: 'pending' | 'approved' | 'rejected';
}
