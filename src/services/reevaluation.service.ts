import apiClient from '@/api/client';
import { reevaluationApi } from '@/api/endpoints/reevaluation';

export interface ReevaluationRequest {
  rollNo: string;
  subjectCode: string;
  passYear: number;
  reason: string;
}

export interface ReevaluationResponse {
  success: boolean;
  message: string;
  data: any;
}

export const reevaluationService = {
  createRequest: async (payload: ReevaluationRequest): Promise<ReevaluationResponse> => {
    const response = await apiClient.post<ReevaluationResponse>(reevaluationApi.create(), payload);
    return response.data;
  },
};
