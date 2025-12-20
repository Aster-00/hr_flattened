import { leavesApiClient as apiClient } from './leaves.client';


export interface CreateLeaveTypeDto {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: 'medical' | 'document' | 'other';
  minTenureMonths?: number;
  maxDurationDays?: number;
}

export interface UpdateLeaveTypeDto extends Partial<CreateLeaveTypeDto> {}

export const leaveTypesExtendedApi = {
  create: async (data: CreateLeaveTypeDto) => {
    const response = await apiClient.post('/leave-types', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLeaveTypeDto) => {
    const response = await apiClient.patch(`/leave-types/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/leave-types/${id}`);
    return response.data;
  }
};
