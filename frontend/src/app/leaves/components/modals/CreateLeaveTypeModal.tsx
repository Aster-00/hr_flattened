'use client';

import React, { useState, useEffect } from 'react';
import { useCreateLeaveType } from '../../hooks/mutations/useCreateLeaveType'; // ✅ ADDED
import { getAllLeaveCategories, LeaveCategory } from '../../api/categories.api';

interface CreateLeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLeaveTypeModal({ isOpen, onClose, onSuccess }: CreateLeaveTypeModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    description: '',
    paid: true,
    deductible: true,
    requiresAttachment: false,
    attachmentType: '',
    minTenureMonths: '',
    maxDurationDays: '',
  });
  const [categories, setCategories] = useState<LeaveCategory[]>([]);
  const [error, setError] = useState('');

  const createMutation = useCreateLeaveType(); // ✅ ADDED
  const loading = createMutation.isPending; // ✅ ADDED

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await getAllLeaveCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload: any = {
        name: formData.name,
        code: formData.code,
        categoryId: formData.categoryId,
        description: formData.description || undefined,
        paid: formData.paid,
        deductible: formData.deductible,
        requiresAttachment: formData.requiresAttachment,
      };

      if (formData.attachmentType) {
        payload.attachmentType = formData.attachmentType;
      }
      if (formData.minTenureMonths) {
        payload.minTenureMonths = parseInt(formData.minTenureMonths);
      }
      if (formData.maxDurationDays) {
        payload.maxDurationDays = parseInt(formData.maxDurationDays);
      }

      await createMutation.mutateAsync(payload); // ✅ CHANGED: was createLeaveType(payload)

      onSuccess();
      onClose();
      setFormData({
        code: '',
        name: '',
        categoryId: '',
        description: '',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        attachmentType: '',
        minTenureMonths: '',
        maxDurationDays: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '672px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-light)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Create Leave Type</h2>
            <button onClick={onClose} style={{ padding: '8px', borderRadius: '8px', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#B91C1C', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            {/* Code */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Code <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., AL"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Annual Leave"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
            </div>

            {/* Category */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Category <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none', cursor: 'pointer' }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this leave type..."
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            {/* Max Duration Days */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Max Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxDurationDays}
                onChange={(e) => setFormData({ ...formData, maxDurationDays: e.target.value })}
                placeholder="e.g., 90"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
            </div>

            {/* Min Tenure Months */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Min Tenure (Months)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minTenureMonths}
                onChange={(e) => setFormData({ ...formData, minTenureMonths: e.target.value })}
                placeholder="e.g., 3"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Paid Leave</div>
                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Employee receives salary during leave</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={formData.deductible}
                onChange={(e) => setFormData({ ...formData, deductible: e.target.checked })}
                style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Deductible</div>
                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Deducted from leave balance</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={formData.requiresAttachment}
                onChange={(e) => setFormData({ ...formData, requiresAttachment: e.target.checked })}
                style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Requires Attachment</div>
                <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Supporting documents required</div>
              </div>
            </label>
          </div>

          {/* Attachment Type (conditional) */}
          {formData.requiresAttachment && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Attachment Type
              </label>
              <select
                value={formData.attachmentType}
                onChange={(e) => setFormData({ ...formData, attachmentType: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Select type...</option>
                <option value="MEDICAL_CERTIFICATE">Medical Certificate</option>
                <option value="SUPPORTING_DOCUMENT">Supporting Document</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', fontWeight: 500, border: '1px solid var(--border-light)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', fontWeight: 500, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', backgroundColor: loading ? '#9CA3AF' : 'var(--leaves-600)', border: 'none' }}
            >
              {loading ? 'Creating...' : 'Create Leave Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
