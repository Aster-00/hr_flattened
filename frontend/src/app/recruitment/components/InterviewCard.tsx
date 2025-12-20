"use client";

import React from 'react';
import { InterviewWithDetails, ApplicationWithDetails, Candidate } from '../types';

interface InterviewCardProps {
    interview: InterviewWithDetails;
    onClick: () => void;
}

export default function InterviewCard({ interview, onClick }: InterviewCardProps) {
    const application = interview.applicationId as ApplicationWithDetails;
    const candidate = application?.candidateId as Candidate;
    const jobTitle = application?.requisitionId?.templateId?.title || 'Unknown Position';
    const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Unknown Candidate';

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
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

    const getMethodIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'video':
                return '📹';
            case 'phone':
                return '📞';
            case 'onsite':
                return '🏢';
            default:
                return '📅';
        }
    };

    // Styles
    const cardStyle: React.CSSProperties = {
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
    };

    const cardContentStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
        flexWrap: 'wrap',
    };

    const mainInfoStyle: React.CSSProperties = {
        flex: 1,
        minWidth: '300px',
    };

    const candidateRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '0.75rem',
    };

    const candidateInfoStyle: React.CSSProperties = {
        flex: 1,
    };

    const candidateHeaderStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.5rem',
        flexWrap: 'wrap',
    };

    const candidateNameStyle: React.CSSProperties = {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
    };

    const jobTitleStyle: React.CSSProperties = {
        margin: 0,
        marginBottom: '0.25rem',
        fontSize: '1rem',
        color: 'var(--text-secondary)',
    };

    const stageStyle: React.CSSProperties = {
        margin: 0,
        fontSize: '0.875rem',
        color: 'var(--text-tertiary)',
    };

    const detailsGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem',
        marginTop: '1rem',
    };

    const detailItemStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
    };

    const videoLinkContainerStyle: React.CSSProperties = {
        marginTop: '0.75rem',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--info-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const videoLinkStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--info-dark)',
        textDecoration: 'none',
    };

    const viewDetailsStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--recruitment)',
        fontWeight: 500,
    };

    return (
        <div
            className="card"
            style={cardStyle}
            onClick={onClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div style={cardContentStyle}>
                {/* Left side - Main info */}
                <div style={mainInfoStyle}>
                    <div style={candidateRowStyle}>
                        <div style={{ fontSize: '2rem' }}>{getMethodIcon(interview.method)}</div>
                        <div style={candidateInfoStyle}>
                            <div style={candidateHeaderStyle}>
                                <h3 style={candidateNameStyle}>{candidateName}</h3>
                                <span className={getStatusBadgeClass(interview.status)}>
                                    {interview.status}
                                </span>
                            </div>
                            <p style={jobTitleStyle}>
                                <span style={{ fontWeight: 500 }}>{jobTitle}</span>
                            </p>
                            <p style={stageStyle}>Stage: {interview.stage}</p>
                        </div>
                    </div>

                    {/* Interview details */}
                    <div style={detailsGridStyle}>
                        <div style={detailItemStyle}>
                            <span>📅</span>
                            <span style={{ fontWeight: 500 }}>{formatDateTime(interview.scheduledDate)}</span>
                        </div>
                        <div style={detailItemStyle}>
                            <span>👥</span>
                            <span>{interview.panel.length} Panel Member{interview.panel.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {interview.videoLink && (
                        <div style={videoLinkContainerStyle} onClick={(e) => e.stopPropagation()}>
                            <span>🔗</span>
                            <a
                                href={interview.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={videoLinkStyle}
                            >
                                Join Video Call
                            </a>
                        </div>
                    )}
                </div>

                {/* Right side - View Details indicator */}
                <div style={viewDetailsStyle}>
                    <span>View Details</span>
                    <span>→</span>
                </div>
            </div>
        </div>
    );
}
