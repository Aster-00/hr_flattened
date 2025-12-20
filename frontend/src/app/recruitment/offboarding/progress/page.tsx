"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllOffboardingRequests, getOffboardingProgress } from '../services';

function OffboardingProgressContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const requestIdFromUrl = searchParams?.get('requestId') || '';

    const [requestId, setRequestId] = useState(requestIdFromUrl);
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [progress, setProgress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const token = useMemo(() => 'YOUR_AUTH_TOKEN', []);

    useEffect(() => {
        setRequestId(requestIdFromUrl);
    }, [requestIdFromUrl]);

    useEffect(() => {
        void fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!requestIdFromUrl) return;
        void fetchProgress(requestIdFromUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestIdFromUrl]);

    const fetchProgress = async (id: string) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getOffboardingProgress(id, token);
            setProgress(data);
        } catch (e: any) {
            setProgress(null);
            setError(e?.message || 'Failed to load progress');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const data = await getAllOffboardingRequests({}, token);
            setRequests(Array.isArray(data) ? data : []);
        } catch {
            setRequests([]);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleLoad = () => {
        if (!requestId.trim()) {
            setError('Please select an offboarding request');
            return;
        }
        const id = requestId.trim();
        if (id === requestIdFromUrl) {
            void fetchProgress(id);
            return;
        }
        router.push(`/recruitment/offboarding/progress?requestId=${encodeURIComponent(id)}`);
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
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
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/recruitment/offboarding" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Offboarding
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Progress Tracker
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track progress for a specific offboarding request</p>
            </div>

            <div style={cardStyle}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Offboarding Request</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select
                        value={requestId}
                        onChange={(e) => setRequestId(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: '300px' }}
                    >
                        <option value="">-- Select Offboarding Request --</option>
                        {requests.map((req: any) => {
                            const empName = req.employeeId && typeof req.employeeId === 'object'
                                ? `${req.employeeId.firstName || 'Employee'} ${req.employeeId.lastName || ''}`.trim()
                                : 'Employee';
                            const reason = req.reason ? ` - ${req.reason}` : '';
                            return (
                                <option key={req._id} value={req._id}>
                                    {empName}{reason} ({req._id})
                                </option>
                            );
                        })}
                    </select>
                    <button type="button" onClick={handleLoad} style={btnStyle}>
                        Load
                    </button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {isLoadingRequests ? 'Loading requests...' : 'Select a request and click Load.'}
                </div>
            </div>

            {error ? (
                <div style={{ ...cardStyle, borderColor: '#f5c6cb', backgroundColor: '#f8d7da', color: '#721c24' }}>{error}</div>
            ) : null}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : null}

            {!isLoading && progress ? (
                <div style={cardStyle}>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <strong>Current Stage:</strong> {progress.currentStage || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <strong>Overall Progress:</strong> {progress.overallProgress ?? 0}%
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <div><strong>Exit Interview Completed:</strong> {progress.exitInterviewCompleted ? 'Yes' : 'No'}</div>
                        <div><strong>Assets Returned:</strong> {progress.assetsReturned ? 'Yes' : 'No'}</div>
                        <div><strong>Settlement Completed:</strong> {progress.settlementCompleted ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function OffboardingProgressPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <OffboardingProgressContent />
        </Suspense>
    );
}
