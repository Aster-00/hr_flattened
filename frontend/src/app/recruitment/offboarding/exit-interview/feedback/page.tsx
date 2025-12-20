"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOffboardingRequests } from '../../services';

// Helper to parse exit interview data from comments
const parseExitInterview = (request: any) => {
    if (!request.employeeComments) return null;
    const match = request.employeeComments.match(/\[EXIT_INTERVIEW\]: ({.*})/);
    if (match) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            return null;
        }
    }
    return null;
};

export default function AllExitInterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const requests = await getAllOffboardingRequests({}, token);

            // Filter and map to get interview data
            const validInterviews = requests
                .map((req: any) => {
                    const interviewData = parseExitInterview(req);
                    if (!interviewData) return null;
                    return {
                        ...interviewData,
                        _requestId: req._id,
                        _employee: req.employeeId, // Object or ID
                        _contractId: req.contractId
                    };
                })
                .filter((item: any) => item !== null);

            setInterviews(validInterviews);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return '#28a745';
        if (rating >= 5) return '#ffc107';
        return '#dc3545';
    };

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading interviews...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)' }}>Exit Interviews</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View all submitted exit interview feedback</p>
                </div>
                <Link href="/recruitment/offboarding/exit-interview/create"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--recruitment)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: '600'
                    }}>
                    + New Interview
                </Link>
            </div>

            {interviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No exit interviews found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {interviews.map((item, index) => (
                        <div key={index} style={{
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            alignItems: 'start'
                        }}>
                            {/* Identity Column */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>REQUEST ID</span>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{item._requestId}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>EMPLOYEE</span>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                        {typeof item._employee === 'object' && item._employee
                                            ? `${item._employee.firstName || ''} ${item._employee.lastName || ''}`
                                            : 'Unknown Name'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        ID: {typeof item._employee === 'object' && item._employee ? (item._employee.employeeId || item._employee._id) : item._employee || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Ratings Column */}
                            <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>OVERALL RATING</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getRatingColor(item.overallRating) }}>
                                        {item.overallRating}/10
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div>Env: <strong>{item.workEnvironmentRating}/10</strong></div>
                                    <div>Mgmt: <strong>{item.managementFeedback}/10</strong></div>
                                </div>
                            </div>

                            {/* Feedback Text Column */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>FEEDBACK HIGHLIGHT</span>
                                <p style={{
                                    marginTop: '0.25rem',
                                    color: 'var(--text-secondary)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    "{item.feedback || item.reasonsForLeaving || 'No detailed feedback provided.'}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
