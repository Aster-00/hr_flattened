'use client';

import React, { useState } from 'react';
import { useLeaveTypes } from '../../hooks/queries/useLeaveTypes';
import { createLeavePolicy } from '../../api';
import type { AccrualMethod, RoundingRule } from '../../types';

interface CreateLeavePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLeavePolicyModal({ isOpen, onClose, onSuccess }: CreateLeavePolicyModalProps) {
  const { types } = useLeaveTypes();
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    annualDays: '',
    accruedMonthly: false,
    allowCarryover: false,
    maxCarryoverDays: '',
    expiryMonths: '',
    roundingRule: 'NONE',
    minUnit: '1',
    minTenureMonths: '',
    employeeTypes: [] as string[],
    requiresDocumentAboveDays: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        leaveTypeId: formData.leaveTypeId,
        effectiveDate: formData.effectiveDate,
        accrualMethod: (formData.accruedMonthly ? 'monthly' : 'yearly') as AccrualMethod,
        monthlyRate: formData.accruedMonthly ? parseFloat(formData.annualDays) / 12 : undefined,
        yearlyRate: formData.accruedMonthly ? undefined : parseFloat(formData.annualDays),
        carryForwardAllowed: formData.allowCarryover,
        maxCarryForward: formData.maxCarryoverDays ? parseInt(formData.maxCarryoverDays) : undefined,
        carryForwardExpiryMonths: formData.expiryMonths ? parseInt(formData.expiryMonths) : undefined,
        roundingRule: formData.roundingRule as RoundingRule,
        minNoticeDays: 0, // Default value
        maxConsecutiveDays: undefined,
        eligibility: formData.minTenureMonths || formData.employeeTypes.length > 0 ? {
          minTenureMonths: formData.minTenureMonths ? parseInt(formData.minTenureMonths) : undefined,
          contractTypesAllowed: formData.employeeTypes.length > 0 ? formData.employeeTypes : undefined,
        } : undefined,
        approvalChain: [
          {
            role: 'MANAGER',
            level: 1,
          }
        ],
      };

      await createLeavePolicy(payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeType = (type: string) => {
    setFormData({
      ...formData,
      employeeTypes: formData.employeeTypes.includes(type)
        ? formData.employeeTypes.filter(t => t !== type)
        : [...formData.employeeTypes, type],
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '768px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-light)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Create Leave Policy</h2>
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

          {/* Basic Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Leave Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  required
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                >
                  <option value="">Select leave type...</option>
                  {types?.map((type: any) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Effective Date <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                />
              </div>
            </div>
          </div>

          {/* Entitlement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Entitlement</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Annual Days <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={formData.annualDays}
                  onChange={(e) => setFormData({ ...formData, annualDays: e.target.value })}
                  placeholder="e.g., 20"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'white', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.2s', width: '100%', backgroundColor: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                  <input
                    type="checkbox"
                    checked={formData.accruedMonthly}
                    onChange={(e) => setFormData({ ...formData, accruedMonthly: e.target.checked })}
                    style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Accrued Monthly</span>
                </label>
              </div>
            </div>
          </div>

          {/* Carryover */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                checked={formData.allowCarryover}
                onChange={(e) => setFormData({ ...formData, allowCarryover: e.target.checked })}
                style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #D1D5DB', cursor: 'pointer' }}
              />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Allow Carryover</h3>
            </div>
            
            {formData.allowCarryover && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Max Carryover Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxCarryoverDays}
                    onChange={(e) => setFormData({ ...formData, maxCarryoverDays: e.target.value })}
                    placeholder="e.g., 5"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'white', outline: 'none' }}
                    onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Expiry Months
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.expiryMonths}
                    onChange={(e) => setFormData({ ...formData, expiryMonths: e.target.value })}
                    placeholder="e.g., 3"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'white', outline: 'none' }}
                    onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rounding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Rounding Rules</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Rounding Rule
                </label>
                <select
                  value={formData.roundingRule}
                  onChange={(e) => setFormData({ ...formData, roundingRule: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                >
                  <option value="NONE">None</option>
                  <option value="ROUND_UP">Round Up</option>
                  <option value="ROUND_DOWN">Round Down</option>
                  <option value="NEAREST_HALF">Nearest Half Day</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Min Unit (Days)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.minUnit}
                  onChange={(e) => setFormData({ ...formData, minUnit: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                />
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Eligibility</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Minimum Tenure (Months)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minTenureMonths}
                onChange={(e) => setFormData({ ...formData, minTenureMonths: e.target.value })}
                placeholder="e.g., 3"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'white', outline: 'none' }}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Employee Types
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleEmployeeType(type)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      ...(formData.employeeTypes.includes(type)
                        ? { backgroundColor: '#2563EB', color: 'white', border: 'none' }
                        : { backgroundColor: 'white', border: '1px solid var(--border-light)', color: '#374151' })
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Requires Documentation Above Days
            </label>
            <input
              type="number"
              min="0"
              value={formData.requiresDocumentAboveDays}
              onChange={(e) => setFormData({ ...formData, requiresDocumentAboveDays: e.target.value })}
              placeholder="e.g., 3"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', outline: 'none' }}
              onFocus={(e) => e.currentTarget.style.outline = '2px solid #3B82F6'}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
            />
            <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-tertiary)' }}>
              Leave blank if documentation is not required
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', position: 'sticky', bottom: 0, backgroundColor: 'white', paddingBottom: '8px' }}>
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
              {loading ? 'Creating...' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
