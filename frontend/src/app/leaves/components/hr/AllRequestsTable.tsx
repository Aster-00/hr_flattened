import React, { useState } from 'react';
import type { LeaveRequest } from '../../types';
import LeaveStatusBadge from '../common/LeaveStatusBadge';
import LeaveTypeChip from '../common/LeaveTypeChip';
import { formatDate } from '../../utils/dates';

interface AllRequestsTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  onViewDetails?: (request: LeaveRequest) => void;
  onApprove?: (request: LeaveRequest) => void;
  onReject?: (request: LeaveRequest) => void;
  onFinalize?: (request: LeaveRequest) => void;
  onOverride?: (request: LeaveRequest) => void;
  onFlagIrregular?: (request: LeaveRequest) => void;
}

export const AllRequestsTable: React.FC<AllRequestsTableProps> = ({
  requests,
  loading,
  onViewDetails,
  onApprove,
  onReject,
  onFinalize,
  onOverride,
  onFlagIrregular,
}) => {
  const [sortField, setSortField] = useState<keyof LeaveRequest>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  if (loading) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-light)', padding: '32px' }}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ height: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', flex: 1 }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-light)', padding: '48px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>No leave requests found.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
            <tr>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Employee
              </th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Department
              </th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Leave Type
              </th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Period
              </th>
              <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Days
              </th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '280px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'white' }}>
            {requests.map((request) => (
              <tr key={request._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{(request.employeeId as any)?.firstName} {(request.employeeId as any)?.lastName}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{(request.employeeId as any)?.employeeNumber}</div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                  {(request.employeeId as any)?.department}
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <LeaveTypeChip 
                     leaveType={(request.leaveType || request.leaveTypeId) as any}
                  />
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                  {request.dates?.from && request.dates?.to ? `${formatDate(request.dates.from)} - ${formatDate(request.dates.to)}` : 'N/A'}
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{request.durationDays}</span>
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <LeaveStatusBadge status={request.status} />
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'right', minWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(request)}
                        style={{ color: '#2563EB', fontSize: '14px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1E3A8A'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                      >
                        View
                      </button>
                    )}
                    {request.status === 'pending' && onApprove && (
                      <button
                        onClick={() => onApprove(request)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                    )}
                    {request.status === 'pending' && onReject && (
                      <button
                        onClick={() => onReject(request)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    )}
                    {request.status === 'approved' && onFinalize && (
                      <button
                        onClick={() => onFinalize(request)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Finalize
                      </button>
                    )}
                    {request.status === 'approved' && onOverride && (
                      <button
                        onClick={() => onOverride(request)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Override
                      </button>
                    )}
                    {onFlagIrregular && (
                      <button
                        onClick={() => onFlagIrregular(request)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        Flag
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
