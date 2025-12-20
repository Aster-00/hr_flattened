"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {OnApiRecruitment} from './ONservices';
import { CurrentUser } from './ONtypes';

export default function RecruitmentPage() {

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const user: CurrentUser = await OnApiRecruitment.getCurrentUser();
      setCurrentUserId(user.id); // ← use `id` from backend
    } catch (err) {
      console.error('Failed to fetch current user', err);
    }
  };
  fetchCurrentUser();
}, []);


  const modules = [
    {
      title: 'Job Design & Posting',
      description: 'Create job templates, manage postings, and publish to careers page',
      items: [
        { label: 'Job Templates', href: '/recruitment/jobs/templates', description: 'Create and manage job description templates' },
        { label: 'Job Postings', href: '/recruitment/jobs/requisition', description: 'Create and manage job requisitions' },
      ],
    },
    {
      title: 'Candidate Management',
      description: 'Track and manage candidate applications throughout the hiring process',
      items: [
        { label: 'Candidate Pipeline', href: '/recruitment/candidates/pipeline', description: 'Kanban view of candidates by stage' },
        { label: 'Talent Pool', href: '/recruitment/candidates/talent-pool', description: 'Search and manage all candidates' },
        { label: 'Applications', href: '/recruitment/candidates/applications', description: 'View all applications' },
      ],
    },
    {
      title: 'Onboarding tasks',
      description: 'Manage Employyee onboarding tasks',
      items: [
        { label: 'onboarding task creation', href: '/recruitment/task/creation', description: 'Create tasks' },
        { label: 'onboarding task view and verify', href: '/recruitment/task/view', description: 'Create and approve tasks' },
        { label: 'initiation', href: '/recruitment/initiate-HrTask', description: 'Manage onboarding tasks' },]
       },
       {
        title: 'Interviews & Offers',
      description: 'Schedule interviews and manage job offers',
      items: [
        { label: 'Interviews', href: '/recruitment/interviews', description: 'Schedule and manage interviews' },
        { label: 'Offer Management', href: '/recruitment/offers/approvals', description: 'Create and approve offers' },
      ],
    },
    {
      title: 'Analytics & Reports',
      description: 'Track recruitment metrics and generate reports',
      items: [
        { label: 'Dashboard', href: '/recruitment/analytics/dashboard', description: 'Recruitment KPIs and metrics' },
        { label: 'Reports', href: '/recruitment/analytics/reports', description: 'Detailed recruitment reports' },
      ],
    },
    {
      title: 'onboarding Employee tasks',
      description: 'the things need from the employee during the onboarding proccess',
      items: [
        { label: 'upload documents', href: '/recruitment/uploadDoucment', description: 'a paage to download requested documents' },
        { label: 'view tracker', href: `/recruitment/tracker/${currentUserId}`, description: 'see the tasks requested from him' },
      ],
      
    },
    {
      title: 'Offboarding',
      description: 'Employee offboarding and separation management',
      items: [
        { label: 'Offboarding main hub', href: '/recruitment/offboarding', description: 'Go to the offboarding main hub' },
      ],
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
          Recruitment Module
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Comprehensive recruitment and hiring management system
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

      {/* Public Careers Page Link */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: 'var(--recruitment)',
        borderRadius: '0.75rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
          Public Careers Page
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem' }}>
          View your organization's public job board where candidates can browse and apply for positions
        </p>
        <Link
          href="/recruitment/jobs/careers"
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
          Visit Careers Page →
        </Link>
      </div>
    </div>
  );
}

