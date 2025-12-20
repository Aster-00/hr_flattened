// Manual Balance Adjustment Modal for HR (REQ-013)
'use client';

import React, { useState, useEffect } from 'react';
import { checkAuth, User } from '@/app/lib/auth';

interface ManualAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  leaveTypes: Array<{ _id: string; name: string; code: string }>;
  onSuccess?: () => void;
}

export function ManualAdjustmentModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  leaveTypes,
  onSuccess,
}: ManualAdjustmentModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [leaveTypeId, setLeaveTypeId] = useState('');

  useEffect(() => {
    if (isOpen) checkAuth().then(setUser);
  }, [isOpen]);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!leaveTypeId) {
      setError('Please select a leave type');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!reason || reason.trim().length < 20) {
      setError('Reason must be at least 20 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { leavesApiClient, LEAVE_ENTITLEMENTS_BASE } = await import('@/app/leaves/api');
      
      await leavesApiClient.post(`${LEAVE_ENTITLEMENTS_BASE}/manual-adjustment`, {
        employeeId,
        leaveTypeId,
        amount: parseFloat(amount),
        adjustmentType,
        reason,
        hrUserId: user?.id,
      });

      // Success
      onSuccess?.();
      onClose();
      
      // Reset form
      setLeaveTypeId('');
      setAdjustmentType('add');
      setAmount('');
      setReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to adjust balance');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLeaveTypeId('');
    setAdjustmentType('add');
    setAmount('');
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        style={{
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '672px',
          width: '100%',
          margin: '0 16px',
          backgroundColor: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-xl)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Manual Balance Adjustment
            </h2>
            <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Adjust leave balance for {employeeName}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning */}
        <div
          style={{ borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'start', gap: '12px', backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)' }}
        >
          <svg style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', color: 'var(--warning)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p style={{ fontWeight: '500', fontSize: '14px', color: 'var(--warning-dark)' }}>
              This action will be logged in the audit trail
            </p>
            <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--warning-dark)' }}>
              All manual adjustments are tracked with timestamp, HR user ID, and reason for compliance.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{ borderRadius: '8px', padding: '16px', marginBottom: '24px', backgroundColor: 'var(--error-light)', color: 'var(--error-dark)' }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Leave Type */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Leave Type *
            </label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                outline: 'none'
              }}
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
          </div>

          {/* Adjustment Type */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Adjustment Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {(['add', 'deduct'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAdjustmentType(type)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: adjustmentType === type ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                    backgroundColor: adjustmentType === type ? '#eff6ff' : 'var(--bg-primary)',
                    color: adjustmentType === type ? '#1d4ed8' : 'var(--text-primary)',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => adjustmentType !== type && (e.currentTarget.style.borderColor = 'var(--text-tertiary)')}
                  onMouseLeave={(e) => adjustmentType !== type && (e.currentTarget.style.borderColor = 'var(--border-light)')}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-secondary)' }}>
              Add: Increase balance | Deduct: Decrease balance
            </p>
          </div>

          {/* Amount */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Amount (Days) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="e.g., 5 or 2.5"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="Explain why this adjustment is being made..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                resize: 'none',
                outline: 'none'
              }}
            />
            <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              This will be recorded in the audit log for compliance tracking.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !leaveTypeId || !amount || !reason}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                color: 'white',
                transition: 'opacity 0.2s',
                border: 'none',
                cursor: (loading || !leaveTypeId || !amount || !reason) ? 'not-allowed' : 'pointer',
                opacity: (loading || !leaveTypeId || !amount || !reason) ? 0.5 : 1,
                backgroundColor: 'var(--primary)'
              }}
            >
              {loading ? 'Processing...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
