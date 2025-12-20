import { leavesApiClient as apiClient } from './leaves.client';


export interface SettlementCalculation {
  employeeId: string;
  lastWorkingDay: string;
  calculatedAt: string;
  totalEncashableDays: number;
  byLeaveType: Array<{
    leaveTypeId: string;
    leaveTypeName: string;
    leaveTypeCode: string;
    remaining: number;
    carryForward: number;
    encashableDays: number;
    paid: boolean;
  }>;
}

export const settlementApi = {
  calculate: async (employeeId: string, lastWorkingDay: string) => {
    const response = await apiClient.post('/leaves/settlement/calculate', {
      employeeId,
      lastWorkingDay
    });
    return response.data as SettlementCalculation;
  }
};
