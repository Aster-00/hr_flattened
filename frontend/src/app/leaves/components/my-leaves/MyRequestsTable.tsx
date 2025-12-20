import React, { useState } from 'react';
import type { LeaveRequest } from '../../types';
import LeaveStatusBadge from '../common/LeaveStatusBadge';
import LeaveTypeChip from '../common/LeaveTypeChip';
import { formatDate } from '../../utils/dates';
import { useCancelLeaveRequest } from '../../hooks/mutations/useCancelLeaveRequest';
import { useResubmitRequest } from '../../hooks/mutations/useResubmitRequest';
import { showToast } from '@/app/lib/toast';

interface MyRequestsTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  onViewDetails?: (request: LeaveRequest) => void;
  onModify?: (request: LeaveRequest) => void;
}

export const MyRequestsTable: React.FC<MyRequestsTableProps> = ({
  requests,
  loading,
  onViewDetails,
  onModify,
}) => {
  const cancelRequest = useCancelLeaveRequest();
  const resubmitRequest = useResubmitRequest();

  const [expandedReturned, setExpandedReturned] = useState<Set<string>>(new Set());

  // Check if request was returned for correction
  const isReturned = (request: LeaveRequest): boolean => {
    return request.approvalFlow.some(
      step => step.reason?.toLowerCase().includes('correction') || step.reason?.toLowerCase().includes('returned')
    );
  };

  // Get return reason and comments
  const getReturnDetails = (request: LeaveRequest) => {
    const returnedStep = request.approvalFlow.find(
      step => step.reason?.toLowerCase().includes('correction') || step.reason?.toLowerCase().includes('returned')
    );
    return returnedStep ? {
      reason: returnedStep.reason || 'Returned for correction',
      comments: returnedStep.comments || '',
      decidedAt: returnedStep.decidedAt
    } : null;
  };

  const canCancel = (request: LeaveRequest) => {
    return request.status === 'pending' || request.status === 'approved';
  };

  const canModify = (request: LeaveRequest) => {
    return request.status === 'pending' && !isReturned(request);
  };

  const canResubmit = (request: LeaveRequest) => {
    return request.status === 'pending' && isReturned(request);
  };

  const handleCancel = async (requestId: string) => {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await cancelRequest.mutateAsync(requestId);
        showToast('Leave request cancelled successfully', 'success');
      } catch (error: any) {
        console.error('Failed to cancel request:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to cancel request';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleResubmit = async (requestId: string) => {
    if (confirm('Are you sure you want to resubmit this request after correction?')) {
      try {
        await resubmitRequest.mutateAsync(requestId);
        showToast('Request resubmitted successfully', 'success');
      } catch (error: any) {
        console.error('Failed to resubmit request:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resubmit request';
        showToast(errorMessage, 'error');
      }
    }
  };

  const toggleReturnedDetails = (requestId: string) => {
    const newSet = new Set(expandedReturned);
    if (newSet.has(requestId)) {
      newSet.delete(requestId);
    } else {
      newSet.add(requestId);
    }
    setExpandedReturned(newSet);
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', flex: 1, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '6rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
              <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', width: '8rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          margin: '0 auto 1rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>📋</div>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>No active leave requests.</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Submit a new request to get started.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <tr>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.075em'
              }}>
                Leave Type
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.075em'
              }}>
                Start Date
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.075em'
              }}>
                End Date
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.075em'
              }}>
                Duration
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.075em'
              }}>
                Status
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'right',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.075em'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ background: 'white' }}>
            {requests.map((request) => {
              const returned = isReturned(request);
              const returnDetails = returned ? getReturnDetails(request) : null;
              const isExpanded = expandedReturned.has(request._id);

              return (
                <React.Fragment key={request._id}>
                  <tr style={{
                    background: returned ? '#fefce8' : 'white',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = returned ? '#fef9c3' : '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = returned ? '#fefce8' : 'white';
                  }}>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LeaveTypeChip leaveType={(request.leaveType || request.leaveTypeId) as any} />
                        {returned && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            color: '#92400e',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)',
                          }}>
                            ⚠️ Returned
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                      {formatDate(request.dates.from)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>
                      {formatDate(request.dates.to)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        background: '#f1f5f9',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.5rem',
                      }}>{request.durationDays} {request.durationDays === 1 ? 'day' : 'days'}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <LeaveStatusBadge status={request.status} />
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {returned && (
                          <button
                            onClick={() => toggleReturnedDetails(request._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#92400e',
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fde68a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fef3c7';
                            }}
                          >
                            {isExpanded ? '▲ Hide' : '▼ Details'}
                          </button>
                        )}
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(request)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#1e40af',
                              background: '#dbeafe',
                              border: '1px solid #bfdbfe',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#bfdbfe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#dbeafe';
                            }}
                          >
                            👁️ View
                          </button>
                        )}
                        {canResubmit(request) && (
                          <button
                            onClick={() => handleResubmit(request._id)}
                            disabled={resubmitRequest.isPending}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'white',
                              background: resubmitRequest.isPending ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: resubmitRequest.isPending ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                              if (!resubmitRequest.isPending) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            ✓ Resubmit
                          </button>
                        )}
                        {canModify(request) && onModify && (
                          <button
                            onClick={() => onModify(request)}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#047857',
                              background: '#d1fae5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#a7f3d0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#d1fae5';
                            }}
                          >
                            ✏️ Modify
                          </button>
                        )}
                        {canCancel(request) && (
                          <button
                            onClick={() => handleCancel(request._id)}
                            disabled={cancelRequest.isPending}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: cancelRequest.isPending ? '#9ca3af' : '#991b1b',
                              background: cancelRequest.isPending ? '#f3f4f6' : '#fee2e2',
                              border: `1px solid ${cancelRequest.isPending ? '#e5e7eb' : '#fecaca'}`,
                              borderRadius: '0.5rem',
                              cursor: cancelRequest.isPending ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!cancelRequest.isPending) {
                                e.currentTarget.style.background = '#fecaca';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!cancelRequest.isPending) {
                                e.currentTarget.style.background = '#fee2e2';
                              }
                            }}
                          >
                            ✕ Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Return Details Row */}
                  {returned && isExpanded && returnDetails && (
                    <tr style={{ background: '#fefce8', borderTop: '2px solid #fde047' }}>
                      <td colSpan={6} style={{ padding: '1.5rem' }}>
                        <div style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'white',
                          border: '1px solid #F59E0B'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400E', marginBottom: '0.5rem' }}>
                            Request Returned for Correction
                          </p>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                            {returnDetails.decidedAt && (
                              <span>Returned on {formatDate(returnDetails.decidedAt)}</span>
                            )}
                          </div>
                          <div style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: '#FEF3C7',
                            marginBottom: '0.5rem'
                          }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400E', marginBottom: '0.25rem' }}>
                              Reason:
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#78350F' }}>
                              {returnDetails.reason}
                            </p>
                          </div>
                          {returnDetails.comments && (
                            <div style={{
                              padding: '0.75rem',
                              borderRadius: 'var(--radius-md)',
                              background: '#FEF3C7'
                            }}>
                              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400E', marginBottom: '0.25rem' }}>
                                Specific Guidance:
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#78350F' }}>
                                {returnDetails.comments}
                              </p>
                            </div>
                          )}
                          <p style={{ fontSize: '0.7rem', color: '#92400E', marginTop: '0.75rem', fontStyle: 'italic' }}>
                            💡 Please review the feedback above and click "Resubmit" when ready, or "Modify" to make changes before resubmitting.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
