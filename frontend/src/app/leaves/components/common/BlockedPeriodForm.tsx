'use client';

import React, { useState } from 'react';
import { useUpdateBlockedPeriod } from '../../hooks/mutations/useUpdateBlockedPeriod';
import { showToast } from '@/app/lib/toast';

interface BlockedPeriodFormProps {
  blockedPeriod: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BlockedPeriodForm: React.FC<BlockedPeriodFormProps> = ({ 
  blockedPeriod, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: blockedPeriod?.name || '',
    startDate: blockedPeriod?.startDate?.split('T')[0] || '',
    endDate: blockedPeriod?.endDate?.split('T')[0] || '',
    description: blockedPeriod?.description || '',
    affectsLeaveCalculation: blockedPeriod?.affectsLeaveCalculation ?? true
  });

  const updateMutation = useUpdateBlockedPeriod();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      showToast('End date must be after start date', 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({ 
        id: blockedPeriod._id, 
        data: formData 
      });
      showToast('Blocked period updated successfully', 'success');
      onSuccess?.();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          placeholder="e.g., Christmas Shutdown"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Date Range */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Start Date <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
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
            End Date <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            min={formData.startDate}
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

      {/* Description */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          placeholder="Describe this blocked period..."
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

      {/* Affects Calculation */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.affectsLeaveCalculation}
            onChange={(e) => handleChange('affectsLeaveCalculation', e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          Affects Leave Calculation
        </label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
          If checked, this period will be excluded from leave balance calculations
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: 'var(--primary-600)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: updateMutation.isPending ? 0.5 : 1
          }}
        >
          {updateMutation.isPending ? 'Updating...' : 'Update Blocked Period'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={updateMutation.isPending}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-light)',
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: updateMutation.isPending ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
