'use client';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, AuditLogQuery } from '../../api/audit-logs.api';

export const useAuditLogs = (query?: AuditLogQuery) => {
  return useQuery({
    queryKey: ['leaves', 'audit-logs', query],
    queryFn: () => auditLogsApi.getAll(query),
    staleTime: 1000 * 60 * 5
  });
};

export const useEntitlementAuditHistory = (entitlementId: string) => {
  return useQuery({
    queryKey: ['leaves', 'audit-logs', 'entitlement', entitlementId],
    queryFn: () => auditLogsApi.getByEntitlement(entitlementId),
    enabled: !!entitlementId,
    staleTime: 1000 * 60 * 5
  });
};
