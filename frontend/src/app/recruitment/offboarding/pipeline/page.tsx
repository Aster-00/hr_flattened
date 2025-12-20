"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getOffboardingPipeline, getOffboardingProgress } from '../services';

export default function OffboardingPipelinePage() {
    const token = useMemo(() => 'YOUR_AUTH_TOKEN', []);

    const extractStatus = (hrComments: any) => {
        if (!hrComments || typeof hrComments !== 'string') return null;
        const marker = '[STATUS]:';
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

    const [employeeId, setEmployeeId] = useState('');
    const [rows, setRows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPipeline = async (filterEmployeeId: string | null) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getOffboardingPipeline(filterEmployeeId, token);
            const list = Array.isArray(data) ? data : [];

            const progressResults = await Promise.allSettled(
                list.map((r: any) => getOffboardingProgress(String(r._id), token))
            );

            const progressById = new Map<string, any>();
            list.forEach((r: any, idx: number) => {
                const res = progressResults[idx];
                if (res && res.status === 'fulfilled') {
                    progressById.set(String(r._id), res.value);
                }
            });

            setRows(
                list.map((r: any) => ({
                    ...r,
                    _status: extractStatus(r?.hrComments),
                    _progress: progressById.get(String(r._id)) || null,
                }))
            );
        } catch (e: any) {
            setRows([]);
            setError(e?.message || 'Failed to load pipeline');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchPipeline(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const inputStyle: React.CSSProperties = {
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        minWidth: '280px',
        flex: 1,
    };

    const btnStyle: React.CSSProperties = {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--recruitment)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: 600,
        cursor: 'pointer',
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/recruitment/offboarding" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Offboarding
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Offboarding Pipeline
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track offboarding stages across all requests</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <input
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Filter by employeeId (optional)"
                    style={inputStyle}
                />
                <button type="button" onClick={() => void fetchPipeline(employeeId.trim() ? employeeId.trim() : null)} style={btnStyle}>
                    Apply
                </button>
                <button type="button" onClick={() => { setEmployeeId(''); void fetchPipeline(null); }} style={{ ...btnStyle, backgroundColor: '#6b7280' }}>
                    Clear
                </button>
            </div>

            {error ? (
                <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', marginBottom: '1.5rem' }}>{error}</div>
            ) : null}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : rows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>No offboarding requests found.</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-primary)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <thead style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Employee</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Request</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Current Stage</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Progress</th>
                                <th style={{ padding: '1rem', fontWeight: 'bold' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r: any) => {
                                const st = r._status || {};
                                const progressPct = typeof r?._progress?.overallProgress === 'number'
                                    ? r._progress.overallProgress
                                    : (r?._progress?.overallProgress ? Number(r._progress.overallProgress) : 0);
                                const emp = r.employeeId && typeof r.employeeId === 'object'
                                    ? `${r.employeeId.firstName || 'Employee'} ${r.employeeId.lastName || ''}`
                                    : 'Employee';
                                return (
                                    <tr key={r._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>{emp}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{r._id}</td>
                                        <td style={{ padding: '1rem' }}>{r.status || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>{st.currentStage || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>{`${progressPct || 0}%`}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <Link
                                                href={`/recruitment/offboarding/progress?requestId=${encodeURIComponent(r._id)}`}
                                                style={{ color: 'var(--recruitment)', textDecoration: 'none', fontWeight: 600 }}
                                            >
                                                View Progress
                                            </Link>
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
