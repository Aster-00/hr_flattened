// src/app/leaves/policy/sections/LeavePoliciesSection.tsx
"use client";

import React, { useState } from 'react';
import { usePolicies } from '../../hooks/queries/usePolicies';
import type { LeavePolicy, RoundingRule, AccrualMethod } from '../../types';
import EmptyState from '../../components/common/EmptyState';
import { deleteLeavePolicy, updateLeavePolicy } from '../../api/policies.api';
import { showToast } from '@/app/lib/toast';
import EligibilityRulesModal from '../../components/policy-setup/EligibilityRulesModal';

export function LeavePoliciesSection() {
    const { policies, isLoading, isError, refetch } = usePolicies();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const [eligibilityPolicy, setEligibilityPolicy] = useState<LeavePolicy | null>(null);
    const [editFormData, setEditFormData] = useState({
        accrualMethod: 'yearly' as AccrualMethod,
        yearlyRate: 0,
        monthlyRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        carryForwardExpiryMonths: 0,
        roundingRule: 'ARITHMETIC' as RoundingRule,
        minNoticeDays: 0,
        maxConsecutiveDays: 0,
    });

    const handleDelete = async (policyId: string, policyName: string) => {
        if (!confirm(`Are you sure you want to delete the policy for "${policyName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(policyId);
        try {
            await deleteLeavePolicy(policyId);
            showToast('Policy deleted successfully', 'success');
            refetch();
        } catch (error: any) {
            console.error('Failed to delete policy:', error);
            showToast(error.response?.data?.message || 'Failed to delete policy', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (policy: LeavePolicy) => {
        setEditingPolicy(policy);
        setEditFormData({
            accrualMethod: policy.accrualMethod ?? 'yearly',
            yearlyRate: policy.yearlyRate ?? 0,
            monthlyRate: policy.monthlyRate ?? 0,
            carryForwardAllowed: policy.carryForwardAllowed ?? false,
            maxCarryForward: policy.maxCarryForward ?? 0,
            carryForwardExpiryMonths: policy.carryForwardExpiryMonths ?? 0,
            roundingRule: policy.roundingRule ?? 'ARITHMETIC',
            minNoticeDays: policy.minNoticeDays ?? 0,
            maxConsecutiveDays: policy.maxConsecutiveDays ?? 0,
        });
    };

    const handleSaveEdit = async () => {
        if (!editingPolicy) return;

        try {
            await updateLeavePolicy(editingPolicy._id, {
                accrualMethod: editFormData.accrualMethod,
                yearlyRate: editFormData.yearlyRate,
                monthlyRate: editFormData.monthlyRate,
                carryForwardAllowed: editFormData.carryForwardAllowed,
                maxCarryForward: editFormData.maxCarryForward,
                carryForwardExpiryMonths: editFormData.carryForwardExpiryMonths,
                roundingRule: editFormData.roundingRule,
                minNoticeDays: editFormData.minNoticeDays,
                maxConsecutiveDays: editFormData.maxConsecutiveDays,
            });
            showToast('Policy updated successfully', 'success');
            setEditingPolicy(null);
            refetch();
        } catch (error: any) {
            console.error('Failed to update policy:', error);
            showToast(error.response?.data?.message || 'Failed to update policy', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Leave policies
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="leaves-skeleton" style={{ height: '3rem', borderRadius: '0.5rem' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <EmptyState
                title="Unable to load policies"
                description="There was a problem loading leave policy data. Please try again later."
                icon="⚠️"
            />
        );
    }

    if (!policies || !policies.length) {
        return (
            <EmptyState
                title="No leave policies configured"
                description="HR has not configured any leave policies yet."
                icon="📋"
            />
        );
    }

    return (
        <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Leave policies
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {policies.length} configured
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {policies?.map((policy: LeavePolicy) => {
                    const annualDays = policy.accrualMethod === 'yearly' 
                        ? (policy.yearlyRate ?? 0)
                        : (policy.monthlyRate ?? 0) * 12;

                    return (
                        <div
                            key={policy._id}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-light)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                            {policy.leaveType?.name ?? 'Leave policy'}
                                        </h3>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: policy.accrualMethod === 'yearly' ? '#dbeafe' : '#fef3c7',
                                            color: policy.accrualMethod === 'yearly' ? '#1e40af' : '#92400e',
                                        }}>
                                            {policy.accrualMethod === 'yearly' ? 'Yearly' : 'Monthly'} Accrual
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Effective from {new Date(policy.effectiveDate).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => {
                                            setEligibilityPolicy(policy);
                                            setShowEligibilityModal(true);
                                        }}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.375rem',
                                            border: '1px solid var(--border-light)',
                                            backgroundColor: 'white',
                                            color: '#8b5cf6',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}
                                        title="Configure eligibility rules"
                                    >
                                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(policy)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.375rem',
                                            border: '1px solid var(--border-light)',
                                            backgroundColor: 'white',
                                            color: 'var(--primary-600)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}
                                        title="Edit policy settings"
                                    >
                                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(policy._id, policy.leaveType?.name ?? 'this policy')}
                                        disabled={deletingId === policy._id}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.375rem',
                                            border: '1px solid var(--border-light)',
                                            backgroundColor: 'white',
                                            color: '#dc2626',
                                            cursor: deletingId === policy._id ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            opacity: deletingId === policy._id ? 0.5 : 1,
                                        }}
                                        title="Delete policy"
                                    >
                                        {deletingId === policy._id ? (
                                            <div style={{
                                                width: '1rem',
                                                height: '1rem',
                                                border: '2px solid #dc2626',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite',
                                            }} />
                                        ) : (
                                            <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                backgroundColor: 'var(--bg-primary)',
                                borderRadius: '0.5rem',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        Annual Entitlement
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--leaves-600)' }}>
                                        {annualDays} days
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        Carry Forward
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                                        {policy.carryForwardAllowed 
                                            ? `Up to ${policy.maxCarryForward ?? 0} days` 
                                            : 'Not allowed'
                                        }
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        Rounding Rule
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                                        {policy.roundingRule?.replace(/_/g, ' ') ?? 'None'}
                                    </div>
                                </div>

                                {policy.minNoticeDays && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                            Min Notice
                                        </div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                                            {policy.minNoticeDays} days
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {editingPolicy && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setEditingPolicy(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            maxWidth: '700px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Edit Policy Settings: {editingPolicy.leaveType?.name}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Accrual Method Section */}
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                    Accrual Configuration
                                </h4>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                        Accrual Method <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        value={editFormData.accrualMethod}
                                        onChange={(e) => setEditFormData({ ...editFormData, accrualMethod: e.target.value as AccrualMethod })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <option value="yearly">Yearly (Full allocation at start)</option>
                                        <option value="monthly">Monthly (Accrued each month)</option>
                                        <option value="per-term">Per Term</option>
                                    </select>
                                </div>

                                {editFormData.accrualMethod === 'yearly' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                            Annual Days <span style={{ color: '#dc2626' }}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={editFormData.yearlyRate}
                                            onChange={(e) => setEditFormData({ ...editFormData, yearlyRate: parseFloat(e.target.value) || 0 })}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.875rem',
                                            }}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            Total annual entitlement allocated yearly
                                        </p>
                                    </div>
                                )}

                                {editFormData.accrualMethod === 'monthly' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                            Monthly Rate (Days/Month) <span style={{ color: '#dc2626' }}>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={editFormData.monthlyRate}
                                            onChange={(e) => setEditFormData({ ...editFormData, monthlyRate: parseFloat(e.target.value) || 0 })}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.875rem',
                                            }}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            Days accrued each month (Annual total: {(editFormData.monthlyRate * 12).toFixed(1)} days)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Carry Forward Section */}
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                    Carry Forward Settings
                                </h4>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={editFormData.carryForwardAllowed}
                                            onChange={(e) => setEditFormData({ ...editFormData, carryForwardAllowed: e.target.checked })}
                                            style={{ width: '1rem', height: '1rem' }}
                                        />
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                                            Allow Carry Forward
                                        </span>
                                    </label>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                                        Allow unused days to carry forward to next year
                                    </p>
                                </div>

                                {editFormData.carryForwardAllowed && (
                                    <>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                                Max Carry Forward Days <span style={{ color: '#dc2626' }}>*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={editFormData.maxCarryForward}
                                                onChange={(e) => setEditFormData({ ...editFormData, maxCarryForward: parseFloat(e.target.value) || 0 })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    border: '1px solid var(--border-light)',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.875rem',
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                                Expiry After (Months)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editFormData.carryForwardExpiryMonths}
                                                onChange={(e) => setEditFormData({ ...editFormData, carryForwardExpiryMonths: parseInt(e.target.value) || 0 })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    border: '1px solid var(--border-light)',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.875rem',
                                                }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                Months until carried forward days expire (0 = never expire)
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Rounding & Limits Section */}
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                    Rounding & Limits
                                </h4>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                        Rounding Rule
                                    </label>
                                    <select
                                        value={editFormData.roundingRule}
                                        onChange={(e) => setEditFormData({ ...editFormData, roundingRule: e.target.value as RoundingRule })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <option value="NONE">None (No rounding)</option>
                                        <option value="ARITHMETIC">Arithmetic (Round to nearest)</option>
                                        <option value="ALWAYS_UP">Always Round Up</option>
                                        <option value="ALWAYS_DOWN">Always Round Down</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                        Minimum Notice Days
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.minNoticeDays}
                                        onChange={(e) => setEditFormData({ ...editFormData, minNoticeDays: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Days before leave starts that request must be submitted
                                    </p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                        Maximum Consecutive Days
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.maxConsecutiveDays}
                                        onChange={(e) => setEditFormData({ ...editFormData, maxConsecutiveDays: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Maximum consecutive days allowed per request (0 = no limit)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEditingPolicy(null)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: 'white',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    backgroundColor: 'var(--primary-600)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Eligibility Rules Modal */}
            {eligibilityPolicy && (
                <EligibilityRulesModal
                    isOpen={showEligibilityModal}
                    onClose={() => {
                        setShowEligibilityModal(false);
                        setEligibilityPolicy(null);
                    }}
                    leaveTypeId={eligibilityPolicy.leaveTypeId}
                    leaveTypeName={eligibilityPolicy.leaveType?.name ?? 'Leave Type'}
                    existingRules={{}}
                />
            )}
        </div>
    );
}
