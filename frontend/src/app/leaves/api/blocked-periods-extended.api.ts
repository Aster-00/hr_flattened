import { leavesApiClient as apiClient } from './leaves.client';


export interface UpdateBlockedPeriodDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  affectsLeaveCalculation?: boolean;
}

export const blockedPeriodsExtendedApi = {
  update: async (id: string, data: UpdateBlockedPeriodDto) => {
    const response = await apiClient.patch(`/leaves/calendars/blocked-periods/${id}`, data);
    return response.data;
  }
};
