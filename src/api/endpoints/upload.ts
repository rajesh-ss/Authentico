export const uploadApi = {
  upload: (fileType: string) => `/api/upload/${fileType}`,
  status: (status: string) => `/api/upload/status/${status}`,
  preview: (uploadId: string) => `/api/upload/${uploadId}/preview`,
  commit: (uploadId: string) => `/api/upload/${uploadId}/commit`,
  marksheets: (uploadId: string) => `/api/upload/${uploadId}/marksheets`,
};
