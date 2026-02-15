import apiClient from '@/api/client';
import { marksheetApi } from '@/api/endpoints/marksheet';

export interface StudentInfo {
  _id: string;
  rollNo: string;
  centerCode: number;
  districtCode: number;
  divisionCode: number;
  enrollmentNo: string;
  examQualifier: string;
  fatherName: string;
  groupCode: string;
  motherName: string;
  registrationType: string;
  schoolCode: number;
  schoolName: string;
  studentName: string;
  createdAt: string;
}

export interface SubjectMarks {
  marks: {
    mark1: number;
    mark2: number;
    mark3: number;
  };
  subjectSlot: number;
  subjectCode: string;
  total: number;
  qualificationFlag: string;
}

export interface Marksheet {
  _id: string;
  rollNo: string;
  uploadId: string;
  passYear: number;
  result: string;
  resultQualification: string;
  totalMarks: number;
  maxMarks: number;
  subjects: SubjectMarks[];
  environmentMarks: number;
  sportsMarks: number;
  nccMarks: number;
  medium: string;
  dobChangeFlag: string;
  remarks: {
    finalRemark: string;
  };
  resultDate: string;
  certificateDate: string;
  digitalSignature: string;
  thumbprint: string;
  version: number;
  isLatest: boolean;
  createdAt: string;
  fabricTxId?: string;
}

export interface StudentMarksheetData {
  student: StudentInfo;
  marksheets: Marksheet[];
}

export interface StudentMarksheetResponse {
  success: boolean;
  message: string;
  data: StudentMarksheetData;
}

export const marksheetService = {
  getMyMarksheets: async (): Promise<StudentMarksheetResponse> => {
    const response = await apiClient.get<StudentMarksheetResponse>(marksheetApi.me());
    return response.data;
  },
};
