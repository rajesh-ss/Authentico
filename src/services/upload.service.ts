import apiClient from '@/api/client';
import { uploadApi } from '@/api/endpoints/upload';

export interface UploadBatch {
  uploadId: string;
  count: number;
}

export interface UploadResponseData {
  message: string;
  totalRecords: number;
  totalBatches: number;
  batches: UploadBatch[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadResponseData;
}

// Student record type based on the preview data structure
export interface StudentRecord {
  _id: string;
  rollNo: string;
  uploadId: string;
  passYear: number;
  result: string;
  totalMarks: number;
  maxMarks: number;
  student: {
    studentName: string;
    fatherName: string;
    enrollmentNo: string;
    schoolName: string;
  };
  // Add other fields as needed for display
  [key: string]: unknown;
}

export interface PreviewData {
  uploadId: string;
  status: string;
  totalRecords: number;
  previewData: StudentRecord[];
}

export interface CommittedUpload {
  _id: string;
  uploadId: string;
  issuerId: string;
  passYear: number;
  totalRecords: number;
  status: string;
  createdAt: string;
  fabricTxId?: string;
}

export interface CommittedUploadsResponse {
  success: boolean;
  message: string;
  data: CommittedUpload[];
}

export interface PreviewResponse {
  success: boolean;
  message: string;
  data: PreviewData;
}

export const uploadService = {
  uploadFile: async (file: File, type: 'excel' | 'mdb'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>(uploadApi.upload(type), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUploadsByStatus: async (status: string): Promise<CommittedUploadsResponse> => {
    const response = await apiClient.get<CommittedUploadsResponse>(uploadApi.status(status));
    return response.data;
  },

  getUploadPreview: async (uploadId: string): Promise<PreviewResponse> => {
    const response = await apiClient.get<PreviewResponse>(uploadApi.preview(uploadId));
    return response.data;
  },

  commitUpload: async (uploadId: string): Promise<UploadResponse> => {
    const response = await apiClient.post<UploadResponse>(uploadApi.commit(uploadId), {});
    return response.data;
  },

  downloadMarksheets: async (uploadId: string): Promise<void> => {
    const response = await apiClient.get(uploadApi.marksheets(uploadId), {
      responseType: 'blob',
      timeout: 60000, // 60s for large zip downloads
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marksheets-${uploadId}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(url);
  },
};
