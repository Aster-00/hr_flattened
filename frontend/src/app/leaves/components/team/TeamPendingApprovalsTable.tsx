import React, { useState, useMemo } from 'react';
import type { LeaveRequest } from '../../types';
import LeaveStatusBadge from '../common/LeaveStatusBadge';
import LeaveTypeChip from '../common/LeaveTypeChip';
import { formatDate } from '../../utils/dates';
import { ApprovalActionButtons } from './ApprovalActionButtons';
import { OverdueBadge } from '../common/OverdueBadge';
import { isRequestOverdue } from '../../utils/request-status';
import { BulkActionBar } from './BulkActionBar';
import { useBulkProcess } from '../../hooks/mutations/useBulkProcess';
import { showToast } from '@/app/lib/toast';
import ReturnForCorrectionModal from '../modals/ReturnForCorrectionModal';

interface TeamPendingApprovalsTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  onViewDetails?: (request: LeaveRequest) => void;
  onApprovalSuccess?: () => void;
}

export const TeamPendingApprovalsTable: React.FC<TeamPendingApprovalsTableProps> = ({
  requests,
  loading,
  onViewDetails,
  onApprovalSuccess,
}) => {
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [sortOldestFirst, setSortOldestFirst] = useState(false);
  const [returningRequest, setReturningRequest] = useState<LeaveRequest | null>(null);

  // Count overdue requests
  const overdueCount = useMemo(() => {
    return requests.filter(r => isRequestOverdue(r.createdAt, r.status)).length;
  }, [requests]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    const sorted = [...requests];
    if (sortOldestFirst) {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return sorted;
  }, [requests, sortOldestFirst]);

  // Check if all requests are selected
  const allSelected = requests.length > 0 && selectedRequests.size === requests.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(requests.map((r) => r._id)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectOne = (requestId: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(requestId);
    } else {
      newSelected.delete(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedRequests(new Set());
  };

  const bulkProcess = useBulkProcess();


  const handleBulkApprove = async () => {
    if (selectedRequests.size === 0) return;
    
    if (!confirm(`Approve ${selectedRequests.size} selected requests?`)) return;
    
    try {
      const result = await bulkProcess.mutateAsync({
        requestIds: Array.from(selectedRequests),
        action: 'APPROVE'
      });
      
      showToast(`Successfully approved ${selectedRequests.size} requests`, 'success');
      setSelectedRequests(new Set());
      onApprovalSuccess?.();
    } catch (error: any) {
      showToast(error.message || 'Bulk approval failed', 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.size === 0) return;
    
    const reason = prompt(`Reject ${selectedRequests.size} requests? Enter reason:`);
    if (!reason) return;
    
    try {
      await bulkProcess.mutateAsync({
        requestIds: Array.from(selectedRequests),
        action: 'REJECT',
        comments: reason
      });
      
      showToast(`Successfully rejected ${selectedRequests.size} requests`, 'success');
      setSelectedRequests(new Set());
      onApprovalSuccess?.();
    } catch (error: any) {
      showToast(error.message || 'Bulk rejection failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No pending approval requests</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden' }}>
      {/* Enhanced Header Bar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        borderBottom: '2px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
            }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.125rem' }}>
                Pending Approvals
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                {requests.length} {requests.length === 1 ? 'request' : 'requests'} awaiting review
              </p>
            </div>
          </div>

          {overdueCount > 0 && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <svg style={{ width: '1rem', height: '1rem', color: '#DC2626' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#991B1B' }}>
                {overdueCount} overdue (&gt;48h)
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSortOldestFirst(!sortOldestFirst)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: sortOldestFirst ? '1.5px solid #3B82F6' : '1.5px solid #D1D5DB',
              background: sortOldestFirst ? '#EFF6FF' : 'white',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: sortOldestFirst ? '#1E40AF' : '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              if (!sortOldestFirst) {
                e.currentTarget.style.borderColor = '#9CA3AF';
                e.currentTarget.style.background = '#F9FAFB';
              }
            }}
            onMouseLeave={(e) => {
              if (!sortOldestFirst) {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.background = 'white';
              }
            }}
          >
            <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            {sortOldestFirst ? 'Oldest First ✓' : 'Sort by Date'}
          </button>

          <button
            onClick={() => handleSelectAll(!allSelected)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1.5px solid #D1D5DB',
              background: 'white',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9CA3AF';
              e.currentTarget.style.background = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.background = 'white';
            }}
          >
            {allSelected ? (
              <>
                <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Deselect All
              </>
            ) : (
              <>
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select All
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(to bottom, #F9FAFB, #F3F4F6)' }}>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                borderBottom: '2px solid #E5E7EB',
                width: '60px'
              }}>
                <div style={{
                  width: '1.125rem',
                  height: '1.125rem',
                  borderRadius: '0.25rem',
                  border: allSelected ? '2px solid #3B82F6' : '2px solid #D1D5DB',
                  background: allSelected ? '#3B82F6' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleSelectAll(!allSelected)}>
                  {allSelected && (
                    <svg style={{ width: '0.875rem', height: '0.875rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>
                Employee
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>
                Leave Type
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>
                Period
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>
                Days
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>
                Submitted
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.6875rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((request, idx) => {
              const isOverdue = isRequestOverdue(request.createdAt, request.status);
              const isSelected = selectedRequests.has(request._id);

              return (
                <tr
                  key={request._id}
                  style={{
                    background: isSelected ? '#EFF6FF' : (isOverdue ? '#FEF2F2' : 'white'),
                    borderBottom: idx < sortedRequests.length - 1 ? '1px solid #F3F4F6' : 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isOverdue) e.currentTarget.style.background = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isOverdue) e.currentTarget.style.background = 'white';
                  }}
                >
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{
                      width: '1.125rem',
                      height: '1.125rem',
                      borderRadius: '0.25rem',
                      border: isSelected ? '2px solid #3B82F6' : '2px solid #D1D5DB',
                      background: isSelected ? '#3B82F6' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => handleSelectOne(request._id, !isSelected)}>
                      {isSelected && (
                        <svg style={{ width: '0.875rem', height: '0.875rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {((request.employeeId as any)?.firstName?.[0] || '') + ((request.employeeId as any)?.lastName?.[0] || '')}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                          {(request.employeeId as any)?.firstName} {(request.employeeId as any)?.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.125rem' }}>
                          {(request.employeeId as any)?.employeeNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <LeaveTypeChip leaveType={(request.leaveType || request.leaveTypeId) as any} />
                      {isOverdue && <OverdueBadge createdAt={request.createdAt} />}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem', color: '#374151' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <svg style={{ width: '0.875rem', height: '0.875rem', color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        <span style={{ fontWeight: '500' }}>{formatDate(request.dates.from)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <svg style={{ width: '0.875rem', height: '0.875rem', color: '#EF4444' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        <span style={{ fontWeight: '500' }}>{formatDate(request.dates.to)}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
                      border: '1px solid #93C5FD',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#1E40AF'
                    }}>
                      {request.durationDays} {request.durationDays === 1 ? 'day' : 'days'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem', color: '#6B7280' }}>
                    {formatDate(request.createdAt)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(request)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #D1D5DB',
                            background: 'white',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                            color: '#3B82F6',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EFF6FF';
                            e.currentTarget.style.borderColor = '#3B82F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                          }}
                        >
                          👁️ View
                        </button>
                      )}
                      <button
                        onClick={() => setReturningRequest(request)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #FCD34D',
                          background: 'white',
                          fontSize: '0.8125rem',
                          fontWeight: '500',
                          color: '#D97706',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FEF3C7';
                          e.currentTarget.style.borderColor = '#F59E0B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#FCD34D';
                        }}
                      >
                        ↩️ Return
                      </button>
                      <ApprovalActionButtons
                        requestId={request._id}
                        onSuccess={onApprovalSuccess}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRequests.size}
        onApproveAll={handleBulkApprove}
        onRejectAll={handleBulkReject}
        onClear={handleClearSelection}
        loading={bulkProcess.isPending}
      />

      {/* Return for Correction Modal */}
      {returningRequest && (
        <ReturnForCorrectionModal
          isOpen={!!returningRequest}
          onClose={() => {
            setReturningRequest(null);
            onApprovalSuccess?.();
          }}
          request={returningRequest}
        />
      )}
    </div>
  );
};
