import { leavesApiClient as apiClient } from './leaves.client';


export interface OverdueRequest {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    primaryDepartmentId?: string;
  };
  leaveTypeId: {
    _id: string;
    name: string;
    code: string;
  };
  dates: {
    from: string;
    to: string;
  };
  durationDays: number;
  status: string;
  createdAt: string;
  hoursElapsed: number;
  daysElapsed?: number;
}

export const overdueApi = {
  getOverdueRequests: async (departmentId?: string) => {
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await apiClient.get(`/leaves/requests/overdue${params}`);
    return response.data as { total: number; requests: OverdueRequest[] };
  }
};
