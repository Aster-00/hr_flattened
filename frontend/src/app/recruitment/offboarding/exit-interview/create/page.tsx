"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createExitInterview, getAllOffboardingRequests } from '../../services';

function CreateExitInterviewContent() {
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        requestId: '',
        employeeId: '',
        feedback: '',
        overallRating: 5,
        departmentSatisfaction: 5,
        managementFeedback: 5,
        workEnvironmentRating: 5,
        compensationSatisfaction: 5,
        reasonsForLeaving: '',
        suggestionsForImprovement: '',
        interviewerName: '',
        recommendToOthers: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // For ID selection
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    // Split locks to allow manual entry if data is missing
    const [isRequestLocked, setIsRequestLocked] = useState(false);
    const [isEmployeeLocked, setIsEmployeeLocked] = useState(false);

    useEffect(() => {
        const urlRequestId = searchParams?.get('requestId') || '';
        const urlEmployeeId = searchParams?.get('employeeId') || '';

        if (urlRequestId && urlEmployeeId) {
            setFormData(prev => ({
                ...prev,
                requestId: urlRequestId,
                employeeId: urlEmployeeId
            }));
            setIsRequestLocked(true);
            setIsEmployeeLocked(true);
        } else {
            fetchActiveRequests();
            setIsRequestLocked(false);
            setIsEmployeeLocked(false);
        }
    }, [searchParams]);

    const fetchActiveRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const data = await getAllOffboardingRequests({}, token);
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests for selection');
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleRequestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedReqId = e.target.value;
        if (!selectedReqId) {
            setIsRequestLocked(false);
            setIsEmployeeLocked(false);
            return;
        }

        const selectedReq = requests.find(r => r._id === selectedReqId);
        if (selectedReq) {
            let resolvedEmpId = '';

            if (selectedReq.employeeId) {
                if (typeof selectedReq.employeeId === 'object') {
                    resolvedEmpId = selectedReq.employeeId._id || selectedReq.employeeId.id;
                } else {
                    resolvedEmpId = selectedReq.employeeId; // It's a string
                }
            }

            setFormData(prev => ({
                ...prev,
                requestId: selectedReq._id,
                employeeId: resolvedEmpId || `REQ:${selectedReq._id}` // Fallback to RequestID if EmpID missing
            }));

            // Lock Request ID as we definitely have it
            setIsRequestLocked(true);

            // Always lock Employee ID now (using fallback if needed)
            setIsEmployeeLocked(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.requestId || !formData.employeeId) {
            setMessage({ type: 'error', text: 'Request ID and Employee ID are required.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const { requestId, employeeId, ...data } = formData;

            await createExitInterview(requestId, employeeId, data, token);
            setMessage({ type: 'success', text: 'Exit interview submitted successfully!' });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Failed to create exit interview.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/recruitment/offboarding" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Offboarding
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Create Exit Interview
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Conduct exit interview and gather feedback.
                </p>
            </div>

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

            <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '2rem' }}>

                    {/* ID Selection Section */}
                    <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                        {(!searchParams?.get('requestId')) && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="selectRequest" style={{ ...labelStyle, fontSize: '1.1rem', color: 'var(--recruitment)' }}>
                                    Select Offboarding Request <span style={{ color: 'red' }}>*</span>
                                </label>
                                <select
                                    id="selectRequest"
                                    onChange={handleRequestSelect}
                                    value={formData.requestId} // Use requestId to show selected option if it matches
                                    style={inputStyle}
                                >
                                    <option value="">-- Select Employee to Interview --</option>
                                    {isLoadingRequests ? <option>Loading requests...</option> : requests.map(req => (
                                        <option key={req._id} value={req._id}>
                                            {req.employeeId && typeof req.employeeId === 'object'
                                                ? `${req.employeeId.firstName || 'Employee'} ` + // Safe access
                                                `${req.employeeId.lastName || ''} ` +
                                                `(${req.employeeId.employeeId || req.employeeId._id})`
                                                : `Employee ID: ${req.employeeId || `REQ:${req._id}`}`}
                                            {' - ' + (req.reason || 'No Reason')}
                                        </option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Selecting a request will automatically fill and lock the IDs.
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="requestId" style={labelStyle}>Offboarding Request ID</label>
                                <input
                                    type="text"
                                    id="requestId"
                                    name="requestId"
                                    value={formData.requestId}
                                    onChange={handleChange}
                                    readOnly={isRequestLocked}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor: isRequestLocked ? '#e9ecef' : 'var(--bg-secondary)',
                                        cursor: isRequestLocked ? 'not-allowed' : 'text',
                                        color: isRequestLocked ? '#666' : 'var(--text-primary)'
                                    }}
                                    placeholder="Auto-filled or Enter Manually"
                                />
                            </div>
                            <div>
                                <label htmlFor="employeeId" style={labelStyle}>Employee ID</label>
                                <input
                                    type="text"
                                    id="employeeId"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    readOnly={isEmployeeLocked}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor: isEmployeeLocked ? '#e9ecef' : 'var(--bg-secondary)',
                                        cursor: isEmployeeLocked ? 'not-allowed' : 'text',
                                        color: isEmployeeLocked ? '#666' : 'var(--text-primary)'
                                    }}
                                    placeholder={isEmployeeLocked ? "Locked" : "Enter Employee ID Manually"} // Hint
                                />
                            </div>
                        </div>
                    </div>

                    {/* Satisfaction Ratings */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--recruitment)' }}>
                            Satisfaction Ratings (1-10)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="overallRating" style={labelStyle}>Overall Rating</label>
                                <input type="number" id="overallRating" name="overallRating" min="1" max="10" value={formData.overallRating} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="departmentSatisfaction" style={labelStyle}>Department Satisfaction</label>
                                <input type="number" id="departmentSatisfaction" name="departmentSatisfaction" min="1" max="10" value={formData.departmentSatisfaction} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="managementFeedback" style={labelStyle}>Management Feedback</label>
                                <input type="number" id="managementFeedback" name="managementFeedback" min="1" max="10" value={formData.managementFeedback} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="workEnvironmentRating" style={labelStyle}>Work Environment</label>
                                <input type="number" id="workEnvironmentRating" name="workEnvironmentRating" min="1" max="10" value={formData.workEnvironmentRating} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="compensationSatisfaction" style={labelStyle}>Compensation</label>
                                <input type="number" id="compensationSatisfaction" name="compensationSatisfaction" min="1" max="10" value={formData.compensationSatisfaction} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Feedback Text Areas */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="reasonsForLeaving" style={labelStyle}>Reasons for Leaving</label>
                        <textarea id="reasonsForLeaving" name="reasonsForLeaving" value={formData.reasonsForLeaving} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Please describe your reasons for leaving..." />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="suggestionsForImprovement" style={labelStyle}>Suggestions for Improvement</label>
                        <textarea id="suggestionsForImprovement" name="suggestionsForImprovement" value={formData.suggestionsForImprovement} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What could we improve?" />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="feedback" style={labelStyle}>General Feedback</label>
                        <textarea id="feedback" name="feedback" value={formData.feedback} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any other feedback..." />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="interviewerName" style={labelStyle}>Interviewer ID (Optional)</label>
                        <input type="text" id="interviewerName" name="interviewerName" value={formData.interviewerName} onChange={handleChange} style={inputStyle} placeholder="Enter HR/Interviewer MongoDB ID" />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="recommendToOthers"
                                checked={formData.recommendToOthers}
                                onChange={handleChange}
                                style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                Would you recommend this company to others?
                            </span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '0.75rem 2rem',
                                backgroundColor: isSubmitting ? '#cccccc' : 'var(--recruitment)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Exit Interview'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function CreateExitInterviewPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <CreateExitInterviewContent />
        </Suspense>
    );
}
