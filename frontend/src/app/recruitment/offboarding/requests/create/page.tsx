"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createOffboardingRequest } from '../../services';

export default function CreateOffboardingRequestPage() {
    const [formData, setFormData] = useState({
        employeeId: '',
        contractId: '',
        reason: '',
        employeeComments: '',
        hrComments: '',
        expectedExitDate: '',
        actualExitDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // Note: In production, get token from auth context/session
            const token = 'YOUR_AUTH_TOKEN';

            // Clean payload: Remove empty fields to avoid backend CastErrors
            const payload: any = {
                ...formData,
                initiator: 'hr' // Required by backend schema (lowercase)
            };

            // Remove empty strings which cause Mongoose CastError (Date / ObjectId)
            if (!payload.contractId) delete payload.contractId;
            if (!payload.actualExitDate) delete payload.actualExitDate;
            if (!payload.expectedExitDate) delete payload.expectedExitDate;
            if (!payload.employeeComments) delete payload.employeeComments;
            if (!payload.hrComments) delete payload.hrComments;

            await createOffboardingRequest(payload, token);
            setMessage({ type: 'success', text: 'Offboarding request created successfully!' });

            // Reset form
            setFormData({
                employeeId: '',
                contractId: '',
                reason: '',
                employeeComments: '',
                hrComments: '',
                expectedExitDate: '',
                actualExitDate: '',
            });
        } catch (error: any) {
            console.error('Create Error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to create offboarding request details' });
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
                    Create Offboarding Request
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Initiate the offboarding process for an employee
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="employeeId" style={labelStyle}>
                            Employee ID <span style={{ color: '#ff0000' }}>*</span>
                        </label>
                        <input
                            type="text"
                            id="employeeId"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                            placeholder="Enter employee ID"
                            style={inputStyle}
                        />
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Enter the employee's ID number
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="reason" style={labelStyle}>
                            Reason for Offboarding <span style={{ color: '#ff0000' }}>*</span>
                        </label>
                        <select
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        >
                            <option value="">Select a reason</option>
                            <option value="RESIGNATION">Resignation</option>
                            <option value="TERMINATION">Termination</option>
                            <option value="RETIREMENT">Retirement</option>
                            <option value="CONTRACT_END">Contract End</option>
                            <option value="MUTUAL_AGREEMENT">Mutual Agreement</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="expectedExitDate" style={labelStyle}>
                            Expected Exit Date <span style={{ color: '#ff0000' }}>*</span>
                        </label>
                        <input
                            type="date"
                            id="expectedExitDate"
                            name="expectedExitDate"
                            value={formData.expectedExitDate}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="actualExitDate" style={labelStyle}>
                            Actual Exit Date (Optional)
                        </label>
                        <input
                            type="date"
                            id="actualExitDate"
                            name="actualExitDate"
                            value={formData.actualExitDate}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="employeeComments" style={labelStyle}>
                            Employee Comments (Optional)
                        </label>
                        <textarea
                            id="employeeComments"
                            name="employeeComments"
                            value={formData.employeeComments}
                            onChange={handleChange}
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            placeholder="Any comments from the employee..."
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="hrComments" style={labelStyle}>
                            HR Comments (Optional)
                        </label>
                        <textarea
                            id="hrComments"
                            name="hrComments"
                            value={formData.hrComments}
                            onChange={handleChange}
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            placeholder="Internal HR notes..."
                        />
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
                                transition: 'background-color 0.2s',
                            }}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Offboarding Request'}
                        </button>
                        <Link
                            href="/recruitment/offboarding/requests/list"
                            style={{
                                padding: '0.75rem 2rem',
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                fontWeight: '600',
                                textAlign: 'center',
                            }}
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
