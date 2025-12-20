// HR Reject Modal
'use client';

import React, { useState, useEffect } from 'react';
import { checkAuth, User } from '@/app/lib/auth';
import { useManagerReject } from '@/app/leaves/hooks/mutations/useManagerReject';
import { showToast } from '@/app/lib/toast';

interface HrRejectModalProps {
  isOpen: boolean;
  requestId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function HrRejectModal({
  isOpen,
  requestId,
  employeeName,
  onClose,
  onSuccess,
}: HrRejectModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [comment, setComment] = useState('');
  const { mutate: rejectRequest, isPending } = useManagerReject();

  useEffect(() => {
    if (isOpen) checkAuth().then(setUser);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment || comment.trim().length < 10) {
      showToast('Please provide a reason for rejection (at least 10 characters)', 'warning');
      return;
    }

    if (!user?.id) {
      showToast('User session expired', 'error');
      return;
    }

    rejectRequest(
      {
        id: requestId,
        input: {
          approverId: user.id,
          reason: comment,
          comments: comment,
        },
      },
      {
        onSuccess: () => {
          showToast(`Leave request rejected for ${employeeName}`, 'success');
          setComment('');
          onSuccess?.();
          onClose();
        },
        onError: (error: any) => {
          showToast(
            error.response?.data?.message || error.message || 'Failed to reject request',
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
              Reject Leave Request
            </h2>
            <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Reject request for {employeeName}
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

        {/* Warning Message */}
        <div
          style={{
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <svg
            style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', color: '#EF4444' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p style={{ fontWeight: '500', fontSize: '14px', color: '#991B1B' }}>
              This will reject the leave request
            </p>
            <p style={{ fontSize: '12px', marginTop: '4px', color: '#991B1B' }}>
              Please provide a clear reason for rejection. The employee will be notified.
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
              Reason for Rejection *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="Please explain why this request is being rejected..."
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
            <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Minimum 10 characters required
            </p>
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
              disabled={isPending || !comment || comment.trim().length < 10}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                color: 'white',
                transition: 'opacity 0.2s',
                border: 'none',
                cursor: isPending || !comment || comment.trim().length < 10 ? 'not-allowed' : 'pointer',
                opacity: isPending || !comment || comment.trim().length < 10 ? 0.5 : 1,
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              }}
            >
              {isPending ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
