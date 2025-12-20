import React, { useState } from 'react';
import { useHrFinalize } from '../../../hooks/mutations/useHrFinalize';
import type { HRFinalizeInput } from '../../../types';

interface HrFinalizeModalProps {
  isOpen: boolean;
  requestId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HrFinalizeModal: React.FC<HrFinalizeModalProps> = ({
  isOpen,
  requestId,
  employeeName,
  onClose,
  onSuccess,
}) => {
  const [comments, setComments] = useState('');
  const hrFinalize = useHrFinalize();

  const handleFinalize = async () => {
    try {
      const input: HRFinalizeInput = {
        paidDays: 0, // TODO: Calculate from request duration
        unpaidDays: 0,
        comments: comments || 'Finalized by HR',
      };
      await hrFinalize.mutateAsync({ id: requestId, input });
      setComments('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to finalize request:', error);
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
          maxWidth: '500px',
          width: '100%',
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease'
        }}>
          {/* Header with gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                Finalize Leave Request
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
            {/* Employee info with success message */}
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px 0' }}>
                Employee: <span style={{ fontWeight: '600', color: '#111827' }}>{employeeName}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: '#10B981', flexShrink: 0, marginTop: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p style={{ fontSize: '13px', color: '#059669', margin: 0, lineHeight: '1.5' }}>
                  Finalizing this request will grant final approval and update employee balances.
                </p>
              </div>
            </div>

            {/* Comments field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
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
                onFocus={(e) => e.currentTarget.style.borderColor = '#10B981'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                placeholder="Add any notes or comments..."
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={onClose}
                disabled={hrFinalize.isPending}
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
                  opacity: hrFinalize.isPending ? 0.5 : 1
                }}
                onMouseEnter={(e) => !hrFinalize.isPending && (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleFinalize}
                disabled={hrFinalize.isPending}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  background: hrFinalize.isPending 
                    ? '#D1D5DB' 
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  cursor: hrFinalize.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: hrFinalize.isPending 
                    ? 'none' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!hrFinalize.isPending) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = hrFinalize.isPending 
                    ? 'none' 
                    : '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                {hrFinalize.isPending ? (
                  <>
                    <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finalizing...
                  </>
                ) : 'Confirm Finalize'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
