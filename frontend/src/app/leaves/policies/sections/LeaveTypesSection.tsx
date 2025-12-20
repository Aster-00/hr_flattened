// Leave Types Section
"use client";

import React, { useState } from 'react';
import { useLeaveTypes } from '../../hooks/queries/useLeaveTypes';
import { useDeleteLeaveType } from '../../hooks/mutations/useDeleteLeaveType';
import type { LeaveType } from '../../types';
import EmptyState from '../../components/common/EmptyState';
import { LeaveTypeForm } from '../../components/common/LeaveTypeForm';
import { showToast } from '@/app/lib/toast';

export function LeaveTypesSection() {
    const { types, isLoading, isError } = useLeaveTypes();
    const deleteLeaveType = useDeleteLeaveType();
    const [editingType, setEditingType] = useState<LeaveType | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    if (isLoading) {
        return (
            <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Leave types
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="leaves-skeleton" style={{ height: '2.5rem', borderRadius: '0.5rem' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <EmptyState
                title="Unable to load leave types"
                description="There was a problem loading leave type data. Please try again or contact HR."
                icon="⚠️"
            />
        );
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the leave type "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteLeaveType.mutateAsync(id);
            showToast('Leave type deleted successfully', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to delete leave type', 'error');
        }
    };

    const handleFormSuccess = () => {
        setEditingType(null);
        setIsCreating(false);
    };

    if (!types || !types.length) {
        return (
            <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Leave types
                    </h2>
                </div>
                {isCreating ? (
                    <LeaveTypeForm onSuccess={handleFormSuccess} onCancel={() => setIsCreating(false)} />
                ) : (
                    <>
                        <EmptyState
                            title="No leave types configured"
                            description="Your organization has not configured any leave types yet."
                            icon="📄"
                        />
                        <button
                            onClick={() => setIsCreating(true)}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                backgroundColor: 'var(--primary-600)',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            + Create Leave Type
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Leave types
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {types.length} configured
                    </span>
                    {!isCreating && !editingType && (
                        <button
                            onClick={() => setIsCreating(true)}
                            style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                backgroundColor: 'var(--primary-600)',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            + Add New
                        </button>
                    )}
                </div>
            </div>

            {isCreating && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                        Create New Leave Type
                    </h3>
                    <LeaveTypeForm onSuccess={handleFormSuccess} onCancel={() => setIsCreating(false)} />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {types?.map((type: LeaveType) => (
                    <div key={type._id}>
                        {editingType?._id === type._id ? (
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '2px solid var(--primary-600)' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                    Edit Leave Type
                                </h3>
                                <LeaveTypeForm
                                    leaveType={editingType}
                                    onSuccess={handleFormSuccess}
                                    onCancel={() => setEditingType(null)}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-light)',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                        {type.name} ({type.code})
                                    </div>
                                    {type.description && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {type.description}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-tertiary)' }}>
                                        <div>{type.paidLeave ? 'Paid' : 'Unpaid'}</div>
                                        {type.requiresAttachment && <div>Attachment required</div>}
                                        {type.deductible && <div>Deductible</div>}
                                    </div>
                                    {!editingType && !isCreating && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setEditingType(type)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '0.375rem',
                                                    border: '1px solid var(--border-light)',
                                                    backgroundColor: 'white',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type._id, type.name)}
                                                disabled={deleteLeaveType.isPending}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '0.375rem',
                                                    border: '1px solid #fecaca',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#dc2626',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    cursor: deleteLeaveType.isPending ? 'not-allowed' : 'pointer',
                                                    opacity: deleteLeaveType.isPending ? 0.6 : 1,
                                                }}
                                            >
                                                {deleteLeaveType.isPending ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
