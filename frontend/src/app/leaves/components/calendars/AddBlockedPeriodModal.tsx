// AddBlockedPeriodModal component
'use client';

import React, { useState, useEffect } from 'react';
import { useCreateBlockedPeriod } from '../../hooks/mutations/useCreateBlockedPeriod';
import type { CreateBlockedPeriodInput } from '../../api/blocked-periods.api';
import { showToast } from '@/app/lib/toast';

interface AddBlockedPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBlockedPeriodModal({ isOpen, onClose, onSuccess }: AddBlockedPeriodModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBlockedPeriod = useCreateBlockedPeriod();


  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Period name is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload: CreateBlockedPeriodInput = {
        name: name.trim(),
        startDate,
        endDate,
        reason: reason.trim(),
      };

      await createBlockedPeriod.mutateAsync(payload);
      showToast('Blocked period created successfully', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create blocked period';
      showToast(errorMessage, 'error');
      setErrors({ submit: errorMessage });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 50
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 51,
          padding: '16px'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#111827',
                margin: 0
              }}>
                Add Blocked Period
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                Define a period when leave requests should be blocked
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Period Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px'
              }}>
                Period Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g., Year-End Closure"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />
              {errors.name && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Start Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) setErrors({ ...errors, startDate: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: errors.startDate ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!errors.startDate) e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    if (!errors.startDate) e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
                {errors.startDate && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  End Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.endDate) setErrors({ ...errors, endDate: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: errors.endDate ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!errors.endDate) e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    if (!errors.endDate) e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
                {errors.endDate && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px'
              }}>
                Reason <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors({ ...errors, reason: '' });
                }}
                placeholder="Explain why leave requests should be blocked during this period..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.reason ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (!errors.reason) e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  if (!errors.reason) e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />
              {errors.reason && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                  {errors.reason}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createBlockedPeriod.isPending}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: createBlockedPeriod.isPending ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: createBlockedPeriod.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!createBlockedPeriod.isPending) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!createBlockedPeriod.isPending) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {createBlockedPeriod.isPending && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                )}
                {createBlockedPeriod.isPending ? 'Creating...' : 'Create Blocked Period'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
