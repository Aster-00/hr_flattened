"use client";

import { useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllOffboardingRequests, getOffboardingRequest, getOffboardingProgress } from '../../services';

function RequestDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams?.get('id') || '';

    const [request, setRequest] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    const token = useMemo(() => 'YOUR_AUTH_TOKEN', []);

    useEffect(() => {
        void fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            setRequest(null);
            setProgress(null);
            return;
        }
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const [requestData, progressData] = await Promise.all([
                getOffboardingRequest(id, token),
                getOffboardingProgress(id, token).catch(() => null),
            ]);
            setRequest(requestData);
            setProgress(progressData);
        } catch (error) {
            console.error('Failed to fetch details');
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

    const selectorValue = id || '';

    const formatRequestOption = (req: any) => {
        const empId = req?.employeeId && typeof req.employeeId === 'object'
            ? (req.employeeId.employeeId || req.employeeId._id || 'Unknown')
            : (req?.employeeId || 'Unknown');
        const reason = req?.reason ? String(req.reason) : 'Reason N/A';
        return `${empId} - ${reason} (${req?._id})`;
    };

    if (isLoading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <Link href="/recruitment/offboarding/requests/list" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                ← Back to Requests
            </Link>

            <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Select Offboarding Request</div>
                <select
                    value={selectorValue}
                    onChange={(e) => {
                        const nextId = e.target.value;
                        if (!nextId) return;
                        router.push(`/recruitment/offboarding/requests/details?id=${encodeURIComponent(nextId)}`);
                    }}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                    }}
                >
                    <option value="">-- Select Request --</option>
                    {requests.map((r: any) => (
                        <option key={r._id} value={r._id}>
                            {formatRequestOption(r)}
                        </option>
                    ))}
                </select>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {isLoadingRequests ? 'Loading requests...' : 'Pick a request to view its details.'}
                </div>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '2rem' }}>
                Offboarding Request Details
            </h1>

            {!id ? (
                <div style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Select a request from the dropdown above.
                </div>
            ) : null}

            {id && !request ? (
                <div style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Request not found
                </div>
            ) : null}

            {/* Request Info */}
            {request ? (
                <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Employee</div>
                            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                                {request.employeeId && typeof request.employeeId === 'object'
                                    ? `${request.employeeId.firstName || ''} ${request.employeeId.lastName || ''}`.trim() || 'Employee'
                                    : 'Employee'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</div>
                            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{request.status || 'IN_PROGRESS'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Reason</div>
                            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{request.reason}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Expected Exit</div>
                            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{request.expectedExitDate ? new Date(request.expectedExitDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Progress Tracker */}
            {request && progress && (
                <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--recruitment)' }}>
                        Progress Tracker
                    </h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Current Stage: {progress.currentStage || 'Initial'}
                    </div>
                    <div style={{ marginTop: '1rem', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress.overallProgress ?? 0}%`, height: '100%', backgroundColor: 'var(--recruitment)', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {progress.overallProgress ?? 0}% Complete
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {request ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <Link href={`/recruitment/offboarding/exit-interview/create?requestId=${id}&employeeId=${(request.employeeId && typeof request.employeeId === 'object') ? (request.employeeId._id || request.employeeId.employeeId || '') : (request.employeeId || '')}`} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                        📝 Create Interview
                    </Link>
                    <Link href={`/recruitment/offboarding/exit-interview/view?requestId=${id}`} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                        👀 View Interview
                    </Link>
                    <Link href={`/recruitment/offboarding/assets/tracking?requestId=${id}&employeeId=${(request.employeeId && typeof request.employeeId === 'object') ? (request.employeeId._id || request.employeeId.employeeId || '') : (request.employeeId || '')}`} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                        📦 Manage Assets
                    </Link>
                    <Link href={`/recruitment/offboarding/settlement/create?requestId=${id}&employeeId=${(request.employeeId && typeof request.employeeId === 'object') ? (request.employeeId._id || request.employeeId.employeeId || '') : (request.employeeId || '')}`} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                        💰 Final Settlement
                    </Link>
                    <Link href={`/recruitment/offboarding/clearance/view?requestId=${id}`} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)' }}>
                        ✅ Clearance
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

export default function RequestDetailsPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <RequestDetailsContent />
        </Suspense>
    );
}
