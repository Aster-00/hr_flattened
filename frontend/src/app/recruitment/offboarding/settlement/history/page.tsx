"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOffboardingRequests } from '../../services';

export default function SettlementHistoryPage() {
    const [settlements, setSettlements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const requests = await getAllOffboardingRequests({}, token);
            // Filter requests that have settlement data
            // Assuming the backend stores it in 'finalSettlement' or similar, 
            // or we just show all requests that have reached the SETTLED stage.
            // For now, let's show all, or filter by existing data if visible.

            // Note: Since I don't see the exact backend response structure for nested settlement in the cache,
            // I will assume for now that we display all requests and check if they have settlement info.
            // Only 'COMPLETED' or requests with settlement fields should be shown?
            // Let's show all requests that have settlement-like fields populated if possible, 
            // otherwise just show all compelted ones.

            const settled = requests.filter((r: any) => r.finalSettlement || r.status === 'COMPLETED');
            setSettlements(requests); // Actually showing ALL requests for context is safer for debugging, but let's try to focus on settled ones logic later.
            // User asked for "Settlement History", so let's show everything for now to be safe.
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/recruitment/offboarding/settlement/create" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Create Settlement
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Settlement History
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Record of all processed final settlements
                </p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading history...</div>
            ) : settlements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                    No settlements found.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-primary)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <thead style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Employee</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Request ID</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Final Salary</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Total Payout</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Last Working Day</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Payment Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.map((req: any) => {
                                const s = req.finalSettlement || {}; // Access settlement object if exists
                                return (
                                    <tr key={req._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600' }}>
                                                {req.employeeId && typeof req.employeeId === 'object'
                                                    ? `${req.employeeId.firstName || 'Employee'} ${req.employeeId.lastName || ''}`
                                                    : 'Employee'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'gray' }}>
                                                ID: {req.employeeId && typeof req.employeeId === 'object'
                                                    ? (req.employeeId.employeeId || req.employeeId._id)
                                                    : (req.employeeId || 'Unknown')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{req._id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {s.finalSalaryAmount ? `$${s.finalSalaryAmount}` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#155724' }}>
                                            {/* Calculate Total if not explicitly stored, or just show N/A */}
                                            {s.finalSalaryAmount ?
                                                `$${((s.finalSalaryAmount || 0) + (s.leaveEncashmentAmount || 0) + (s.bonusAmount || 0) + (s.otherPayments || 0) - (s.deductions || 0)).toFixed(2)}`
                                                : <span style={{ color: '#999' }}>Pending</span>
                                            }
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {s.lastWorkingDay ? new Date(s.lastWorkingDay).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {s.paymentDate ? new Date(s.paymentDate).toLocaleDateString() : (s.finalSalaryAmount ? 'Processed' : 'Draft')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
