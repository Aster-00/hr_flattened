"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../services';
import { InterviewWithDetails, ApplicationWithDetails, Candidate } from '../types';
import CandidateProfile from '../components/CandidateProfile';
import InterviewCard from '../components/InterviewCard';
import InterviewDetailForm from '../components/InterviewDetailForm';
import { jwtDecode } from 'jwt-decode';
import '../../../../main-theme.css';

export default function InterviewsPage() {
    const [interviews, setInterviews] = useState<InterviewWithDetails[]>([]);
    const [filteredInterviews, setFilteredInterviews] = useState<InterviewWithDetails[]>([]);
    const [pendingFeedbackInterviews, setPendingFeedbackInterviews] = useState<InterviewWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Current user state
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // View mode: 'all' or 'pending'
    const [viewMode, setViewMode] = useState<'all' | 'pending'>('all');

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'candidate' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Side Panel State
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

    // Interview Detail Modal State
    const [selectedInterview, setSelectedInterview] = useState<InterviewWithDetails | null>(null);
    const [showInterviewDetail, setShowInterviewDetail] = useState(false);

    useEffect(() => {
        // Get current user ID from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const userId = decoded.sub || decoded.userId || decoded._id || decoded.id || '';
                setCurrentUserId(userId);
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
        loadInterviews();
    }, []);

    useEffect(() => {
        if (currentUserId) {
            loadPendingFeedbackInterviews();
        }
    }, [currentUserId]);

    useEffect(() => {
        filterAndSortInterviews();
    }, [interviews, searchQuery, statusFilter, sortBy, sortOrder, viewMode, pendingFeedbackInterviews]);

    const loadInterviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await recruitmentApi.getAllInterviews();
            setInterviews(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load interviews');
            console.error('Error loading interviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPendingFeedbackInterviews = async () => {
        if (!currentUserId) return;
        try {
            const data = await recruitmentApi.getInterviewerPendingFeedback(currentUserId);
            setPendingFeedbackInterviews(data);
        } catch (err: any) {
            console.error('Error loading pending feedback interviews:', err);
        }
    };

    const filterAndSortInterviews = () => {
        // Start with the appropriate list based on view mode
        let filtered = viewMode === 'pending' ? [...pendingFeedbackInterviews] : [...interviews];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((interview) => {
                const application = interview.applicationId as ApplicationWithDetails;
                const candidate = application?.candidateId as Candidate;
                const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.toLowerCase();
                const jobTitle = application?.requisitionId?.templateId?.title?.toLowerCase() || '';
                const stage = interview.stage?.toLowerCase() || '';

                return candidateName.includes(query) || jobTitle.includes(query) || stage.includes(query);
            });
        }

        // Apply status filter (only for 'all' view)
        if (viewMode === 'all' && statusFilter !== 'all') {
            filtered = filtered.filter((interview) =>
                interview.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'date') {
                comparison = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
            } else if (sortBy === 'candidate') {
                const appA = a.applicationId as ApplicationWithDetails;
                const appB = b.applicationId as ApplicationWithDetails;
                const candidateA = appA?.candidateId as Candidate;
                const candidateB = appB?.candidateId as Candidate;
                const nameA = `${candidateA?.firstName || ''} ${candidateA?.lastName || ''}`;
                const nameB = `${candidateB?.firstName || ''} ${candidateB?.lastName || ''}`;
                comparison = nameA.localeCompare(nameB);
            } else if (sortBy === 'status') {
                comparison = (a.status || '').localeCompare(b.status || '');
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredInterviews(filtered);
    };

    // Styles
    const pageStyle: React.CSSProperties = {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '2rem',
        fontWeight: 600,
        color: 'var(--recruitment)',
        margin: 0,
    };

    const subtitleStyle: React.CSSProperties = {
        color: 'var(--text-secondary)',
        marginTop: '0.5rem',
        margin: 0,
    };

    const filtersContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
    };

    const formGroupStyle: React.CSSProperties = {
        flex: 1,
        minWidth: '200px',
        marginBottom: 0,
    };

    const sortContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '0.5rem',
    };

    const resultsCountStyle: React.CSSProperties = {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-light)',
    };

    const emptyStateStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '4rem 2rem',
        border: '2px dashed var(--border-medium)',
        borderRadius: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
    };

    const interviewsListStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1 style={titleStyle}>Interview Management</h1>
                <div className="text-secondary" style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading interviews...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={pageStyle}>
                <h1 style={titleStyle}>Interview Management</h1>
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>Interview Management</h1>
                    <p style={subtitleStyle}>View and manage all scheduled interviews</p>
                </div>
                <button className="btn-primary" onClick={() => { loadInterviews(); loadPendingFeedbackInterviews(); }} style={{ cursor: 'pointer' }}>
                    Refresh
                </button>
            </div>

            {/* View Mode Tabs - REC-011 */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1rem',
                borderBottom: '2px solid var(--border-light)',
                paddingBottom: '0.5rem'
            }}>
                <button
                    onClick={() => setViewMode('all')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        border: 'none',
                        background: viewMode === 'all' ? 'var(--recruitment)' : 'var(--bg-secondary)',
                        color: viewMode === 'all' ? 'white' : 'var(--text-primary)',
                        borderRadius: '0.5rem 0.5rem 0 0',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                    }}
                >
                    All Interviews ({interviews.length})
                </button>
                <button
                    onClick={() => setViewMode('pending')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        border: 'none',
                        background: viewMode === 'pending' ? 'var(--warning)' : 'var(--bg-secondary)',
                        color: viewMode === 'pending' ? 'white' : 'var(--text-primary)',
                        borderRadius: '0.5rem 0.5rem 0 0',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <span>My Pending Evaluations</span>
                    {pendingFeedbackInterviews.length > 0 && (
                        <span style={{
                            background: viewMode === 'pending' ? 'rgba(255,255,255,0.3)' : 'var(--warning)',
                            color: viewMode === 'pending' ? 'white' : 'white',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}>
                            {pendingFeedbackInterviews.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Pending Evaluations Banner */}
            {viewMode === 'pending' && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--warning-light)',
                    border: '1px solid var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                    <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--warning-dark)' }}>
                            Pending Interview Evaluations
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            These are interviews where you are a panel member and haven't submitted feedback yet.
                            Click on an interview to provide your evaluation.
                        </p>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={filtersContainerStyle}>
                    {/* Search */}
                    <div className="form-group" style={formGroupStyle}>
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by candidate, job, or stage..."
                            className="form-input"
                        />
                    </div>

                    {/* Status Filter - only show for 'all' view */}
                    {viewMode === 'all' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="form-input"
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {/* Sort By */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Sort By</label>
                        <div style={sortContainerStyle}>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'candidate' | 'status')}
                                className="form-input"
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="date">Date</option>
                                <option value="candidate">Candidate</option>
                                <option value="status">Status</option>
                            </select>
                            <button
                                className="btn-secondary"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                style={{ cursor: 'pointer', padding: '0.625rem 0.75rem' }}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div style={resultsCountStyle}>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0 }}>
                        Showing <strong>{filteredInterviews.length}</strong> of <strong>{viewMode === 'pending' ? pendingFeedbackInterviews.length : interviews.length}</strong> interviews
                        {viewMode === 'pending' && ' awaiting your feedback'}
                    </p>
                </div>
            </div>

            {/* Interviews List */}
            {filteredInterviews.length === 0 ? (
                <div style={emptyStateStyle}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{viewMode === 'pending' ? '✅' : '📅'}</div>
                    <p className="text-secondary" style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                        {viewMode === 'pending' ? 'All caught up!' : 'No interviews found'}
                    </p>
                    <p className="text-tertiary" style={{ fontSize: '0.875rem' }}>
                        {viewMode === 'pending'
                            ? 'You have no pending interview evaluations at this time.'
                            : (searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No interviews have been scheduled yet')}
                    </p>
                </div>
            ) : (
                <div style={interviewsListStyle}>
                    {filteredInterviews.map((interview) => (
                        <InterviewCard
                            key={interview._id}
                            interview={interview}
                            onClick={() => {
                                setSelectedInterview(interview);
                                setShowInterviewDetail(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Interview Detail Modal */}
            {showInterviewDetail && selectedInterview && (
                <InterviewDetailForm
                    interview={selectedInterview}
                    onClose={() => {
                        setShowInterviewDetail(false);
                        setSelectedInterview(null);
                    }}
                    onUpdate={() => {
                        loadInterviews();
                    }}
                />
            )}
            {/* Side Panel for Candidate Profile */}
            {showSidePanel && selectedApplicationId && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        width: "50%",
                        height: "100vh",
                        backgroundColor: "var(--bg-primary)",
                        boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)",
                        zIndex: 1000,
                        overflow: "auto",
                    }}
                >
                    <div style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "var(--bg-primary)",
                        borderBottom: "1px solid var(--border-color)",
                        padding: "1rem 1.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 10,
                    }}>
                        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
                            Candidate Profile
                        </h2>
                        <button
                            onClick={() => {
                                setShowSidePanel(false);
                                setSelectedApplicationId(null);
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ padding: "0" }}>
                        <CandidateProfile
                            applicationId={selectedApplicationId}
                            onStageUpdate={() => {
                                loadInterviews();
                                // Optional: Keep panel open or close it? usually keep open to see changes.
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Backdrop overlay when side panel is open */}
            {showSidePanel && (
                <div
                    onClick={() => {
                        setShowSidePanel(false);
                        setSelectedApplicationId(null);
                    }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "50%",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        zIndex: 999,
                    }}
                />
            )}
        </div>
    );
}
