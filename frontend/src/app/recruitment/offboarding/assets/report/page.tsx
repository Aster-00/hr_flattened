"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOffboardingRequests, getAssetsByOffboarding } from '../../services';

export default function AssetReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        generateReport();
    }, []);

    const generateReport = async () => {
        try {
            const token = 'YOUR_AUTH_TOKEN';
            // 1. Fetch all requests
            const requests = await getAllOffboardingRequests({}, token);

            // 2. Fetch assets for each request in parallel
            const reportPromises = requests.map(async (req: any) => {
                try {
                    const assets = await getAssetsByOffboarding(req._id, token);

                    const total = assets.length;
                    const returned = assets.filter((a: any) => a.returned).length;
                    const pending = total - returned;

                    return {
                        requestId: req._id,
                        employee: req.employeeId,
                        terminationDate: req.terminationDate,
                        assets: assets,
                        stats: { total, returned, pending },
                        status: pending === 0 && total > 0 ? 'CLEARED' : (total === 0 ? 'NO ASSETS' : 'PENDING')
                    };
                } catch (e) {
                    return null;
                }
            });

            const results = await Promise.all(reportPromises);
            setReportData(results.filter(r => r !== null));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Generating Asset Report...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)' }}>Asset Report</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Overview of all offboarding asset returns</p>
                </div>
                <button
                    onClick={() => { setIsLoading(true); generateReport(); }}
                    style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer' }}
                >
                    ↻ Refresh
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {reportData.map((item, index) => (
                    <div key={index} style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    {typeof item.employee === 'object' && item.employee
                                        ? `${item.employee.firstName} ${item.employee.lastName}`
                                        : 'Unknown Employee'}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {/* Try to show Employee ID, otherwise fallback to Unknown */}
                                    ID: {(typeof item.employee === 'object' && item.employee && (item.employee.employeeId || item.employee._id))
                                        ? (item.employee.employeeId || item.employee._id)
                                        : (item.employee || 'Unknown')}
                                </div>
                                <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Request: {item.requestId}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    backgroundColor: item.status === 'CLEARED' ? '#d4edda' : (item.status === 'NO ASSETS' ? '#e2e3e5' : '#fff3cd'),
                                    color: item.status === 'CLEARED' ? '#155724' : (item.status === 'NO ASSETS' ? '#383d41' : '#856404')
                                }}>
                                    {item.status}
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{item.stats.total}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Total Assets</div>
                            </div>
                            <div style={{ padding: '0.5rem', backgroundColor: '#d4edda', borderRadius: '0.5rem', color: '#155724' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{item.stats.returned}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Returned</div>
                            </div>
                            <div style={{ padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '0.5rem', color: '#721c24' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{item.stats.pending}</div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Pending</div>
                            </div>
                        </div>

                        {/* Pending Items List */}
                        {item.stats.pending > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#721c24' }}>Still Pending:</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                                    {item.assets.filter((a: any) => !a.returned).map((asset: any, i: number) => (
                                        <li key={i} style={{
                                            padding: '0.5rem',
                                            border: '1px solid #f5c6cb',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span>{asset.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#721c24' }}>{asset.assetCategory || 'Item'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ paddingTop: '0.5rem' }}>
                            <Link href={`/recruitment/offboarding/assets/return?requestId=${item.requestId}&employeeId=${(item.employee && typeof item.employee === 'object') ? (item.employee._id || item.employee.id) : (item.employee || '')}`}
                                style={{ fontSize: '0.9rem', color: 'var(--recruitment)', textDecoration: 'none', fontWeight: '600' }}>
                                Manage Assets →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
