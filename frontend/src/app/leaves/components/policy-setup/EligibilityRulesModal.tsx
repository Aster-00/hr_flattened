// EligibilityRulesModal component
'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateEligibilityRules, UpdateEligibilityRulesInput } from '../../hooks/mutations/useUpdateEligibilityRules';
import { showToast } from '@/app/lib/toast';

interface EligibilityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypeId: string;
  leaveTypeName: string;
  existingRules?: Partial<UpdateEligibilityRulesInput>;
}

const EMPLOYEE_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern'];
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Manager', 'Senior Manager', 'Director'];
const LOCATIONS = ['Egypt', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'];

export default function EligibilityRulesModal({ 
  isOpen, 
  onClose, 
  leaveTypeId, 
  leaveTypeName,
  existingRules 
}: EligibilityRulesModalProps) {
  const [minTenureMonths, setMinTenureMonths] = useState(0);
  const [minServiceDays, setMinServiceDays] = useState(0);
  const [probationRestriction, setProbationRestriction] = useState(false);
  const [allowedEmployeeTypes, setAllowedEmployeeTypes] = useState<string[]>([]);
  const [allowedGrades, setAllowedGrades] = useState<string[]>([]);
  const [allowedLocations, setAllowedLocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateRules = useUpdateEligibilityRules();


  useEffect(() => {
    if (isOpen && existingRules) {
      setMinTenureMonths(existingRules.minTenureMonths || 0);
      setMinServiceDays(existingRules.minServiceDays || 0);
      setProbationRestriction(existingRules.probationRestriction || false);
      setAllowedEmployeeTypes(existingRules.allowedEmployeeTypes || []);
      setAllowedGrades(existingRules.allowedGrades || []);
      setAllowedLocations(existingRules.allowedLocations || []);
    }
  }, [isOpen, existingRules]);

  const toggleArrayItem = (array: string[], item: string, setArray: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (minTenureMonths < 0) {
      newErrors.minTenureMonths = 'Minimum tenure cannot be negative';
    }

    if (minServiceDays < 0) {
      newErrors.minServiceDays = 'Minimum service days cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload: UpdateEligibilityRulesInput = {
        leaveTypeId,
        minTenureMonths,
        minServiceDays,
        probationRestriction,
        allowedEmployeeTypes,
        allowedGrades,
        allowedLocations,
      };

      await updateRules.mutateAsync(payload);
      showToast('Eligibility rules updated successfully', 'success');
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update eligibility rules';
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
            maxWidth: '700px',
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
                Configure Eligibility Rules
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {leaveTypeName}
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
            {/* Tenure and Service Requirements */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '16px'
              }}>
                Service Requirements
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Minimum Tenure (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minTenureMonths}
                    onChange={(e) => {
                      setMinTenureMonths(parseInt(e.target.value) || 0);
                      if (errors.minTenureMonths) setErrors({ ...errors, minTenureMonths: '' });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: errors.minTenureMonths ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.minTenureMonths && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      {errors.minTenureMonths}
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
                    Minimum Service Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minServiceDays}
                    onChange={(e) => {
                      setMinServiceDays(parseInt(e.target.value) || 0);
                      if (errors.minServiceDays) setErrors({ ...errors, minServiceDays: '' });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: errors.minServiceDays ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.minServiceDays && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      {errors.minServiceDays}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={probationRestriction}
                    onChange={(e) => setProbationRestriction(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    Restrict during probation period
                  </span>
                </label>
              </div>
            </div>

            {/* Employee Types */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '12px'
              }}>
                Allowed Employee Types
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {EMPLOYEE_TYPES.map(type => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: allowedEmployeeTypes.includes(type) ? '#eff6ff' : '#f9fafb',
                      border: allowedEmployeeTypes.includes(type) ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allowedEmployeeTypes.includes(type)}
                      onChange={() => toggleArrayItem(allowedEmployeeTypes, type, setAllowedEmployeeTypes)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Position Grades */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '12px'
              }}>
                Allowed Position Grades
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {GRADES.map(grade => (
                  <label
                    key={grade}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: allowedGrades.includes(grade) ? '#f0fdf4' : '#f9fafb',
                      border: allowedGrades.includes(grade) ? '1px solid #22c55e' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allowedGrades.includes(grade)}
                      onChange={() => toggleArrayItem(allowedGrades, grade, setAllowedGrades)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '12px'
              }}>
                Location Restrictions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {LOCATIONS.map(location => (
                  <label
                    key={location}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: allowedLocations.includes(location) ? '#fef3c7' : '#f9fafb',
                      border: allowedLocations.includes(location) ? '1px solid #f59e0b' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allowedLocations.includes(location)}
                      onChange={() => toggleArrayItem(allowedLocations, location, setAllowedLocations)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>{location}</span>
                  </label>
                ))}
              </div>
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
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
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
                disabled={updateRules.isPending}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: updateRules.isPending ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updateRules.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!updateRules.isPending) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updateRules.isPending) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {updateRules.isPending && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                )}
                {updateRules.isPending ? 'Saving...' : 'Save Eligibility Rules'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
