import { leavesApiClient as apiClient } from './leaves.client';

export interface AuditLogQuery {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

export interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  reason?: string;
  metadata?: any;
  timestamp: string;
}

export const auditLogsApi = {
  getAll: async (query?: AuditLogQuery) => {
    const params = new URLSearchParams();
    if (query?.userId) params.append('userId', query.userId);
    if (query?.entityType) params.append('entityType', query.entityType);
    if (query?.entityId) params.append('entityId', query.entityId);
    if (query?.action) params.append('action', query.action);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.skip) params.append('skip', query.skip.toString());

    const response = await apiClient.get(`/leaves/audit-logs?${params.toString()}`);
    return response.data;
  },

  getByEntitlement: async (entitlementId: string) => {
    const response = await apiClient.get(`/leaves/audit-logs/entitlement/${entitlementId}`);
    return response.data;
  }
};
