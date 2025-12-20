// HR Approve Modal
'use client';

import React, { useState, useEffect } from 'react';
import { checkAuth, User } from '@/app/lib/auth';
import { useManagerApprove } from '@/app/leaves/hooks/mutations/useManagerApprove';
import { showToast } from '@/app/lib/toast';

interface HrApproveModalProps {
  isOpen: boolean;
  requestId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function HrApproveModal({
  isOpen,
  requestId,
  employeeName,
  onClose,
  onSuccess,
}: HrApproveModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [comment, setComment] = useState('');
  const { mutate: approveRequest, isPending } = useManagerApprove();

  useEffect(() => {
    if (isOpen) checkAuth().then(setUser);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      showToast('User session expired', 'error');
      return;
    }

    approveRequest(
      {
        id: requestId,
        input: {
          approverId: user.id,
          comment: comment || undefined,
        },
      },
      {
        onSuccess: () => {
          showToast(`Leave request approved for ${employeeName}`, 'success');
          setComment('');
          onSuccess?.();
          onClose();
        },
        onError: (error: any) => {
          showToast(
            error.response?.data?.message || error.message || 'Failed to approve request',
            'error'
          );
        },
      }
    );
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          margin: '0 16px',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Approve Leave Request
            </h2>
            <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Approve request for {employeeName}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg
              style={{ width: '24px', height: '24px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        <div
          style={{
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <svg
            style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', color: '#10B981' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p style={{ fontWeight: '500', fontSize: '14px', color: '#065F46' }}>
              This will approve the leave request
            </p>
            <p style={{ fontSize: '12px', marginTop: '4px', color: '#065F46' }}>
              The employee will be notified of your approval decision.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Comment */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                color: 'var(--text-primary)',
              }}
            >
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add a comment for the employee..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: isPending ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                color: 'white',
                transition: 'opacity 0.2s',
                border: 'none',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.5 : 1,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              }}
            >
              {isPending ? 'Approving...' : 'Approve Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
