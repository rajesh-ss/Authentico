import apiClient from '@/api/client';
import { detailsChangeApi } from '@/api/endpoints/details-change';

export interface DetailsChangePayload {
  rollNo: string;
  reason: string;
  changes: {
    studentName?: string;
    fatherName?: string;
    motherName?: string;
  };
}

export interface DetailsChangeData {
  _id: string;
  rollNo: string;
  requestedBy: string;
  changes: {
    studentName?: string;
    fatherName?: string;
    motherName?: string;
  };
  reason: string;
  status: string;
  createdAt: string;
}

export interface DetailsChangeResponse {
  success: boolean;
  message: string;
  data: DetailsChangeData;
}

export interface PendingRequestsResponse {
  success: boolean;
  message: string;
  data: DetailsChangeData[];
}

export const detailsChangeService = {
  createRequest: async (payload: DetailsChangePayload): Promise<DetailsChangeResponse> => {
    const response = await apiClient.post<DetailsChangeResponse>(
      detailsChangeApi.create(),
      payload
    );
    return response.data;
  },

  getPendingRequests: async (): Promise<PendingRequestsResponse> => {
    const response = await apiClient.get<PendingRequestsResponse>(detailsChangeApi.pending());
    return response.data;
  },

  approveRequest: async (requestId: string): Promise<DetailsChangeResponse> => {
    const response = await apiClient.patch<DetailsChangeResponse>(
      detailsChangeApi.approve(requestId)
    );
    return response.data;
  },

  rejectRequest: async (requestId: string, reason: string): Promise<DetailsChangeResponse> => {
    const response = await apiClient.patch<DetailsChangeResponse>(
      detailsChangeApi.reject(requestId),
      { remarks: reason }
    );
    return response.data;
  },
};
