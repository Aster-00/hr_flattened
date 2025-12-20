import React, { useState } from 'react';
import { useHrOverride } from '../../../hooks/mutations/useHrOverride';
import type { HROverrideInput } from '../../../types';

interface HrOverrideModalProps {
  isOpen: boolean;
  requestId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HrOverrideModal: React.FC<HrOverrideModalProps> = ({
  isOpen,
  requestId,
  employeeName,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject'>('reject');
  const hrOverride = useHrOverride();

  const handleOverride = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for the override');
      return;
    }

    try {
      const input: HROverrideInput = {
        comments: reason,
        overrideReason: decision === 'approve' ? 'Manager override approval' : 'Manager override rejection',
      };
      await hrOverride.mutateAsync({ id: requestId, input });
      setReason('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to override request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          animation: 'fadeIn 0.2s ease'
        }} 
        onClick={onClose} 
      />
      
      <div style={{
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease'
        }}>
          {/* Header with gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            padding: '24px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                Override Manager Decision
              </h3>
            </div>
            <button 
              onClick={onClose} 
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Employee info with warning */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              border: '1px solid #FED7AA',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px 0' }}>
                Employee: <span style={{ fontWeight: '600', color: '#111827' }}>{employeeName}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: '#F97316', flexShrink: 0, marginTop: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ fontSize: '13px', color: '#EA580C', margin: 0, lineHeight: '1.5' }}>
                  You are overriding the manager's decision. This action will be logged.
                </p>
              </div>
            </div>

            {/* Override decision radio buttons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Override Decision
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: decision === 'approve' ? '2px solid #10B981' : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  background: decision === 'approve' ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    value="approve"
                    checked={decision === 'approve'}
                    onChange={(e) => setDecision(e.target.value as 'approve' | 'reject')}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#10B981'
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: decision === 'approve' ? '#059669' : '#6B7280' }}>
                    Approve
                  </span>
                </label>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: decision === 'reject' ? '2px solid #EF4444' : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  background: decision === 'reject' ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    value="reject"
                    checked={decision === 'reject'}
                    onChange={(e) => setDecision(e.target.value as 'approve' | 'reject')}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#EF4444'
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: decision === 'reject' ? '#DC2626' : '#6B7280' }}>
                    Reject
                  </span>
                </label>
              </div>
            </div>

            {/* Reason field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Reason for Override <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#F97316'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                placeholder="Provide a clear justification for overriding the manager's decision..."
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={onClose}
                disabled={hrOverride.isPending}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6B7280',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: hrOverride.isPending ? 0.5 : 1
                }}
                onMouseEnter={(e) => !hrOverride.isPending && (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={hrOverride.isPending || !reason.trim()}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  background: (hrOverride.isPending || !reason.trim()) 
                    ? '#D1D5DB' 
                    : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  cursor: (hrOverride.isPending || !reason.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: (hrOverride.isPending || !reason.trim()) 
                    ? 'none' 
                    : '0 4px 12px rgba(249, 115, 22, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!hrOverride.isPending && reason.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(249, 115, 22, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = (hrOverride.isPending || !reason.trim()) 
                    ? 'none' 
                    : '0 4px 12px rgba(249, 115, 22, 0.3)';
                }}
              >
                {hrOverride.isPending ? (
                  <>
                    <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Confirm Override'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
