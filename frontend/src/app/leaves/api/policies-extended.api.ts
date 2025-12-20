import { leavesApiClient as apiClient } from './leaves.client';


export interface CreatePolicyDto {
  leaveTypeId: string;
  accrualMethod: 'monthly' | 'yearly' | 'per-term';
  monthlyRate: number;
  yearlyRate: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  expiryAfterMonths?: number;
  roundingRule: 'none' | 'round' | 'round_up' | 'round_down';
  minNoticeDays: number;
  maxConsecutiveDays?: number;
  eligibility?: {
    minTenureMonths?: number;
    positionsAllowed?: string[];
    contractTypesAllowed?: string[];
  };
}

export interface UpdatePolicyDto extends Partial<CreatePolicyDto> {}

export const policiesExtendedApi = {
  create: async (data: CreatePolicyDto) => {
    const response = await apiClient.post('/leave-policies', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePolicyDto) => {
    const response = await apiClient.patch(`/leave-policies/${id}`, data);
    return response.data;
  },

  getByLeaveType: async (leaveTypeId: string) => {
    const response = await apiClient.get(`/leave-policies/leave-type/${leaveTypeId}`);
    return response.data;
  }
};
