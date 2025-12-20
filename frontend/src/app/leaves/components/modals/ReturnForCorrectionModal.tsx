'use client';

import React, { useState } from 'react';
import { useReturnForCorrection } from '../../hooks/mutations/useReturnForCorrection';
import type { LeaveRequest } from '../../types';
import { showToast } from '@/app/lib/toast';

interface ReturnForCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest;
}

export default function ReturnForCorrectionModal({ 
  isOpen, 
  onClose, 
  request 
}: ReturnForCorrectionModalProps) {
  const returnForCorrection = useReturnForCorrection();

  
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const predefinedReasons = [
    'Missing or invalid supporting documents',
    'Dates are unclear or incorrect',
    'Justification is insufficient',
    'Overlaps with existing approved leave',
    'Additional information required',
    'Other (please specify in comments)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!reason) newErrors.reason = 'Please select a reason';
    if (!comment.trim()) newErrors.comment = 'Please provide specific guidance for correction';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await returnForCorrection.mutateAsync({
        id: request._id,
        input: {
          reason,
          comment,
        },
      });
      
      showToast('Request returned to employee for correction', 'success');
      
      // Reset and close
      setReason('');
      setComment('');
      setErrors({});
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to return request';
      setErrors({ submit: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          maxWidth: '32rem',
          width: '100%',
          boxShadow: 'var(--shadow-xl)'
        }}
        onClick={(e) => e.stopPropagation()}
        className="leaves-animate-scale-in"
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--gray-900)',
              marginBottom: '0.5rem'
            }}>
              Return for Correction
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Request ID: {request._id.slice(-8)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              background: 'transparent',
              color: 'var(--gray-400)',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Reason Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--gray-700)',
              marginBottom: '0.5rem'
            }}>
              Reason for Return *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {predefinedReasons.map((predefReason) => (
                <label 
                  key={predefReason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${reason === predefReason ? 'var(--leaves-500)' : 'var(--gray-300)'}`,
                    background: reason === predefReason ? 'var(--leaves-50)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (reason !== predefReason) {
                      e.currentTarget.style.background = 'var(--gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (reason !== predefReason) {
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={predefReason}
                    checked={reason === predefReason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: reason === predefReason ? 'var(--leaves-700)' : 'var(--gray-700)',
                    fontWeight: reason === predefReason ? '600' : '400'
                  }}>
                    {predefReason}
                  </span>
                </label>
              ))}
            </div>
            {errors.reason && (
              <p style={{ color: 'var(--status-rejected)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {errors.reason}
              </p>
            )}
          </div>

          {/* Comments */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--gray-700)',
              marginBottom: '0.5rem'
            }}>
              Specific Guidance *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide clear instructions on what needs to be corrected..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${errors.comment ? 'var(--status-rejected)' : 'var(--gray-300)'}`,
                fontSize: '0.875rem',
                color: 'var(--gray-900)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.comment && (
              <p style={{ color: 'var(--status-rejected)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {errors.comment}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--status-rejected-light)',
              border: '1px solid var(--status-rejected)',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--status-rejected)' }}>
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="leaves-btn leaves-btn-ghost"
              disabled={returnForCorrection.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="leaves-btn leaves-btn-primary"
              disabled={returnForCorrection.isPending}
              style={{
                background: 'var(--warning)',
                borderColor: 'var(--warning)'
              }}
            >
              {returnForCorrection.isPending ? (
                <>
                  <div className="leaves-spinner" style={{ width: '1rem', height: '1rem' }}></div>
                  Returning...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Return to Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
