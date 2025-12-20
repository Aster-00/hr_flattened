'use client';

import React from 'react';
import { useOverdueRequests } from '../../hooks/queries/useOverdueRequests';

interface OverdueRequestsAlertProps {
  departmentId?: string;
}

export const OverdueRequestsAlert: React.FC<OverdueRequestsAlertProps> = ({ departmentId }) => {
  const { data, isLoading, error } = useOverdueRequests(departmentId);

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fde68a',
        borderRadius: '0.5rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid #d97706',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
          Checking for overdue requests...
        </span>
      </div>
    );
  }

  if (error || !data) return null;

  if (data.total === 0) {
    return (
      <div style={{
        backgroundColor: '#d1fae5',
        border: '1px solid #a7f3d0',
        borderRadius: '0.5rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <svg style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: '500' }}>
          All requests are up to date!
        </span>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '0.5rem',
      padding: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
        <svg style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626', flexShrink: 0, marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem' }}>
            {data.total} Overdue Leave Request{data.total !== 1 ? 's' : ''}
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '1rem' }}>
            These requests have been pending for more than 48 hours and require immediate attention.
          </p>
          
          {/* Overdue Requests List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.requests?.slice(0, 3).map((request: any) => (
              <div
                key={request._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {request.employeeId?.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {request.leaveTypeId?.name} • {request.durationDays} days
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#dc2626' }}>
                    {request.hoursElapsed}h overdue
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Submitted {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.total > 3 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#991b1b' }}>
              + {data.total - 3} more overdue request{data.total - 3 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
