"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllOffboardingRequests, getClearanceChecklistByOffboarding } from '../../services';

function ClearanceViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const requestIdFromUrl = searchParams?.get('requestId') || '';

    const [requestId, setRequestId] = useState(requestIdFromUrl);
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [checklist, setChecklist] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

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
        void fetchChecklist(requestIdFromUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestIdFromUrl]);

    const fetchChecklist = async (id: string) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getClearanceChecklistByOffboarding(id, token);
            setChecklist(data);
        } catch (e: any) {
            setChecklist(null);
            setError(e?.message || 'Failed to load clearance checklist');
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

    const handleLoad = async () => {
        if (!requestId.trim()) {
            setError('Please select an offboarding request');
            return;
        }
        const id = requestId.trim();
        if (id === requestIdFromUrl) {
            void fetchChecklist(id);
            return;
        }
        router.push(`/recruitment/offboarding/clearance/view?requestId=${encodeURIComponent(id)}`);
    };

    const effectiveChecklist = useMemo(() => {
        if (error || !requestIdFromUrl) return checklist;
        if (checklist) return checklist;
        return {
            items: [
                { department: 'IT', status: 'pending', comments: '' },
                { department: 'Finance', status: 'pending', comments: '' },
                { department: 'Facilities', status: 'pending', comments: '' },
                { department: 'HR', status: 'pending', comments: '' },
                { department: 'Admin', status: 'pending', comments: '' },
            ],
            equipmentList: [],
            cardReturned: false,
        };
    }, [checklist, error, requestIdFromUrl]);

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
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

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/recruitment/offboarding"
                    style={{
                        color: 'var(--recruitment)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        display: 'inline-block',
                    }}
                >
                    ← Back to Offboarding
                </Link>

                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Clearance Checklist
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    View departmental approvals and assets returned for a specific offboarding request
                </p>
            </div>

            <div style={cardStyle}>
                <label style={labelStyle} htmlFor="requestId">
                    Offboarding Request ID
                </label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select
                        id="requestId"
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
                    <button
                        type="button"
                        onClick={handleLoad}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--recruitment)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Load
                    </button>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {isLoadingRequests ? 'Loading requests...' : 'Select an offboarding request to view its checklist.'}
                </div>
            </div>

            {error ? (
                <div style={{ ...cardStyle, borderColor: '#f5c6cb', backgroundColor: '#f8d7da', color: '#721c24' }}>{error}</div>
            ) : null}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : null}

            {!isLoading && effectiveChecklist ? (
                <>
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Approvals</h2>
                        {Array.isArray(effectiveChecklist.items) && effectiveChecklist.items.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {effectiveChecklist.items.map((it: any, idx: number) => (
                                    <div key={idx} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                                        <div style={{ fontWeight: 700 }}>{it.department || 'Department'}</div>
                                        <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Status: {it.status || 'pending'}
                                        </div>
                                        {it.comments ? (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                <strong>Comments:</strong> {it.comments}
                                            </div>
                                        ) : null}
                                        {it.updatedAt ? (
                                            <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                Updated: {new Date(it.updatedAt).toLocaleString()}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)' }}>No approval items found.</div>
                        )}
                    </div>

                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Assets & Access</h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Access Card Returned:</strong> {effectiveChecklist.cardReturned ? 'Yes' : 'No'}
                        </div>

                        {Array.isArray(effectiveChecklist.equipmentList) && effectiveChecklist.equipmentList.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {effectiveChecklist.equipmentList.map((eq: any, idx: number) => (
                                    <div key={idx} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                                        <div style={{ fontWeight: 700 }}>{eq.name || 'Equipment'}</div>
                                        <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Returned: {eq.returned ? 'Yes' : 'No'}
                                        </div>
                                        <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            Condition: {eq.condition || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)' }}>No equipment items found.</div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link
                            href={`/recruitment/offboarding/clearance/update?requestId=${encodeURIComponent(requestIdFromUrl)}`}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'var(--recruitment)',
                                color: 'white',
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                fontWeight: 600,
                                display: 'inline-block',
                            }}
                        >
                            Update Status
                        </Link>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default function ClearanceViewPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <ClearanceViewContent />
        </Suspense>
    );
}
