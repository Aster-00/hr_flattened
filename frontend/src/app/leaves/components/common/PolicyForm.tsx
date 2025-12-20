'use client';

import React, { useState } from 'react';
import { useCreatePolicy } from '../../hooks/mutations/useCreatePolicy';
import { useUpdatePolicy } from '../../hooks/mutations/useUpdatePolicy';
import { useLeaveTypes } from '../../hooks/queries/useLeaveTypes';
import { showToast } from '@/app/lib/toast';

interface PolicyFormProps {
  policy?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PolicyForm: React.FC<PolicyFormProps> = ({ policy, onSuccess, onCancel }) => {
  const isEditMode = !!policy;
  const { types: leaveTypes, isLoading: typesLoading } = useLeaveTypes();

  const [formData, setFormData] = useState({
    leaveTypeId: policy?.leaveTypeId || '',
    accrualMethod: policy?.accrualMethod || 'monthly',
    monthlyRate: policy?.monthlyRate || 0,
    yearlyRate: policy?.yearlyRate || 0,
    carryForwardAllowed: policy?.carryForwardAllowed ?? true,
    maxCarryForward: policy?.maxCarryForward || 0,
    expiryAfterMonths: policy?.expiryAfterMonths || 12,
    roundingRule: policy?.roundingRule || 'round',
    minNoticeDays: policy?.minNoticeDays || 0,
    maxConsecutiveDays: policy?.maxConsecutiveDays || 0,
    minTenureMonths: policy?.eligibility?.minTenureMonths || 0
  });

  const createMutation = useCreatePolicy();
  const updateMutation = useUpdatePolicy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        eligibility: {
          minTenureMonths: formData.minTenureMonths
        }
      };

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: policy._id, data: payload });
        showToast('Policy updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showToast('Policy created successfully', 'success');
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
      {/* Leave Type */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Leave Type <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <select
          required
          disabled={isEditMode || typesLoading}
          value={formData.leaveTypeId}
          onChange={(e) => handleChange('leaveTypeId', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: isEditMode ? 'var(--bg-secondary)' : 'white'
          }}
        >
          <option value="">Select leave type...</option>
          {leaveTypes?.map((type: any) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Accrual Method */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Accrual Method <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <select
          required
          value={formData.accrualMethod}
          onChange={(e) => handleChange('accrualMethod', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="per-term">Per Term</option>
        </select>
      </div>

      {/* Rates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Monthly Rate (Days) <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.5"
            value={formData.monthlyRate}
            onChange={(e) => handleChange('monthlyRate', parseFloat(e.target.value) || 0)}
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
            Yearly Rate (Days) <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.5"
            value={formData.yearlyRate}
            onChange={(e) => handleChange('yearlyRate', parseFloat(e.target.value) || 0)}
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

      {/* Carry Forward */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.carryForwardAllowed}
            onChange={(e) => handleChange('carryForwardAllowed', e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          Allow Carry Forward
        </label>
      </div>

      {formData.carryForwardAllowed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Max Carry Forward (Days)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.maxCarryForward}
              onChange={(e) => handleChange('maxCarryForward', parseFloat(e.target.value) || 0)}
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
              Expiry After (Months)
            </label>
            <input
              type="number"
              min="1"
              value={formData.expiryAfterMonths}
              onChange={(e) => handleChange('expiryAfterMonths', parseInt(e.target.value) || 12)}
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
      )}

      {/* Rounding Rule */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Rounding Rule
        </label>
        <select
          value={formData.roundingRule}
          onChange={(e) => handleChange('roundingRule', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--border-light)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        >
          <option value="none">None</option>
          <option value="round">Round (Nearest)</option>
          <option value="round_up">Round Up</option>
          <option value="round_down">Round Down</option>
        </select>
      </div>

      {/* Notice & Duration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Min Notice (Days) <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.minNoticeDays}
            onChange={(e) => handleChange('minNoticeDays', parseInt(e.target.value) || 0)}
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
            Max Consecutive (Days)
          </label>
          <input
            type="number"
            min="0"
            value={formData.maxConsecutiveDays}
            onChange={(e) => handleChange('maxConsecutiveDays', parseInt(e.target.value) || 0)}
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

      {/* Min Tenure */}
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
            : isEditMode ? 'Update Policy' : 'Create Policy'}
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
