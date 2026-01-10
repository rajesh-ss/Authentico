export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'image';
  required: boolean;
  placeholder?: string;
}

export interface MarksCardTemplate {
  id: string;
  name: string;
  fileType: 'pdf' | 'html';
  fileUrl: string;
  fields: TemplateField[];
  createdAt: Date;
  isDefault?: boolean;
}

export interface TemplateExport {
  name: string;
  fileType: 'pdf' | 'html';
  fields: TemplateField[];
  exportedAt: string;
  version: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  registrationNumber: string;
  semester: string;
  academicYear: string;
  subjects: SubjectData[];
  totalMarks: number;
  percentage: number;
  grade: string;
  isValid: boolean;
  errors: string[];
}

export interface SubjectData {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
}

export interface FieldMapping {
  excelColumn: string;
  templateField: string;
}

export interface GeneratedCard {
  id: string;
  studentRecord: StudentRecord;
  qrCode: string;
  pdfUrl?: string;
  status: 'generating' | 'generated' | 'failed';
  blockchainStatus?: 'pending' | 'submitted' | 'confirmed' | 'failed';
  transactionHash?: string;
}

export interface IssuanceSession {
  id: string;
  templateId: string;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  status: 'uploading' | 'processing' | 'generating' | 'blockchain' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
}
