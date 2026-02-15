import apiClient from '@/api/client';
import { workflowApi } from '@/api/endpoints/workflow';

export type RequestType = 'REEVALUATION' | 'DETAILS_CHANGE';
export type ActionType = 'APPROVE' | 'REJECT';
export type WorkflowStatus =
  | 'PENDING_MAKER'
  | 'PENDING_CHECKER'
  | 'PENDING_APPROVER'
  | 'APPROVED'
  | 'REJECTED';

export interface BaseWorkflowItem {
  _id: string;
  type: RequestType;
  rollNo: string;
  status: WorkflowStatus;
  reason?: string;
  createdAt: string;
  requestedBy: string;
}

export interface ReevaluationItem extends BaseWorkflowItem {
  type: 'REEVALUATION';
  subjectCode: string;
  passYear: number;
}

export interface DetailsChangeItem extends BaseWorkflowItem {
  type: 'DETAILS_CHANGE';
  changes: Record<string, any>;
}

export type WorkflowItem = ReevaluationItem | DetailsChangeItem;

export interface WorkflowResponse {
  success: boolean;
  message: string;
  data: WorkflowItem[];
}

export interface ActionPayload {
  requestId: string;
  type: RequestType;
  action: ActionType;
  remarks?: string;
  updatedMarks?: number;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data: any;
}

export const workflowService = {
  getPendingRequests: async (): Promise<WorkflowResponse> => {
    const response = await apiClient.get<WorkflowResponse>(workflowApi.pending());
    return response.data;
  },

  processAction: async (payload: ActionPayload): Promise<ActionResponse> => {
    const response = await apiClient.post<ActionResponse>(workflowApi.action(), payload);
    return response.data;
  },
};
