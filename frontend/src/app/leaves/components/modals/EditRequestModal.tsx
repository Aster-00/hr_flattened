'use client';

import React, { useState, useEffect } from 'react';
import { useLeaveTypes } from '../../hooks/queries/useLeaveTypes';
import { useMyBalances } from '../../hooks/queries/useMyBalances';
import { useUpdateLeaveRequest } from '../../hooks/mutations/useUpdateLeaveRequest';
import type { LeaveRequest } from '../../types';
import { showToast } from '@/app/lib/toast';
import { useOverlapCheck } from '../../hooks/useOverlapCheck';
import OverlapWarning from '../common/OverlapWarning';
import { useWorkingDays } from '../../hooks/useWorkingDays';
import WorkingDaysBreakdown from '../common/WorkingDaysBreakdown';
import { useBlockedPeriodCheck } from '../../hooks/useBlockedPeriodCheck';
import BlockedPeriodWarning from '../common/BlockedPeriodWarning';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
}

export default function EditRequestModal({ isOpen, onClose, request }: EditRequestModalProps) {
  const { types: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const { balances } = useMyBalances();
  const updateRequest = useUpdateLeaveRequest();


  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [justification, setJustification] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [durationDays, setDurationDays] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [convertToUnpaid, setConvertToUnpaid] = useState(false);

  // Check for overlapping requests (excluding current request)
  const { isChecking: checkingOverlap, overlappingRequests } = useOverlapCheck(
    startDate, 
    endDate, 
    request?._id
  );

  // Calculate working days
  const { 
    isCalculating: calculatingWorkingDays, 
    totalCalendarDays,
    workingDays, 
    excludedDays 
  } = useWorkingDays(startDate, endDate);

  // Check for blocked periods
  const { isChecking: checkingBlocked, blockedPeriods } = useBlockedPeriodCheck(startDate, endDate);

  // Initialize form with existing request data
  useEffect(() => {
    if (request && isOpen) {
      setStartDate(request.dates.from.split('T')[0]);
      setEndDate(request.dates.to.split('T')[0]);
      setJustification(request.justification || '');
      setFiles([]);
      setConvertToUnpaid(false);
      setErrors({});
    }
  }, [request, isOpen]);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDurationDays(diffDays);
    } else {
      setDurationDays(0);
    }
  }, [startDate, endDate]);

  // Get available balance for the leave type
  const selectedBalance = balances?.entitlements?.find(
    e => e.leaveType?._id === request?.leaveType?._id
  );

  // Get selected leave type details
  const selectedLeaveType = leaveTypes?.find(t => t._id === request?.leaveType?._id);

  // Check if attachments are required for this leave type
  const attachmentRequired = selectedLeaveType?.requiresAttachment && durationDays > 1;

  // Calculate insufficient balance
  const insufficientBalance = selectedBalance && durationDays > selectedBalance.remaining;
  const unpaidDays = insufficientBalance ? durationDays - selectedBalance.remaining : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        showToast(`File "${file.name}" has invalid type. Only PDF, JPG, PNG, DOC, DOCX allowed.`, 'error');
        continue;
      }
      if (file.size > maxSize) {
        showToast(`File "${file.name}" is too large. Maximum size is 5MB.`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request) return;

    // Validation
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (!justification.trim()) newErrors.justification = 'Please provide a reason';
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Check for required attachments (only for new files)
    if (attachmentRequired && files.length === 0 && !request.attachment?._id) {
      newErrors.files = 'Medical certificate or supporting document is required for this leave type.';
    }

    // Check insufficient balance
    if (insufficientBalance && !convertToUnpaid) {
      newErrors.duration = `Insufficient balance. You have ${selectedBalance.remaining} days available. Check "Convert to unpaid" to proceed.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('dates[from]', startDate);
      formData.append('dates[to]', endDate);
      formData.append('justification', justification);
      
      if (convertToUnpaid && insufficientBalance) {
        formData.append('convertUnpaidDays', 'true');
        formData.append('unpaidDaysCount', unpaidDays.toString());
      }

      // Append files
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      await updateRequest.mutateAsync({ id: request._id, input: formData as any });
      
      showToast('Leave request updated successfully', 'success');
      
      // Reset and close
      setStartDate('');
      setEndDate('');
      setJustification('');
      setFiles([]);
      setConvertToUnpaid(false);
      setErrors({});
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update request';
      setErrors({ submit: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  if (!isOpen || !request) return null;

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
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          maxWidth: '48rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
        className="leaves-animate-scale-in"
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: 'var(--gray-900)',
              marginBottom: '0.5rem'
            }}>
              Modify Leave Request
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Update your pending leave request
            </p>
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--leaves-50)',
              border: '1px solid var(--leaves-200)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block'
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--leaves-700)', fontWeight: '500' }}>
                Leave Type: <strong>{request.leaveType?.name}</strong> (cannot be changed)
              </p>
            </div>
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-700)',
                marginBottom: '0.5rem'
              }}>
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${errors.startDate ? 'var(--status-rejected)' : 'var(--gray-300)'}`,
                  fontSize: '1rem',
                  color: 'var(--gray-900)',
                  outline: 'none'
                }}
              />
              {errors.startDate && (
                <p style={{ color: 'var(--status-rejected)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-700)',
                marginBottom: '0.5rem'
              }}>
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${errors.endDate ? 'var(--status-rejected)' : 'var(--gray-300)'}`,
                  fontSize: '1rem',
                  color: 'var(--gray-900)',
                  outline: 'none'
                }}
              />
              {errors.endDate && (
                <p style={{ color: 'var(--status-rejected)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Working Days Breakdown */}
          <WorkingDaysBreakdown
            totalCalendarDays={totalCalendarDays}
            workingDays={workingDays}
            excludedDays={excludedDays}
            isCalculating={calculatingWorkingDays}
          />

          {/* Blocked Period Warning */}
          <BlockedPeriodWarning
            blockedPeriods={blockedPeriods}
            isChecking={checkingBlocked}
          />

          {/* Overlap Warning */}
          <OverlapWarning 
            overlappingRequests={overlappingRequests}
            isChecking={checkingOverlap}
          />

          {/* Insufficient Balance Warning with Unpaid Conversion */}
          {insufficientBalance && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: '600', marginBottom: '0.25rem' }}>
                    Insufficient Balance
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#92400E' }}>
                    You have <strong>{selectedBalance.remaining} days</strong> available but requested <strong>{durationDays} days</strong>.
                    Remaining <strong>{unpaidDays} days</strong> can be converted to unpaid leave.
                  </p>
                </div>
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.75rem',
                background: 'white',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #F59E0B'
              }}>
                <input
                  type="checkbox"
                  checked={convertToUnpaid}
                  onChange={(e) => setConvertToUnpaid(e.target.checked)}
                  style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: '500' }}>
                  I understand {unpaidDays} {unpaidDays === 1 ? 'day' : 'days'} will be unpaid and deducted from my salary
                </span>
              </label>
            </div>
          )}

          {errors.duration && !insufficientBalance && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--status-rejected-light)',
              border: '1px solid var(--status-rejected)',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--status-rejected)' }}>
                {errors.duration}
              </p>
            </div>
          )}

          {/* File Upload Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--gray-700)',
              marginBottom: '0.5rem'
            }}>
              Supporting Documents {attachmentRequired && <span style={{ color: 'var(--status-rejected)' }}>*</span>}
            </label>
            {attachmentRequired && (
              <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                ⚠️ Medical certificate or supporting document required for this leave type ({durationDays} days)
              </p>
            )}
            
            {request.attachment && (
              <div style={{
                padding: '0.75rem',
                background: 'var(--leaves-50)',
                border: '1px solid var(--leaves-200)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.75rem'
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--leaves-700)' }}>
                Existing attachment: <strong>{request.attachment.filename || 'Document attached'}</strong>
                </p>
              </div>
            )}

            <div style={{
              border: '2px dashed var(--gray-300)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--leaves-500)';
              e.currentTarget.style.background = 'var(--leaves-50)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gray-300)';
              e.currentTarget.style.background = 'transparent';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--gray-300)';
              e.currentTarget.style.background = 'transparent';
              const dt = e.dataTransfer;
              const droppedFiles = Array.from(dt.files);
              const fakeEvent = { target: { files: droppedFiles } } as any;
              handleFileChange(fakeEvent);
            }}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload-edit"
              />
              <label htmlFor="file-upload-edit" style={{ cursor: 'pointer', display: 'block' }}>
                <svg style={{ width: '3rem', height: '3rem', margin: '0 auto', color: 'var(--gray-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--leaves-600)', fontWeight: '600' }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  PDF, JPG, PNG, DOC, DOCX (max 5MB each)
                </p>
              </label>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--gray-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        padding: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--status-rejected)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--status-rejected-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.files && (
              <p style={{ color: 'var(--status-rejected)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {errors.files}
              </p>
            )}
          </div>

          {/* Justification */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--gray-700)',
              marginBottom: '0.5rem'
            }}>
              Reason *
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Please provide a reason for your leave request..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${errors.justification ? 'var(--status-rejected)' : 'var(--gray-300)'}`,
                fontSize: '1rem',
                color: 'var(--gray-900)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.justification && (
              <p style={{ color: 'var(--status-rejected)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.justification}
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
              disabled={updateRequest.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="leaves-btn leaves-btn-primary"
              disabled={updateRequest.isPending}
            >
              {updateRequest.isPending ? (
                <>
                  <div className="leaves-spinner" style={{ width: '1rem', height: '1rem' }}></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
