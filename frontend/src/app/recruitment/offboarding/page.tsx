"use client";

import Link from 'next/link';

export default function OffboardingPage() {
    const modules = [
        {
            title: 'Offboarding Requests',
            description: 'Create and manage employee offboarding requests',
            items: [
                { label: 'Create Request', href: '/recruitment/offboarding/requests/create', description: 'Initiate new offboarding process' },
                { label: 'All Requests', href: '/recruitment/offboarding/requests/list', description: 'View and manage all offboarding requests' },
                { label: 'Request Details', href: '/recruitment/offboarding/requests/details', description: 'View detailed offboarding request information' },
            ],
        },
        {
            title: 'Exit Interviews',
            description: 'Conduct and manage exit interviews with departing employees',
            items: [
                { label: 'Schedule Interview', href: '/recruitment/offboarding/exit-interview/create', description: 'Schedule and conduct exit interviews' },
                { label: 'View Interviews', href: '/recruitment/offboarding/exit-interview/list', description: 'View all exit interview records' },
                { label: 'Interview Feedback', href: '/recruitment/offboarding/exit-interview/feedback', description: 'Review exit interview feedback' },
            ],
        },
        {
            title: 'Asset Management',
            description: 'Track and manage company asset returns',
            items: [
                { label: 'Asset Tracking', href: '/recruitment/offboarding/assets/tracking', description: 'Track employee assets for return' },
                { label: 'Mark as Returned', href: '/recruitment/offboarding/assets/return', description: 'Record returned assets' },
                { label: 'Asset Report', href: '/recruitment/offboarding/assets/report', description: 'Generate asset return reports' },
            ],
        },
        {
            title: 'Final Settlement',
            description: 'Process final settlements and payroll',
            items: [
                { label: 'Create Settlement', href: '/recruitment/offboarding/settlement/create', description: 'Calculate final settlement amounts' },
                { label: 'Process Payment', href: '/recruitment/offboarding/settlement/process', description: 'Process final settlements' },
                { label: 'Settlement History', href: '/recruitment/offboarding/settlement/history', description: 'View settlement history' },
            ],
        },
        {
            title: 'Clearance Checklist',
            description: 'Manage departmental clearance and documentation',
            items: [
                { label: 'View Checklist', href: '/recruitment/offboarding/clearance/view', description: 'View clearance checklist items' },
                { label: 'Update Status', href: '/recruitment/offboarding/clearance/update', description: 'Update clearance status' },
            ],
        },
        {
            title: 'Offboarding Pipeline',
            description: 'Track offboarding progress and metrics',
            items: [
                { label: 'Dashboard', href: '/recruitment/offboarding/dashboard', description: 'View offboarding metrics and KPIs' },
                { label: 'Pipeline View', href: '/recruitment/offboarding/pipeline', description: 'Track offboarding stages' },
                { label: 'Progress Tracker', href: '/recruitment/offboarding/progress', description: 'Monitor individual progress' },
            ],
        },
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Offboarding Management
                </h1>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                    Comprehensive employee offboarding and separation management system
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {modules.map((module) => (
                    <div
                        key={module.title}
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                    >
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--recruitment)' }}>
                            {module.title}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {module.description}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {module.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: 'block',
                                        padding: '1rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '0.5rem',
                                        textDecoration: 'none',
                                        transition: 'background-color 0.2s',
                                        border: '1px solid transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-selected)';
                                        e.currentTarget.style.borderColor = 'var(--recruitment)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        {item.description}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Banner */}
            <div style={{
                marginTop: '3rem',
                padding: '2rem',
                backgroundColor: 'var(--recruitment)',
                borderRadius: '0.75rem',
                textAlign: 'center',
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                    Quick Actions
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem' }}>
                    Access frequently used offboarding features
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        href="/recruitment/offboarding/requests/create"
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 2rem',
                            backgroundColor: 'white',
                            color: 'var(--recruitment)',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        New Offboarding Request
                    </Link>
                    <Link
                        href="/recruitment/offboarding/dashboard"
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 2rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'transform 0.2s',
                            border: '2px solid white',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        View Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
