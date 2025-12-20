"use client";

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    getAllOffboardingRequests,
    getClearanceChecklistByOffboarding,
    updateClearanceChecklistByOffboarding,
    markAssetAsReturned,
    updateAssetReturn,
    updateOffboardingStage,
    completeOffboardingStage,
} from '../../services';

function ClearanceUpdateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const requestIdFromUrl = searchParams?.get('requestId') || '';

    const [requestId, setRequestId] = useState(requestIdFromUrl);
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [checklist, setChecklist] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const [receivedByPersonId, setReceivedByPersonId] = useState('');
    const [condition, setCondition] = useState('good');

    const [approvalDepartment, setApprovalDepartment] = useState('IT');
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [approvalComments, setApprovalComments] = useState('');
    const [cardReturned, setCardReturned] = useState(false);

    const [stageToSet, setStageToSet] = useState('initiated');

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

    useEffect(() => {
        if (!checklist) return;
        setCardReturned(!!checklist.cardReturned);
    }, [checklist]);

    const fetchChecklist = async (id: string) => {
        setIsLoading(true);
        setError('');
        setMessage('');
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
        router.push(`/recruitment/offboarding/clearance/update?requestId=${encodeURIComponent(id)}`);
    };

    const handleUpdateApproval = async () => {
        if (!requestIdFromUrl) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await updateClearanceChecklistByOffboarding(
                requestIdFromUrl,
                {
                    department: approvalDepartment,
                    status: approvalStatus,
                    comments: approvalComments,
                },
                token
            );
            setMessage('Clearance approval updated.');
            await fetchChecklist(requestIdFromUrl);
        } catch (e: any) {
            setError(e?.message || 'Failed to update clearance approval');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCardReturned = async () => {
        if (!requestIdFromUrl) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await updateClearanceChecklistByOffboarding(
                requestIdFromUrl,
                { cardReturned },
                token
            );
            setMessage('Card return status updated.');
            await fetchChecklist(requestIdFromUrl);
        } catch (e: any) {
            setError(e?.message || 'Failed to update card status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllReturned = async () => {
        if (!requestIdFromUrl) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await markAssetAsReturned(requestIdFromUrl, receivedByPersonId || 'system', condition || 'good', token);
            setMessage('Assets marked as returned.');
            await fetchChecklist(requestIdFromUrl);
        } catch (e: any) {
            setError(e?.message || 'Failed to update assets');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleEquipment = async (equipmentId: any, returned: boolean) => {
        if (!requestIdFromUrl) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await updateAssetReturn(
                requestIdFromUrl,
                {
                    assetId: String(equipmentId),
                    returned,
                    condition: condition || 'good',
                },
                token
            );
            setMessage('Equipment updated.');
            await fetchChecklist(requestIdFromUrl);
        } catch (e: any) {
            setError(e?.message || 'Failed to update equipment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStageUpdate = async (stage: string) => {
        if (!requestIdFromUrl) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await updateOffboardingStage(requestIdFromUrl, stage, token);
            setMessage(`Stage updated to ${stage}.`);
        } catch (e: any) {
            setError(e?.message || 'Failed to update stage');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteStage = async () => {
        if (!requestIdFromUrl) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await completeOffboardingStage(requestIdFromUrl, token);
            setMessage('Current stage marked as complete.');
        } catch (e: any) {
            setError(e?.message || 'Failed to complete stage');
        } finally {
            setIsLoading(false);
        }
    };

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

    const btnStyle: React.CSSProperties = {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--recruitment)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontWeight: 600,
        cursor: 'pointer',
    };

    const stageOptions = [
        { value: 'initiated', label: 'Initial Review' },
        { value: 'documentation', label: 'Documentation' },
        { value: 'exit_interview', label: 'Exit Interview' },
        { value: 'asset_return', label: 'Asset Return' },
        { value: 'clearance', label: 'Clearance' },
        { value: 'final_settlement', label: 'Final Settlement' },
        { value: 'completed', label: 'Completed' },
    ];

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
                    Update Clearance Status
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Mark assets as returned and update offboarding stage
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

            {message ? (
                <div style={{ ...cardStyle, borderColor: '#c3e6cb', backgroundColor: '#d4edda', color: '#155724' }}>{message}</div>
            ) : null}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Working...</div>
            ) : null}

            {!isLoading && requestIdFromUrl ? (
                <>
                    {!error && !checklist ? (
                        <div style={{ ...cardStyle, color: 'var(--text-secondary)' }}>
                            No clearance checklist found for this offboarding request.
                        </div>
                    ) : null}

                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Clearance Checklist</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Department</label>
                                <select value={approvalDepartment} onChange={(e) => setApprovalDepartment(e.target.value)} style={inputStyle}>
                                    <option value="IT">IT</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Facilities">Facilities</option>
                                    <option value="HR">HR</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)} style={inputStyle}>
                                    <option value="pending">pending</option>
                                    <option value="approved">approved</option>
                                    <option value="rejected">rejected</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Comments</label>
                                <input value={approvalComments} onChange={(e) => setApprovalComments(e.target.value)} style={inputStyle} placeholder="Optional" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <button type="button" onClick={handleUpdateApproval} style={btnStyle}>
                                Update Department Approval
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600 }}>
                                <input type="checkbox" checked={cardReturned} onChange={(e) => setCardReturned(e.target.checked)} />
                                Card Returned
                            </label>
                            <button type="button" onClick={handleUpdateCardReturned} style={{ ...btnStyle, backgroundColor: '#0f766e' }}>
                                Save Card Status
                            </button>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Assets</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Received By Person ID</label>
                                <input value={receivedByPersonId} onChange={(e) => setReceivedByPersonId(e.target.value)} style={inputStyle} placeholder="Optional" />
                            </div>
                            <div>
                                <label style={labelStyle}>Condition</label>
                                <input value={condition} onChange={(e) => setCondition(e.target.value)} style={inputStyle} placeholder="good" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                            <button type="button" onClick={handleMarkAllReturned} style={btnStyle}>
                                Mark All Returned
                            </button>
                        </div>

                        {Array.isArray(checklist?.equipmentList) && checklist.equipmentList.length > 0 ? (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {checklist.equipmentList.map((eq: any, idx: number) => (
                                    <div key={idx} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{eq.name || 'Equipment'}</div>
                                            <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                Condition: {eq.condition || 'N/A'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleEquipment(eq.equipmentId, true)}
                                                style={{ ...btnStyle, padding: '0.6rem 1rem', backgroundColor: '#1e7e34' }}
                                            >
                                                Returned
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleEquipment(eq.equipmentId, false)}
                                                style={{ ...btnStyle, padding: '0.6rem 1rem', backgroundColor: '#b91c1c' }}
                                            >
                                                Not Returned
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)' }}>No equipment items found.</div>
                        )}
                    </div>

                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Offboarding Stage</h2>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <select
                                value={stageToSet}
                                onChange={(e) => setStageToSet(e.target.value)}
                                style={{ ...inputStyle, minWidth: '280px', flex: 1 }}
                            >
                                {stageOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <button type="button" onClick={() => handleStageUpdate(stageToSet)} style={btnStyle}>
                                Set Stage
                            </button>
                            <button type="button" onClick={handleCompleteStage} style={{ ...btnStyle, backgroundColor: '#0f766e' }}>
                                Mark Stage Complete
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link
                            href={`/recruitment/offboarding/clearance/view?requestId=${encodeURIComponent(requestIdFromUrl)}`}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'transparent',
                                color: 'var(--recruitment)',
                                border: '2px solid var(--recruitment)',
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                fontWeight: 600,
                                display: 'inline-block',
                            }}
                        >
                            Back to Checklist View
                        </Link>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default function ClearanceUpdatePage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <ClearanceUpdateContent />
        </Suspense>
    );
}
