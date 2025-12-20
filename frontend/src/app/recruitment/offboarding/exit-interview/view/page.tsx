"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getExitInterviewByOffboarding } from '../../services';

export default function ViewExitInterviewPage() {
    const searchParams = useSearchParams();
    const requestId = searchParams?.get('requestId');

    const [interview, setInterview] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (requestId) {
            fetchInterview();
        } else {
            setIsLoading(false);
            setError('No Request ID provided');
        }
    }, [requestId]);

    const fetchInterview = async () => {
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const data = await getExitInterviewByOffboarding(requestId!, token);
            setInterview(data);
        } catch (err) {
            console.error(err);
            // If 404, it means no interview exists
            setError('No exit interview found for this request.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    if (error || !interview) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
                <Link href={`/recruitment/offboarding/exit-interview/create?requestId=${requestId}`}
                    style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--recruitment)' }}>
                    Create Exit Interview
                </Link>
                <br />
                <Link href="/recruitment/offboarding/requests/list" style={{ display: 'inline-block', marginTop: '1rem' }}>
                    Back to List
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link href={`/recruitment/offboarding/requests/details?id=${requestId}`} style={{ color: 'var(--recruitment)', textDecoration: 'none', marginBottom: '1rem', display: 'block' }}>
                ← Back to Request Details
            </Link>

            <h1 style={{ marginBottom: '1.5rem' }}>Exit Interview Feedback</h1>

            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '1.5rem', display: 'grid', gap: '1rem' }}>
                    <div><strong>Overall Rating:</strong> {interview.overallRating}/10</div>
                    <div><strong>Department Satisfaction:</strong> {interview.departmentSatisfaction}/10</div>
                    <div><strong>Management Feedback:</strong> {interview.managementFeedback}/10</div>
                    <div><strong>Work Environment:</strong> {interview.workEnvironmentRating}/10</div>
                    <div><strong>Compensation:</strong> {interview.compensationSatisfaction}/10</div>
                </div>

                <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

                <div style={{ marginBottom: '1.5rem' }}>
                    <strong>Reasons for Leaving:</strong>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{interview.reasonsForLeaving}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <strong>Suggestions for Improvement:</strong>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{interview.suggestionsForImprovement}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <strong>General Feedback:</strong>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{interview.feedback}</p>
                </div>
            </div>
        </div>
    );
}
