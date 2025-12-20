"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { getOffboardingMetrics, getOffboardingPipeline } from '../services';

export default function OffboardingDashboardPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [pipeline, setPipeline] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const extractStatus = (hrComments: any) => {
        if (!hrComments || typeof hrComments !== 'string') return null;
        const marker = '[STATUS]:';
        const start = hrComments.indexOf(marker);
        if (start === -1) return null;
        const afterMarker = hrComments.slice(start + marker.length).trimStart();
        const nextBlockIdx = afterMarker.search(/\n\s*\[[A-Z_]+\]:/);
        const jsonText = (nextBlockIdx === -1 ? afterMarker : afterMarker.slice(0, nextBlockIdx)).trim();
        if (!jsonText) return null;
        try {
            return JSON.parse(jsonText);
        } catch {
            return null;
        }
    };

    const extractExitInterview = (employeeComments: any) => {
        if (!employeeComments || typeof employeeComments !== 'string') return null;
        const marker = '[EXIT_INTERVIEW]:';
        const start = employeeComments.indexOf(marker);
        if (start === -1) return null;
        const afterMarker = employeeComments.slice(start + marker.length).trimStart();
        const nextBlockIdx = afterMarker.search(/\n\s*\[[A-Z_]+\]:/);
        const jsonText = (nextBlockIdx === -1 ? afterMarker : afterMarker.slice(0, nextBlockIdx)).trim();
        if (!jsonText) return null;
        try {
            return JSON.parse(jsonText);
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const [metricsData, pipelineData] = await Promise.all([
                getOffboardingMetrics(token),
                getOffboardingPipeline(null, token),
            ]);
            setMetrics(metricsData);
            setPipeline(pipelineData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pipelineList = useMemo(() => (Array.isArray(pipeline) ? pipeline : []), [pipeline]);

    const stageCounts = useMemo(() => {
        const counts: Record<string, number> = {
            Initial: 0,
            Documentation: 0,
            'Exit Interview': 0,
            'Asset Collection': 0,
            Clearance: 0,
            'Final Settlement': 0,
            Completed: 0,
        };

        const normalizeStage = (stageRaw: any) => {
            const s = String(stageRaw || '').toLowerCase();
            if (!s) return 'Initial';
            if (s.includes('complete')) return 'Completed';
            if (s.includes('settlement') || s.includes('pay')) return 'Final Settlement';
            if (s.includes('clear')) return 'Clearance';
            if (s.includes('asset')) return 'Asset Collection';
            if (s.includes('exit') || s.includes('interview')) return 'Exit Interview';
            if (s.includes('doc')) return 'Documentation';
            if (s.includes('init') || s.includes('start') || s.includes('create')) return 'Initial';
            return 'Initial';
        };

        pipelineList.forEach((r: any) => {
            const st = extractStatus(r?.hrComments);
            const normalized = normalizeStage(st?.currentStage);
            counts[normalized] = (counts[normalized] || 0) + 1;
        });

        return counts;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pipelineList]);

    const pendingExitInterviews = useMemo(() => {
        const normalizeStageKey = (v: any) => String(v || '')
            .toLowerCase()
            .trim()
            .replace(/[\s-]+/g, '_');

        return pipelineList.filter((r: any) => {
            const ei = extractExitInterview(r?.employeeComments);
            if (ei && ei.isCompleted) return false;

            const st = extractStatus(r?.hrComments);
            const completedStages = Array.isArray(st?.completedStages) ? st.completedStages : [];
            const completedSet = new Set(completedStages.map((s: any) => normalizeStageKey(s)));
            const stageCompleted = ['exit_interview', 'exit interview', 'exit_interview_completed']
                .some((k) => completedSet.has(normalizeStageKey(k)));

            return !stageCompleted;
        }).length;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pipelineList]);

    const cardStyle = {
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
    };

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
                    Offboarding Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Monitor offboarding metrics and pipeline
                </p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading dashboard...
                </div>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={cardStyle}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Total Offboarding Requests
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--recruitment)' }}>
                                {metrics?.total ?? 0}
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Active Processes
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffa500' }}>
                                {metrics?.inProgress ?? ((metrics?.total ?? 0) - (metrics?.completed ?? 0))}
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Completed
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {metrics?.completed ?? 0}
                            </div>
                        </div>

                        <div style={cardStyle}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Pending Exit Interviews
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                {pendingExitInterviews}
                            </div>
                        </div>
                    </div>

                    {/* Pipeline Stages */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--recruitment)' }}>
                            Offboarding Pipeline
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {[
                                { stage: 'Initial', label: 'Initial Review', color: '#6c757d' },
                                { stage: 'Documentation', label: 'Documentation', color: '#007bff' },
                                { stage: 'Exit Interview', label: 'Exit Interview', color: '#17a2b8' },
                                { stage: 'Asset Collection', label: 'Asset Return', color: '#ffc107' },
                                { stage: 'Clearance', label: 'Clearance', color: '#fd7e14' },
                                { stage: 'Final Settlement', label: 'Settlement', color: '#28a745' },
                                { stage: 'Completed', label: 'Completed', color: '#20c997' },
                            ].map((item) => {
                                const stageCount = stageCounts?.[item.stage] || 0;
                                return (
                                    <div
                                        key={item.stage}
                                        style={{
                                            padding: '1.5rem',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '0.5rem',
                                            borderLeft: `4px solid ${item.color}`,
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: item.color, marginBottom: '0.25rem' }}>
                                            {stageCount}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {item.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        <Link
                            href="/recruitment/offboarding/requests/list"
                            style={{
                                ...cardStyle,
                                textDecoration: 'none',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                                📋 View All Requests
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Manage all offboarding requests
                            </p>
                        </Link>

                        <Link
                            href="/recruitment/offboarding/requests/create"
                            style={{
                                ...cardStyle,
                                textDecoration: 'none',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                                ➕ New Request
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Create new offboarding request
                            </p>
                        </Link>

                        <Link
                            href="/recruitment/offboarding/exit-interview/list"
                            style={{
                                ...cardStyle,
                                textDecoration: 'none',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                                💬 Exit Interviews
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                View and schedule exit interviews
                            </p>
                        </Link>

                        <Link
                            href="/recruitment/offboarding/pipeline"
                            style={{
                                ...cardStyle,
                                textDecoration: 'none',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                                🔄 Pipeline View
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Track offboarding progress
                            </p>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div style={{ ...cardStyle, marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--recruitment)' }}>
                            Recent Activity
                        </h2>
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            Activity feed will appear here when connected to the backend
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
