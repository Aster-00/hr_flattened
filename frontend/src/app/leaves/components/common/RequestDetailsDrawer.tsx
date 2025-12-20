import React from 'react';
import type { LeaveRequest } from '../../types';
import LeaveStatusBadge from './LeaveStatusBadge';
import LeaveTypeChip from './LeaveTypeChip';
import { formatDate } from '../../utils/dates';

interface RequestDetailsDrawerProps {
  request: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
}

export const RequestDetailsDrawer: React.FC<RequestDetailsDrawerProps> = ({
  request,
  isOpen,
  onClose,
  actions,
}) => {
  if (!isOpen || !request) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 40, transition: 'opacity 0.2s' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '672px', backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 50, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '1px solid var(--border-light)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Leave Request Details</h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 0.2s', backgroundColor: 'transparent', border: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <span style={{ fontSize: '32px' }}>×</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Status and Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LeaveStatusBadge status={request.status} />
             <LeaveTypeChip leaveType={(request.leaveType || request.leaveTypeId) as any} />
          </div>

          {/* Employee Info */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px' }}>Employee Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{(request.employeeId as any)?.firstName} {(request.employeeId as any)?.lastName}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Employee ID:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{(request.employeeId as any)?.employeeNumber}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{(request.employeeId as any)?.department}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Position:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{(request.employeeId as any)?.position}</p>
              </div>
            </div>
          </div>

          {/* Leave Dates */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px' }}>Leave Period</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Start Date:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatDate(request.dates.from)}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>End Date:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatDate(request.dates.to)}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{request.durationDays} days</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {request.justification && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>Reason</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>{request.justification}</p>
            </div>
          )}

          {/* Attachments */}
          {request.attachment && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>Attachments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[request.attachment].map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#2563EB', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1E40AF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                  >
                    📎 {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Approval History */}
          {false && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px' }}>Approval History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[].map((approval: any, index: number) => (
                  <div key={index} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{approval.approverName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{formatDate(approval.timestamp)}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{approval.action}</p>
                    {approval.comments && (
                      <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '4px', fontStyle: 'italic' }}>"   {approval.comments}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
