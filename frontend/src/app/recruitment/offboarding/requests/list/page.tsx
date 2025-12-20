"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOffboardingRequests, deleteOffboardingRequest } from '../../services';

export default function OffboardingRequestsList() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            // Note: In production, get token from auth context/session
            const token = 'YOUR_AUTH_TOKEN';
            const data = await getAllOffboardingRequests({}, token);
            setRequests(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch offboarding requests' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offboarding request?')) return;

        try {
            const token = 'YOUR_AUTH_TOKEN';
            await deleteOffboardingRequest(id, token);
            setMessage({ type: 'success', text: 'Request deleted successfully' });
            fetchRequests();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete request' });
        }
    };

    const filteredRequests = requests.filter((req: any) => {
        const q = filter.toLowerCase();
        const employeeStr = req.employeeId && typeof req.employeeId === 'object'
            ? `${req.employeeId.firstName || ''} ${req.employeeId.lastName || ''} ${req.employeeId.employeeId || ''} ${req.employeeId._id || ''}`.toLowerCase()
            : String(req.employeeId || '').toLowerCase();
        const reasonStr = String(req.reason || '').toLowerCase();
        const statusStr = String(req.status || '').toLowerCase();
        const requestIdStr = String(req._id || '').toLowerCase();
        return employeeStr.includes(q) || reasonStr.includes(q) || statusStr.includes(q) || requestIdStr.includes(q);
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
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
                    All Offboarding Requests
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    View and manage all employee offboarding requests
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                }}>
                    {message.text}
                </div>
            )}

            {/* Actions Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                gap: '1rem',
                flexWrap: 'wrap',
            }}>
                <input
                    type="text"
                    placeholder="Search by employee ID, reason, or status..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: '300px',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                    }}
                />
                <Link
                    href="/recruitment/offboarding/requests/create"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--recruitment)',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                    }}
                >
                    + New Request
                </Link>
            </div>

            {/* Requests List */}
            {isLoading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-secondary)',
                }}>
                    Loading requests...
                </div>
            ) : filteredRequests.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-secondary)',
                }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No offboarding requests found</h3>
                    <p>Create a new offboarding request to get started.</p>
                    <Link
                        href="/recruitment/offboarding/requests/create"
                        style={{
                            display: 'inline-block',
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--recruitment)',
                            color: 'white',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontWeight: '600',
                        }}
                    >
                        Create First Request
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredRequests.map((request: any) => (
                        <div
                            key={request._id}
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                transition: 'box-shadow 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        {/* Show Employee Name */}
                                        {request.employeeId && typeof request.employeeId === 'object'
                                            ? `${request.employeeId.firstName || ''} ${request.employeeId.lastName || ''}`.trim() || 'Employee'
                                            : 'Employee'}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <span>Reason: {request.reason}</span>
                                        <span>Status: {request.status || 'Pending'}</span>
                                        <span>Stage: {request.currentStage || 'Initial'}</span>
                                        <span>Request ID: {request._id}</span>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    backgroundColor: request.status === 'COMPLETED' ? '#d4edda' : '#fff3cd',
                                    color: request.status === 'COMPLETED' ? '#155724' : '#856404',
                                }}>
                                    {request.status || 'IN_PROGRESS'}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Expected Exit Date</div>
                                    <div style={{ fontWeight: '500' }}>{request.expectedExitDate ? new Date(request.expectedExitDate).toLocaleDateString() : 'N/A'}</div>
                                </div>
                                {request.actualExitDate && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Actual Exit Date</div>
                                        <div style={{ fontWeight: '500' }}>{new Date(request.actualExitDate).toLocaleDateString()}</div>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Created</div>
                                    <div style={{ fontWeight: '500' }}>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</div>
                                </div>
                            </div>

                            {(request.employeeComments || request.hrComments) && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                    {request.employeeComments && (
                                        <div style={{ marginBottom: request.hrComments ? '0.75rem' : '0' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Employee Comments:</div>
                                            <div style={{ fontSize: '0.875rem' }}>{request.employeeComments}</div>
                                        </div>
                                    )}
                                    {request.hrComments && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>HR Comments:</div>
                                            <div style={{ fontSize: '0.875rem' }}>{request.hrComments}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <Link
                                    href={`/recruitment/offboarding/requests/details?id=${request._id}`}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--recruitment)',
                                        color: 'white',
                                        borderRadius: '0.375rem',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    View Details
                                </Link>
                                <Link
                                    href={`/recruitment/offboarding/exit-interview/create?requestId=${request._id}&employeeId=${(request.employeeId && typeof request.employeeId === 'object') ? (request.employeeId._id || request.employeeId) : (request.employeeId || '')}`}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.375rem',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    Exit Interview
                                </Link>
                                <Link
                                    href={`/recruitment/offboarding/assets/tracking?requestId=${request._id}`}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.375rem',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    Assets
                                </Link>
                                <Link
                                    href={`/recruitment/offboarding/settlement/create?requestId=${request._id}`}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.375rem',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                    }}
                                >
                                    Settlement
                                </Link>
                                <button
                                    onClick={() => handleDelete(request._id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'transparent',
                                        color: '#dc3545',
                                        border: '1px solid #dc3545',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}
