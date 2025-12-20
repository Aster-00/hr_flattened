"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOffboardingRequests, processFinalSettlement } from '../../services';

export default function ProcessPaymentPage() {
    const extractSettlement = (hrComments: any) => {
        if (!hrComments || typeof hrComments !== 'string') return null;

        const marker = '[SETTLEMENT]:';
        const start = hrComments.indexOf(marker);
        if (start === -1) return null;

        const afterMarker = hrComments.slice(start + marker.length).trimStart();
        const nextBlockIdx = afterMarker.search(/\n\s*\[[A-Z_]+\]:/);
        const jsonText = (nextBlockIdx === -1 ? afterMarker : afterMarker.slice(0, nextBlockIdx)).trim();
        if (!jsonText) return null;

        try {
            return JSON.parse(jsonText);
        } catch {
            return null;
        }
    };

    const [pendingPayments, setPendingPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const fetchPendingPayments = async () => {
        setIsLoading(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const requests = await getAllOffboardingRequests({}, token);

            const withSettlement = (Array.isArray(requests) ? requests : []).map((r: any) => {
                const settlement = extractSettlement(r?.hrComments);
                return settlement ? { ...r, finalSettlement: settlement } : r;
            });

            const settlements = withSettlement.filter((r: any) => !!r?.finalSettlement);
            setPendingPayments(settlements);
        } catch (error) {
            console.error('Failed to load pending payments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcessPayment = async (id: string) => {
        const ok = window.confirm(`Process payment for request ${id}?`);
        if (!ok) return;

        setProcessingId(id);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            await processFinalSettlement(id, 'system', {}, token);
            await fetchPendingPayments();
            window.alert('Payment processed successfully.');
        } catch (e: any) {
            window.alert(e?.message || 'Failed to process payment');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/recruitment/offboarding/settlement/create" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Settlement
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Process Payments
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Manage and release final settlement payments
                </p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading payments...</div>
            ) : pendingPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                    No pending payments found. Create a settlement first.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {pendingPayments.map((req: any) => {
                        const s = req.finalSettlement || {};
                        const isProcessed = s.settlementStatus === 'processed';
                        const isProcessing = processingId === req._id;
                        const total = ((s.finalSalaryAmount || 0) + (s.leaveEncashmentAmount || 0) + (s.bonusAmount || 0) + (s.otherPayments || 0) - (s.deductions || 0)).toFixed(2);

                        return (
                            <div key={req._id} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {req.employeeId && typeof req.employeeId === 'object'
                                            ? `${req.employeeId.firstName || 'Employee'} ${req.employeeId.lastName || ''}`
                                            : 'Employee'}
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: 'gray' }}>
                                        ID: {req.employeeId && typeof req.employeeId === 'object'
                                            ? (req.employeeId.employeeId || req.employeeId._id)
                                            : (req.employeeId || 'Unknown')}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        <strong>Bank:</strong> {s.bankAccountDetails || 'N/A'}
                                    </div>
                                    <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <strong>Status:</strong> {s.settlementStatus || 'pending'}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Payable</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#155724' }}>${total}</div>
                                </div>

                                <div>
                                    <button
                                        onClick={() => handleProcessPayment(req._id)}
                                        disabled={isProcessed || isProcessing}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: (isProcessed || isProcessing) ? '#cccccc' : 'var(--recruitment)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            fontWeight: '600',
                                            cursor: (isProcessed || isProcessing) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isProcessed ? 'Processed' : isProcessing ? 'Processing...' : 'Process Payment'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
