// HRAllRequestsTable component for HR dashboard
'use client';

import React, { useState } from 'react';
import type { LeaveRequest } from '../../types';
import { useAllRequests } from '../../hooks/queries/useAllRequests';
import { HrFinalizeModal } from './HrDecisionModals/HrFinalizeModal';
import { HrOverrideModal } from './HrDecisionModals/HrOverrideModal';
import LeaveStatusBadge from '../common/LeaveStatusBadge';
import LeaveTypeChip from '../common/LeaveTypeChip';
import { formatDate } from '../../utils/dates';
import { showToast } from '@/app/lib/toast';

export default function HRAllRequestsTable() {
  const { requests, isLoading, refetch } = useAllRequests();

  
  const [finalizingRequest, setFinalizingRequest] = useState<LeaveRequest | null>(null);
  const [overridingRequest, setOverridingRequest] = useState<LeaveRequest | null>(null);

  const handleFinalizeSuccess = () => {
    showToast('Leave request finalized successfully', 'success');
    setFinalizingRequest(null);
    refetch();
  };

  const handleOverrideSuccess = () => {
    showToast('Leave request overridden successfully', 'success');
    setOverridingRequest(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f4f6',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading leave requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '48px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>No leave requests found</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Employee
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Leave Type
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Start Date
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  End Date
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Days
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Manager Decision
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request: LeaveRequest) => {
                const managerApprovalStep = request.approvalFlow.find(
                  (step) => step.role === 'manager'
                );
                const isApproved = request.status === 'approved';
                
                return (
                  <tr 
                    key={request._id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                          {(request.employeeId as any)?.firstName} {(request.employeeId as any)?.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {(request.employeeId as any)?.employeeNumber || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <LeaveTypeChip leaveType={(request.leaveType || request.leaveTypeId) as any} />
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#374151' }}>
                      {request.dates?.from ? formatDate(request.dates.from) : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#374151' }}>
                      {request.dates?.to ? formatDate(request.dates.to) : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        {request.durationDays}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <LeaveStatusBadge status={request.status} />
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#374151' }}>
                      {managerApprovalStep ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {managerApprovalStep.status === 'approved' ? '✓ Approved' : 
                             managerApprovalStep.status === 'rejected' ? '✗ Rejected' : 
                             '⏳ Pending'}
                          </div>
                          {managerApprovalStep.decidedAt && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatDate(managerApprovalStep.decidedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {isApproved && (
                          <button
                            onClick={() => setFinalizingRequest(request)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#047857',
                              backgroundColor: '#d1fae5',
                              border: '1px solid #6ee7b7',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#a7f3d0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#d1fae5';
                            }}
                          >
                            Finalize
                          </button>
                        )}
                        <button
                          onClick={() => setOverridingRequest(request)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#c2410c',
                            backgroundColor: '#fed7aa',
                            border: '1px solid #fdba74',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fdba74';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fed7aa';
                          }}
                        >
                          Override
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {finalizingRequest && (
        <HrFinalizeModal
          isOpen={!!finalizingRequest}
          requestId={finalizingRequest._id}
          employeeName={`${(finalizingRequest.employeeId as any)?.firstName || ''} ${(finalizingRequest.employeeId as any)?.lastName || ''}`}
          onClose={() => setFinalizingRequest(null)}
          onSuccess={handleFinalizeSuccess}
        />
      )}

      {overridingRequest && (
        <HrOverrideModal
          isOpen={!!overridingRequest}
          requestId={overridingRequest._id}
          employeeName={`${(overridingRequest.employeeId as any)?.firstName || ''} ${(overridingRequest.employeeId as any)?.lastName || ''}`}
          onClose={() => setOverridingRequest(null)}
          onSuccess={handleOverrideSuccess}
        />
      )}
    </>
  );
}
