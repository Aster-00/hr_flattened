'use client';

import React, { useState } from 'react';
import { useCreateLeaveType } from '../../hooks/mutations/useCreateLeaveType';
import { useUpdateLeaveType } from '../../hooks/mutations/useUpdateLeaveType';
import { showToast } from '@/app/lib/toast';

interface LeaveTypeFormProps {
  leaveType?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeaveTypeForm: React.FC<LeaveTypeFormProps> = ({ leaveType, onSuccess, onCancel }) => {
  const isEditMode = !!leaveType;
  
  const [formData, setFormData] = useState({
    code: leaveType?.code || '',
    name: leaveType?.name || '',
    categoryId: leaveType?.categoryId || '',
    description: leaveType?.description || '',
    paid: leaveType?.paid ?? true,
    deductible: leaveType?.deductible ?? true,
    requiresAttachment: leaveType?.requiresAttachment ?? false,
    attachmentType: leaveType?.attachmentType || 'document',
    minTenureMonths: leaveType?.minTenureMonths || 0,
    maxDurationDays: leaveType?.maxDurationDays || 365
  });

  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: leaveType._id, data: formData });
        showToast('Leave type updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Leave type created successfully', 'success');
      }
      onSuccess?.();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Code */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Code <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="text"
          required
          disabled={isEditMode}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder="e.g., ANNUAL"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: isEditMode ? 'var(--bg-secondary)' : 'white'
          }}
        />
      </div>

      {/* Name */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Annual Leave"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          placeholder="Describe this leave type..."
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Checkboxes Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.paid}
            onChange={(e) => handleChange('paid', e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          Paid Leave
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.deductible}
            onChange={(e) => handleChange('deductible', e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          Deductible
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.requiresAttachment}
            onChange={(e) => handleChange('requiresAttachment', e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          Requires Attachment
        </label>
      </div>

      {/* Attachment Type (conditional) */}
      {formData.requiresAttachment && (
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Attachment Type
          </label>
          <select
            value={formData.attachmentType}
            onChange={(e) => handleChange('attachmentType', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="document">Document</option>
            <option value="medical">Medical Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* Numeric Fields Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Min Tenure (Months)
          </label>
          <input
            type="number"
            min="0"
            value={formData.minTenureMonths}
            onChange={(e) => handleChange('minTenureMonths', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Max Duration (Days)
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxDurationDays}
            onChange={(e) => handleChange('maxDurationDays', parseInt(e.target.value) || 365)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--border-light)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: 'var(--primary-600)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: (createMutation.isPending || updateMutation.isPending) ? 'not-allowed' : 'pointer',
            opacity: (createMutation.isPending || updateMutation.isPending) ? 0.5 : 1
          }}
        >
          {(createMutation.isPending || updateMutation.isPending) 
            ? 'Saving...' 
            : isEditMode ? 'Update Leave Type' : 'Create Leave Type'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={createMutation.isPending || updateMutation.isPending}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-light)',
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: (createMutation.isPending || updateMutation.isPending) ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
