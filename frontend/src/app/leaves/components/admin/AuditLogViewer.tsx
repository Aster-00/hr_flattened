'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '../../hooks/queries/useAuditLogs';
import { AuditLogQuery } from '../../api/audit-logs.api';

interface AuditLogViewerProps {
  entityId?: string;
  entityType?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ entityId, entityType }) => {
  const [filters, setFilters] = useState<AuditLogQuery>({
    entityId,
    entityType,
    limit: 50,
    skip: 0
  });

  const { data, isLoading, error } = useAuditLogs(filters);

  const handleFilterChange = (key: keyof AuditLogQuery, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid var(--border-light)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          Audit Trail
        </h3>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {data?.logs?.length || 0} entries
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Action
          </label>
          <select
            value={filters.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          Loading audit logs...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#dc2626'
        }}>
          Error loading audit logs: {error.message}
        </div>
      )}

      {/* Audit Logs Table */}
      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Timestamp
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  User
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Action
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Entity
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.logs?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                data?.logs?.map((log: any) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {log.userId?.name || 'System'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: log.action === 'DELETE' ? '#fee2e2' : log.action === 'CREATE' ? '#d1fae5' : '#dbeafe',
                        color: log.action === 'DELETE' ? '#dc2626' : log.action === 'CREATE' ? '#059669' : '#2563eb'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {log.entityType}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {log.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
