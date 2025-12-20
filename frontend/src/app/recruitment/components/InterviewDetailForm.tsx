"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../services';
import { InterviewWithDetails, ApplicationWithDetails, Candidate, CriteriaScore, InterviewFeedback } from '../types';
import { jwtDecode } from "jwt-decode";
import '../../../../main-theme.css';

interface AggregatedScore {
    averageScore: number;
    totalFeedbacks: number;
    panelSize: number;
    submissionStatus: {
        submitted: number;
        pending: number;
    };
    results: InterviewFeedback[];
}

interface InterviewDetailFormProps {
    interview: InterviewWithDetails;
    onClose: () => void;
    onUpdate?: () => void;
}

interface PanelMember {
    _id: string;
    employeeNumber: string;
    firstName?: string;
    lastName?: string;
    workEmail?: string;
}

const stages = [
    { value: 'screening', label: 'Screening' },
    { value: 'department_interview', label: 'Department Interview' },
    { value: 'hr_interview', label: 'HR Interview' },
    { value: 'offer', label: 'Offer' }
];

const interviewMethods = [
    { value: 'onsite', label: 'In-Person' },
    { value: 'video', label: 'Video Call' },
    { value: 'phone', label: 'Phone Call' }
];

const interviewStatuses = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
];

const recommendationOptions = [
    { value: 'strongly_recommend', label: 'Strongly Recommend' },
    { value: 'recommend', label: 'Recommend' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'not_recommend', label: 'Do Not Recommend' },
    { value: 'strongly_not_recommend', label: 'Strongly Do Not Recommend' }
];

// Helper to generate a random Mongo-like ObjectId
const generateObjectId = () => {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

export default function InterviewDetailForm({ interview, onClose, onUpdate }: InterviewDetailFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availablePanelMembers, setAvailablePanelMembers] = useState<PanelMember[]>([]);

    // Form state
    const [stage, setStage] = useState(interview.stage || '');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [method, setMethod] = useState(interview.method || 'video');
    const [status, setStatus] = useState(interview.status || 'scheduled');
    const [selectedPanelMembers, setSelectedPanelMembers] = useState<string[]>(
        interview.panel.map(p => p._id)
    );
    const [videoLink, setVideoLink] = useState(interview.videoLink || '');
    const [candidateFeedback, setCandidateFeedback] = useState(interview.candidateFeedback || '');

    // Assessment state
    const [isAssessing, setIsAssessing] = useState(false);
    const [criteriaScores, setCriteriaScores] = useState<CriteriaScore[]>([]);
    const [overallComments, setOverallComments] = useState('');
    const [recommendation, setRecommendation] = useState('');

    // Evaluations state
    const [evaluations, setEvaluations] = useState<InterviewFeedback[]>([]);
    const [aggregatedScore, setAggregatedScore] = useState<AggregatedScore | null>(null);
    const [loadingEvaluations, setLoadingEvaluations] = useState(false);

    // Current user state
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [isPanelMember, setIsPanelMember] = useState(false);
    const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

    // Extract candidate and application info
    const application = interview.applicationId as ApplicationWithDetails;
    const candidate = application?.candidateId as Candidate;
    const jobTitle = application?.requisitionId?.templateId?.title || 'Unknown Position';
    const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Unknown Candidate';

    useEffect(() => {
        // Parse the scheduled date
        if (interview.scheduledDate) {
            const date = new Date(interview.scheduledDate);
            setScheduledDate(date.toISOString().split('T')[0]);
            setScheduledTime(date.toTimeString().slice(0, 5));
        }
        loadPanelMembers();
        loadEvaluations();
        checkCurrentUserStatus();
    }, [interview]);

    const checkCurrentUserStatus = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const userId = decoded.sub || decoded.userId || decoded._id || decoded.id || '';
                setCurrentUserId(userId);
                
                // Check if current user is a panel member
                const isPanel = interview.panel.some(p => p._id === userId);
                setIsPanelMember(isPanel);
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
    };

    const loadEvaluations = async () => {
        try {
            setLoadingEvaluations(true);
            const aggregated = await recruitmentApi.getAggregatedInterviewScore(interview._id);
            setAggregatedScore(aggregated);
            setEvaluations(aggregated.results || []);
            
            // Check if current user has already submitted feedback
            const token = localStorage.getItem('token');
            if (token) {
                const decoded: any = jwtDecode(token);
                const userId = decoded.sub || decoded.userId || decoded._id || decoded.id || '';
                const existingFeedback = aggregated.results?.find(
                    (r: InterviewFeedback) => r.interviewerId?._id === userId
                );
                setHasSubmittedFeedback(!!existingFeedback);
            }
        } catch (err: any) {
            console.error('Error loading evaluations:', err);
        } finally {
            setLoadingEvaluations(false);
        }
    };

    const loadPanelMembers = async () => {
        try {
            const [hrEmployees, hrManagers] = await Promise.all([
                recruitmentApi.getEmployeesByRole('HR Employee'),
                recruitmentApi.getEmployeesByRole('HR Manager')
            ]);
            setAvailablePanelMembers([...hrEmployees, ...hrManagers]);
        } catch (err: any) {
            console.error('Error loading panel members:', err);
        }
    };

    const handleTogglePanelMember = (memberId: string) => {
        setSelectedPanelMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    const handleSave = async () => {
        if (!stage || !scheduledDate || !scheduledTime || selectedPanelMembers.length === 0) {
            setError('Please fill in all required fields');
            return;
        }

        if (method === 'video' && !videoLink) {
            setError('Video link is required for video interviews');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
            const interviewDateTime = new Date(dateTimeString);

            await recruitmentApi.updateInterview(interview._id, {
                stage,
                scheduledDate: interviewDateTime.toISOString(),
                method,
                panel: selectedPanelMembers,
                videoLink: method === 'video' ? videoLink : undefined,
                candidateFeedback: candidateFeedback || undefined
            });

            setIsEditing(false);
            if (onUpdate) {
                onUpdate();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update interview');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this interview? All participants will be notified.')) {
            return;
        }

        try {
            setLoading(true);
            await recruitmentApi.cancelInterview(interview._id);
            if (onUpdate) {
                onUpdate();
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to cancel interview');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCriteria = () => {
        setCriteriaScores([
            ...criteriaScores,
            {
                criteriaId: generateObjectId(),
                criteriaName: '',
                score: 0,
                maxScore: 10,
                comments: ''
            }
        ]);
    };

    const handleRemoveCriteria = (index: number) => {
        const newScores = [...criteriaScores];
        newScores.splice(index, 1);
        setCriteriaScores(newScores);
    };

    const handleCriteriaChange = (index: number, field: keyof CriteriaScore, value: any) => {
        const newScores = [...criteriaScores];
        newScores[index] = { ...newScores[index], [field]: value };
        setCriteriaScores(newScores);
    };

    const handleSubmitAssessment = async () => {
        if (criteriaScores.length === 0) {
            setError('Please add at least one criteria to assess.');
            return;
        }
        if (criteriaScores.some(c => !c.criteriaName || c.score < 0)) {
            setError('Please ensure all criteria have names and valid scores.');
            return;
        }

        // Check if user is a panel member
        if (!isPanelMember) {
            setError('Only panel members assigned to this interview can submit feedback.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Calculate totals - score needs to be 0-100 range for backend
            const totalScore = criteriaScores.reduce((sum, item) => sum + Number(item.score), 0);
            const maxTotalScore = criteriaScores.reduce((sum, item) => sum + Number(item.maxScore || 10), 0);
            const percentageScore = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

            if (!currentUserId) {
                setError('Unable to identify current user. Please log in again.');
                return;
            }

            // Build comments from criteria scores and overall comments
            const criteriaComments = criteriaScores
                .map(c => `${c.criteriaName}: ${c.score}/${c.maxScore || 10}${c.comments ? ` - ${c.comments}` : ''}`)
                .join('\n');
            const fullComments = [
                criteriaComments,
                recommendation ? `Recommendation: ${recommendation}` : '',
                overallComments ? `Overall: ${overallComments}` : ''
            ].filter(Boolean).join('\n\n');

            // Backend expects: interviewerId, score (0-100), comments
            const payload = {
                interviewerId: currentUserId,
                score: percentageScore,
                comments: fullComments
            };

            await recruitmentApi.submitInterviewFeedback(interview._id, payload);

            setIsAssessing(false);
            await loadEvaluations(); // Reload evaluations to show the new one
            if (onUpdate) onUpdate();
            alert('Assessment submitted successfully!');

        } catch (err: any) {
            setError(err.message || 'Failed to submit assessment');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (statusValue: string) => {
        switch (statusValue?.toLowerCase()) {
            case 'scheduled':
                return 'badge badge-info';
            case 'completed':
                return 'badge badge-success';
            case 'cancelled':
                return 'badge badge-error';
            default:
                return 'badge';
        }
    };

    const getMethodLabel = (methodValue: string) => {
        const found = interviewMethods.find(m => m.value === methodValue?.toLowerCase());
        return found?.label || methodValue;
    };

    const getStageLabel = (stageValue: string) => {
        const found = stages.find(s => s.value === stageValue?.toLowerCase());
        return found?.label || stageValue;
    };

    // Styles
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-primary)',
        zIndex: 10,
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
    };

    const closeButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        padding: '0.25rem',
    };

    const contentStyle: React.CSSProperties = {
        padding: '1.5rem',
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '1.5rem',
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-tertiary)',
        marginBottom: '0.75rem',
    };

    const fieldRowStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
    };

    const fieldStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-tertiary)',
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '1rem',
        color: 'var(--text-primary)',
        fontWeight: 500,
    };

    const panelGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.5rem',
    };

    const panelMemberStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--bg-secondary)',
    };

    const avatarStyle: React.CSSProperties = {
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '0.875rem',
        background: 'linear-gradient(135deg, var(--recruitment) 0%, var(--primary-600) 100%)',
        color: 'var(--text-inverse)',
    };

    const footerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-light)',
        gap: '1rem',
        flexWrap: 'wrap',
    };

    const buttonGroupStyle: React.CSSProperties = {
        display: 'flex',
        gap: '0.75rem',
    };

    const panelListStyle: React.CSSProperties = {
        border: '1px solid var(--border-medium)',
        borderRadius: '0.5rem',
        padding: '1rem',
        maxHeight: '12rem',
        overflowY: 'auto',
    };

    const panelItemStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        borderRadius: '0.25rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h2 style={titleStyle}>Interview Details</h2>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {candidateName} - {jobTitle}
                        </p>
                    </div>
                    <button style={closeButtonStyle} onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={contentStyle}>
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Candidate Information */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>Candidate Information</h3>
                        <div style={fieldRowStyle}>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Name</span>
                                <span style={valueStyle}>{candidateName}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Email</span>
                                <span style={valueStyle}>{candidate?.personalEmail || 'N/A'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Phone</span>
                                <span style={valueStyle}>{candidate?.mobilePhone || 'N/A'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Position</span>
                                <span style={valueStyle}>{jobTitle}</span>
                            </div>
                        </div>
                    </div>

                    {/* Interview Information */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>Interview Information</h3>
                        {isEditing ? (
                            <>
                                <div style={fieldRowStyle}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Stage *</label>
                                        <select
                                            value={stage}
                                            onChange={(e) => setStage(e.target.value)}
                                            className="form-input"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <option value="">Select stage</option>
                                            {stages.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Method *</label>
                                        <select
                                            value={method}
                                            onChange={(e) => setMethod(e.target.value)}
                                            className="form-input"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {interviewMethods.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={fieldRowStyle}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Date *</label>
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Time *</label>
                                        <input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                {method === 'video' && (
                                    <div className="form-group">
                                        <label className="form-label">Video Link *</label>
                                        <input
                                            type="url"
                                            value={videoLink}
                                            onChange={(e) => setVideoLink(e.target.value)}
                                            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                            className="form-input"
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Additional Notes for Candidate</label>
                                    <textarea
                                        value={candidateFeedback}
                                        onChange={(e) => setCandidateFeedback(e.target.value)}
                                        placeholder="Any additional information for the candidate..."
                                        rows={3}
                                        className="form-input"
                                    />
                                </div>
                            </>
                        ) : (
                            <div style={fieldRowStyle}>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Stage</span>
                                    <span style={valueStyle}>{getStageLabel(interview.stage)}</span>
                                </div>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Method</span>
                                    <span style={valueStyle}>{getMethodLabel(interview.method)}</span>
                                </div>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Date & Time</span>
                                    <span style={valueStyle}>{formatDateTime(interview.scheduledDate)}</span>
                                </div>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Status</span>
                                    <span className={getStatusBadgeClass(interview.status)}>
                                        {interview.status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Link (View Mode) */}
                    {!isEditing && interview.videoLink && (
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Video Link</h3>
                            <div style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--info-light)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>🔗</span>
                                <a
                                    href={interview.videoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--info-dark)', fontWeight: 500 }}
                                >
                                    {interview.videoLink}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Panel Members */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>Panel Members ({interview.panel.length})</h3>
                        {isEditing ? (
                            <div style={panelListStyle}>
                                {availablePanelMembers.length === 0 ? (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>
                                        Loading panel members...
                                    </p>
                                ) : (
                                    availablePanelMembers.map((member) => {
                                        const displayName = (member.firstName || member.lastName) 
                                            ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                                            : member.employeeNumber || member._id?.slice(-6) || 'Unknown';
                                        return (
                                            <label
                                                key={member._id}
                                                style={panelItemStyle}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPanelMembers.includes(member._id)}
                                                    onChange={() => handleTogglePanelMember(member._id)}
                                                    style={{ accentColor: 'var(--recruitment)', width: '1rem', height: '1rem' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                        {displayName}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        {member.workEmail || member.employeeNumber || 'No contact info'}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })
                                )}
                                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-tertiary)' }}>
                                    {selectedPanelMembers.length} member(s) selected
                                </p>
                            </div>
                        ) : (
                            <div style={panelGridStyle}>
                                {interview.panel.map((member) => {
                                    const displayName = (member.firstName || member.lastName) 
                                        ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                                        : member.employeeNumber || member._id?.slice(-6) || 'Unknown';
                                    const initials = (member.firstName && member.lastName)
                                        ? `${member.firstName[0]}${member.lastName[0]}`
                                        : member.employeeNumber?.slice(0, 2)?.toUpperCase() || 'PM';
                                    return (
                                        <div key={member._id} style={panelMemberStyle}>
                                            <div style={avatarStyle}>
                                                {initials}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {displayName}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    {member.workEmail || member.employeeNumber || 'No contact info'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Candidate Feedback / Notes */}
                    {!isEditing && interview.candidateFeedback && (
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Additional Notes</h3>
                            <div style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--warning-light)',
                                color: 'var(--warning-dark)',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>{interview.candidateFeedback}</p>
                            </div>
                        </div>
                    )}

                    {/* Calendar Event ID */}
                    {interview.createdAt && (
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Metadata</h3>
                            <div style={fieldRowStyle}>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Created At</span>
                                    <span style={{ ...valueStyle, fontSize: '0.875rem' }}>
                                        {formatDateTime(interview.createdAt)}
                                    </span>
                                </div>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Last Updated</span>
                                    <span style={{ ...valueStyle, fontSize: '0.875rem' }}>
                                        {formatDateTime(interview.updatedAt)}
                                    </span>
                                </div>
                                <div style={fieldStyle}>
                                    <span style={labelStyle}>Interview ID</span>
                                    <span style={{ ...valueStyle, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                        {interview._id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Panel Member Status Section */}
                    {!isEditing && !isAssessing && (
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Panel Submission Status</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '0.5rem',
                            }}>
                                {interview.panel.map((member) => {
                                    const memberEvaluations = evaluations.filter(
                                        (e) => e.interviewerId?._id === member._id
                                    );
                                    const evaluationCount = memberEvaluations.length;
                                    const hasSubmitted = evaluationCount > 0;
                                    const isCurrentUser = member._id === currentUserId;
                                    const displayName = (member.firstName || member.lastName) 
                                        ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                                        : member.employeeNumber || member._id?.slice(-6) || 'Unknown';
                                    return (
                                        <div 
                                            key={member._id} 
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                backgroundColor: hasSubmitted ? 'var(--success-light)' : 'var(--bg-secondary)',
                                                border: isCurrentUser ? '2px solid var(--recruitment)' : '1px solid var(--border-light)',
                                            }}
                                        >
                                            <span style={{
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                backgroundColor: hasSubmitted ? 'var(--success)' : 'var(--text-tertiary)',
                                                color: 'white',
                                            }}>
                                                {hasSubmitted ? evaluationCount : '○'}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ 
                                                    fontSize: '0.8125rem', 
                                                    fontWeight: 500, 
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {displayName}
                                                    {isCurrentUser && ' (You)'}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.6875rem', 
                                                    color: hasSubmitted ? 'var(--success-dark)' : 'var(--text-tertiary)' 
                                                }}>
                                                    {hasSubmitted ? `${evaluationCount} evaluation${evaluationCount > 1 ? 's' : ''}` : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Evaluations Section */}
                    {!isEditing && !isAssessing && (
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>
                                Evaluations {aggregatedScore && `(${aggregatedScore.totalFeedbacks} total from ${aggregatedScore.submissionStatus.submitted}/${aggregatedScore.panelSize} panel members)`}
                            </h3>
                            
                            {loadingEvaluations ? (
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading evaluations...</p>
                            ) : evaluations.length === 0 ? (
                                <div style={{
                                    padding: '1.5rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    textAlign: 'center',
                                }}>
                                    <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                        No evaluations have been submitted yet.
                                    </p>
                                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                        {aggregatedScore?.submissionStatus.pending || interview.panel.length} panel member(s) pending
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Aggregated Score Summary */}
                                    {aggregatedScore && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '1rem',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: 'var(--bg-secondary)',
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--recruitment)' }}>
                                                    {aggregatedScore.averageScore.toFixed(1)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                                    Average Score
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {aggregatedScore.totalFeedbacks}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                                    Total Feedbacks
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                                    {aggregatedScore.submissionStatus.submitted}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                                    Submitted
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                                                    {aggregatedScore.submissionStatus.pending}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                                    Pending
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Individual Evaluations */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {evaluations.map((evaluation) => (
                                            <div 
                                                key={evaluation._id} 
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid var(--border-light)',
                                                    backgroundColor: 'var(--bg-primary)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={avatarStyle}>
                                                            {evaluation.interviewerId?.firstName?.[0] || '?'}{evaluation.interviewerId?.lastName?.[0] || ''}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                                                {evaluation.interviewerId?.firstName || 'Unknown'} {evaluation.interviewerId?.lastName || 'Reviewer'}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                                {evaluation.interviewerId?.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        backgroundColor: evaluation.score >= 70 ? 'var(--success-light)' : evaluation.score >= 40 ? 'var(--warning-light)' : 'var(--error-light)',
                                                        color: evaluation.score >= 70 ? 'var(--success-dark)' : evaluation.score >= 40 ? 'var(--warning-dark)' : 'var(--error-dark)',
                                                    }}>
                                                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{evaluation.score}</span>
                                                        <span style={{ fontSize: '0.75rem' }}>%</span>
                                                    </div>
                                                </div>
                                                
                                                {evaluation.comments && (
                                                    <div style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '0.375rem',
                                                        backgroundColor: 'var(--bg-secondary)',
                                                        fontSize: '0.875rem',
                                                        color: 'var(--text-secondary)',
                                                        fontStyle: 'italic',
                                                    }}>
                                                        "{evaluation.comments}"
                                                    </div>
                                                )}
                                                
                                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    Submitted on {formatDateTime(evaluation.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Assessment Section */}
                    {isAssessing && (
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Assessment & Feedback</h3>
                            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={labelStyle}>Evaluation Criteria</label>
                                        <button
                                            onClick={handleAddCriteria}
                                            className="btn-sm btn-secondary"
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            + Add Criteria
                                        </button>
                                    </div>

                                    {criteriaScores.length === 0 && (
                                        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                                            No criteria added. Click "Add Criteria" to start.
                                        </p>
                                    )}

                                    {criteriaScores.map((criteria, index) => (
                                        <div key={index} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 2fr auto',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            alignItems: 'start'
                                        }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <input
                                                    type="text"
                                                    placeholder="Criteria Name (e.g. Technical Skills)"
                                                    value={criteria.criteriaName}
                                                    onChange={(e) => handleCriteriaChange(index, 'criteriaName', e.target.value)}
                                                    className="form-input"
                                                    style={{ fontSize: '0.875rem' }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <input
                                                    type="number"
                                                    placeholder="Score"
                                                    value={criteria.score}
                                                    onChange={(e) => handleCriteriaChange(index, 'score', parseFloat(e.target.value))}
                                                    className="form-input"
                                                    style={{ fontSize: '0.875rem' }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <input
                                                    type="text"
                                                    placeholder="Comments (Optional)"
                                                    value={criteria.comments || ''}
                                                    onChange={(e) => handleCriteriaChange(index, 'comments', e.target.value)}
                                                    className="form-input"
                                                    style={{ fontSize: '0.875rem' }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCriteria(index)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--error)',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Recommendation</label>
                                    <select
                                        value={recommendation}
                                        onChange={(e) => setRecommendation(e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Recommendation</option>
                                        {recommendationOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Overall Comments</label>
                                    <textarea
                                        value={overallComments}
                                        onChange={(e) => setOverallComments(e.target.value)}
                                        placeholder="Summary of the interview..."
                                        rows={3}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={footerStyle}>
                    <div>
                        {interview.status?.toLowerCase() === 'scheduled' && !isEditing && (
                            <button
                                onClick={handleCancel}
                                className="btn-danger"
                                disabled={loading}
                                style={{ cursor: 'pointer' }}
                            >
                                Cancel Interview
                            </button>
                        )}
                    </div>
                    <div style={buttonGroupStyle}>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError(null);
                                        // Reset form to original values
                                        setStage(interview.stage || '');
                                        setMethod(interview.method || 'video');
                                        setVideoLink(interview.videoLink || '');
                                        setCandidateFeedback(interview.candidateFeedback || '');
                                        setSelectedPanelMembers(interview.panel.map(p => p._id));
                                        if (interview.scheduledDate) {
                                            const date = new Date(interview.scheduledDate);
                                            setScheduledDate(date.toISOString().split('T')[0]);
                                            setScheduledTime(date.toTimeString().slice(0, 5));
                                        }
                                    }}
                                    className="btn-secondary"
                                    disabled={loading}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn-primary"
                                    disabled={loading}
                                    style={{ backgroundColor: 'var(--recruitment)', cursor: 'pointer' }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onClose}
                                    className="btn-secondary"
                                    style={{ cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                                {interview.status?.toLowerCase() === 'scheduled' && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-primary"
                                        style={{ backgroundColor: 'var(--recruitment)', cursor: 'pointer' }}
                                    >
                                        Edit Interview
                                    </button>
                                )}
                                {!isAssessing && (interview.status?.toLowerCase() === 'scheduled' || interview.status?.toLowerCase() === 'completed') && (
                                    isPanelMember ? (
                                        <button
                                            onClick={() => {
                                                // Reset form for new evaluation
                                                setCriteriaScores([]);
                                                setOverallComments('');
                                                setRecommendation('');
                                                setIsAssessing(true);
                                            }}
                                            className="btn-primary"
                                            style={{ backgroundColor: 'var(--success)', cursor: 'pointer', marginLeft: '0.5rem' }}
                                        >
                                            {hasSubmittedFeedback ? 'Add Another Evaluation' : 'Evaluate Candidate'}
                                        </button>
                                    ) : (
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'var(--text-tertiary)',
                                            fontStyle: 'italic',
                                            marginLeft: '0.5rem'
                                        }}>
                                            Only panel members can evaluate
                                        </span>
                                    )
                                )}
                            </>
                        )}
                        {isAssessing && (
                            <div style={buttonGroupStyle}>
                                <button
                                    onClick={() => setIsAssessing(false)}
                                    className="btn-secondary"
                                    disabled={loading}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Cancel Assessment
                                </button>
                                <button
                                    onClick={handleSubmitAssessment}
                                    className="btn-primary"
                                    disabled={loading}
                                    style={{ backgroundColor: 'var(--success)', cursor: 'pointer' }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Assessment'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
