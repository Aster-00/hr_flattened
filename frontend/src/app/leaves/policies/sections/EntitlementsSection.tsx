// Entitlements Section
"use client";

import React from 'react';
import { useEntitlements } from '../../hooks/queries/useEntitlements';
import EmptyState from '../../components/common/EmptyState';

export function EntitlementsSection() {
    const { entitlements, isLoading, isError } = useEntitlements();

    if (isLoading) {
        return (
            <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    My entitlements
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="leaves-skeleton" style={{ height: '3rem', borderRadius: '0.5rem' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !entitlements) {
        return (
            <EmptyState
                title="Unable to load entitlements"
                description="We couldn't load your leave balances. Please try again later."
                icon="⚠️"
            />
        );
    }

    const totalAvailable = entitlements?.totalAvailable || 0;
    const totalUsed = entitlements?.totalUsed || 0;

    return (
        <div className="leaves-card" style={{ boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                My entitlements
            </h2>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Total available
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--leaves-600)' }}>
                        {totalAvailable} days
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    Used: {totalUsed} days
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {entitlements?.entitlements?.length ? entitlements.entitlements.map((e, idx) => (
                    <div
                        key={idx}
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
                        <div>
                            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                {e.leaveType?.name ?? 'Leave type'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                Entitled: {e.yearlyEntitlement} • Used: {e.taken} • Available: {e.remaining}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                        No entitlements available
                    </div>
                )}
            </div>
        </div>
    );
}
