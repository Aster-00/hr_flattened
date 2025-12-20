'use client';

import Link from 'next/link';
import {
    Settings,
    Database,
    Workflow,
    Banknote,
    Receipt,
    ShieldAlert,
    CreditCard,
    FileText,
    GraduationCap,
    PlusCircle,
    ShieldCheck
} from 'lucide-react';

const modules = [
    {
        title: 'Company Settings',
        description: 'General payroll rules, currency, and timezone',
        href: '/payroll-configuration/company-settings',
        icon: Settings,
        color: 'var(--primary-600)',
    },
    {
        title: 'Backup Settings',
        description: 'Configure data backup and retention policies',
        href: '/payroll-configuration/backup-settings',
        icon: Database,
        color: 'var(--primary-600)',
    },
    {
        title: 'Approval Workflow',
        description: 'Manage payroll configuration approvals',
        href: '/payroll-configuration/approval-workflow',
        icon: Workflow,
        color: 'var(--primary-600)',
    },
    {
        title: 'Pay Types',
        description: 'Define basic salary, bonus, and other payment types',
        href: '/payroll-configuration/pay-types',
        icon: CreditCard,
        color: 'var(--primary-600)',
    },
    {
        title: 'Pay Grades',
        description: 'Salary structures and level-based configurations',
        href: '/payroll-configuration/pay-grades',
        icon: GraduationCap,
        color: 'var(--primary-600)',
    },
    {
        title: 'Signing Bonuses',
        description: 'Incentives for new hires and recruitment',
        href: '/payroll-configuration/signing-bonuses',
        icon: PlusCircle,
        color: 'var(--primary-600)',
    },
    {
        title: 'Tax Rules',
        description: 'Tax slabs and withholding configurations',
        href: '/payroll-configuration/tax-rules',
        icon: Receipt,
        color: 'var(--primary-600)',
    },
    {
        title: 'Termination Benefits',
        description: 'Severance pay and final settlement rules',
        href: '/payroll-configuration/termination-benefits',
        icon: ShieldAlert,
        color: 'var(--primary-600)',
    },
    {
        title: 'Allowances',
        description: 'Housing, transport, and other employee perks',
        href: '/payroll-configuration/allowances',
        icon: Banknote,
        color: 'var(--primary-600)',
    },
    {
        title: 'Insurance Brackets',
        description: 'Health and social insurance configurations',
        href: '/payroll-configuration/insurance-brackets',
        icon: ShieldCheck,
        color: 'var(--primary-600)',
    },
    {
        title: 'Payroll Policies',
        description: 'Overtime, leave, and general payroll policies',
        href: '/payroll-configuration/payroll-policies',
        icon: FileText,
        color: 'var(--primary-600)',
    },
];

export default function PayrollConfigurationDashboard() {
    return (
        <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Payroll Configuration
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        Centralized management for all payroll rules, settings, and structures
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {modules.map((module) => (
                        <Link
                            key={module.title}
                            href={module.href}
                            className="card group"
                            style={{
                                display: 'block',
                                textDecoration: 'none',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    backgroundColor: 'var(--primary-50)',
                                    color: 'var(--primary-600)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <module.icon size={24} strokeWidth={2.5} />
                                </div>
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    margin: 0
                                }}>
                                    {module.title}
                                </h2>
                            </div>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                margin: 0
                            }}>
                                {module.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
