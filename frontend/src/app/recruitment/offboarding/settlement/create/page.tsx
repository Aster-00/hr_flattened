"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createFinalSettlement, getAllOffboardingRequests } from '../../services';

export default function CreateSettlementPage() {
    const searchParams = useSearchParams();

    // State for IDs (initialized from URL or empty)
    const [selectedReqId, setSelectedReqId] = useState(searchParams?.get('requestId') || '');
    const [selectedEmpId, setSelectedEmpId] = useState(searchParams?.get('employeeId') || '');

    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    const [formData, setFormData] = useState({
        lastWorkingDay: '',
        finalSalaryAmount: '',
        outstandingLeaveBalance: '',
        leaveEncashmentAmount: '',
        bonusAmount: '',
        otherPayments: '',
        deductions: '',
        bankAccountDetails: '',
        processingNotes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch requests if IDs are missing (to populate dropdown)
    useEffect(() => {
        if (!searchParams?.get('requestId')) {
            fetchActiveRequests();
        }
    }, [searchParams]);

    const fetchActiveRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const data = await getAllOffboardingRequests({}, token);
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests');
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleRequestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const reqId = e.target.value;
        if (!reqId) {
            setSelectedReqId('');
            setSelectedEmpId('');
            return;
        }

        const req = requests.find(r => r._id === reqId);
        setSelectedReqId(reqId);

        let empId = '';
        if (req) {
            if (req.employeeId && typeof req.employeeId === 'object') {
                empId = req.employeeId._id || req.employeeId.id;
            } else {
                empId = req.employeeId;
            }
            // Fallback if missing
            if (!empId) empId = `REQ:${req._id}`;
        }
        setSelectedEmpId(empId);
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const calculateTotalSettlement = () => {
        const salary = Number(formData.finalSalaryAmount) || 0;
        const leaveEncashment = Number(formData.leaveEncashmentAmount) || 0;
        const bonus = Number(formData.bonusAmount) || 0;
        const other = Number(formData.otherPayments) || 0;
        const deductions = Number(formData.deductions) || 0;
        return salary + leaveEncashment + bonus + other - deductions;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate IDs
        if (!selectedReqId || !selectedEmpId) {
            setMessage({ type: 'error', text: 'Please select an offboarding request/employee first.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const settlementData = {
                ...formData,
                lastWorkingDay: formData.lastWorkingDay ? new Date(formData.lastWorkingDay) : undefined,
                finalSalaryAmount: formData.finalSalaryAmount ? Number(formData.finalSalaryAmount) : undefined,
                outstandingLeaveBalance: formData.outstandingLeaveBalance ? Number(formData.outstandingLeaveBalance) : undefined,
                leaveEncashmentAmount: formData.leaveEncashmentAmount ? Number(formData.leaveEncashmentAmount) : undefined,
                bonusAmount: formData.bonusAmount ? Number(formData.bonusAmount) : undefined,
                otherPayments: formData.otherPayments ? Number(formData.otherPayments) : undefined,
                deductions: formData.deductions ? Number(formData.deductions) : undefined,
            };
            await createFinalSettlement(selectedReqId, selectedEmpId, settlementData, token);
            setMessage({ type: 'success', text: 'Final settlement created successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create settlement' });
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
                    Create Final Settlement
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Process final payroll and settlement for departing employee
                </p>
            </div>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '2rem' }}>

                    {/* SELECTION DROPDOWN */}
                    {!searchParams?.get('requestId') && (
                        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Select Eligible Employee / Request *</label>
                            <select
                                onChange={handleRequestSelect}
                                value={selectedReqId}
                                style={inputStyle}
                            >
                                <option value="">-- Select Offboarding Request --</option>
                                {requests.map(req => (
                                    <option key={req._id} value={req._id}>
                                        {req.employeeId && typeof req.employeeId === 'object'
                                            ? `${req.employeeId.firstName || 'Employee'} (${req.employeeId.employeeId || 'ID'})`
                                            : `Employee ID: ${req.employeeId || `REQ:${req._id}`}`}
                                        {' - ' + (req.reason || 'Reason N/A')}
                                    </option>
                                ))}
                            </select>
                            {selectedReqId && selectedEmpId && (
                                <p style={{ fontSize: '0.875rem', color: '#155724', marginTop: '0.5rem', fontWeight: '600' }}>
                                    Selected: {selectedEmpId} (Request: {selectedReqId})
                                </p>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--recruitment)' }}>
                            Employment Details
                        </h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="lastWorkingDay" style={labelStyle}>Last Working Day</label>
                            <input type="date" id="lastWorkingDay" name="lastWorkingDay" value={formData.lastWorkingDay} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--recruitment)' }}>
                            Payments
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="finalSalaryAmount" style={labelStyle}>Final Salary Amount</label>
                                <input type="number" id="finalSalaryAmount" name="finalSalaryAmount" step="0.01" value={formData.finalSalaryAmount} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                            </div>
                            <div>
                                <label htmlFor="outstandingLeaveBalance" style={labelStyle}>Outstanding Leave Days</label>
                                <input type="number" id="outstandingLeaveBalance" name="outstandingLeaveBalance" step="0.5" value={formData.outstandingLeaveBalance} onChange={handleChange} style={inputStyle} placeholder="0" />
                            </div>
                            <div>
                                <label htmlFor="leaveEncashmentAmount" style={labelStyle}>Leave Encashment</label>
                                <input type="number" id="leaveEncashmentAmount" name="leaveEncashmentAmount" step="0.01" value={formData.leaveEncashmentAmount} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                            </div>
                            <div>
                                <label htmlFor="bonusAmount" style={labelStyle}>Bonus Amount</label>
                                <input type="number" id="bonusAmount" name="bonusAmount" step="0.01" value={formData.bonusAmount} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                            </div>
                            <div>
                                <label htmlFor="otherPayments" style={labelStyle}>Other Payments</label>
                                <input type="number" id="otherPayments" name="otherPayments" step="0.01" value={formData.otherPayments} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                            </div>
                            <div>
                                <label htmlFor="deductions" style={labelStyle}>Deductions</label>
                                <input type="number" id="deductions" name="deductions" step="0.01" value={formData.deductions} onChange={handleChange} style={inputStyle} placeholder="0.00" />
                            </div>
                        </div>
                    </div>

                    {/* Total Settlement */}
                    <div style={{
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        backgroundColor: 'var(--recruitment)',
                        color: 'white',
                        borderRadius: '0.5rem'
                    }}>
                        <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem', opacity: 0.9 }}>Total Settlement Amount</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${calculateTotalSettlement().toFixed(2)}</div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="bankAccountDetails" style={labelStyle}>Bank Account Details</label>
                        <textarea id="bankAccountDetails" name="bankAccountDetails" value={formData.bankAccountDetails} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Bank name, account number, etc..." />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="processingNotes" style={labelStyle}>Processing Notes</label>
                        <textarea id="processingNotes" name="processingNotes" value={formData.processingNotes} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Internal processing notes..." />
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
                            {isSubmitting ? 'Creating...' : 'Create Settlement'}
                        </button>
                        <Link
                            href="/recruitment/offboarding/settlement/history"
                            style={{
                                padding: '0.75rem 2rem',
                                backgroundColor: 'transparent',
                                color: 'var(--recruitment)',
                                border: '2px solid var(--recruitment)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                display: 'inline-block',
                            }}
                        >
                            View History
                        </Link>
                    </div>
                </div>
            </form>

            {/* Info */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    💰 Settlement Components
                </h3>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                    <li>Final month salary (prorated if applicable)</li>
                    <li>Outstanding leave balance encashment</li>
                    <li>Performance bonuses and incentives</li>
                    <li>Any other pending payments</li>
                    <li>Less: Deductions (loans, advances, etc.)</li>
                </ul>
            </div>
        </div>
    );
}
