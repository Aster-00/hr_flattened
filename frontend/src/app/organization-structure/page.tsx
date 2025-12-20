"use client";

import Link from "next/link";

export default function OrganizationPage() {
  const modules = [
    {
      title: "Organization Hierarchy",
      description: "View and explore the organizational structure",
      items: [
        { label: "View Hierarchy", href: "/organization-structure/hierarchy", description: "Explore the complete organizational hierarchy and team structure" },
      ],
    },
    {
      title: "Department Management",
      description: "Create, update, and manage departments",
      items: [
        { label: "Create Department", href: "/organization-structure/departments/create", description: "Add a new department to the organization" },
        { label: "Update Department", href: "/organization-structure/departments/update", description: "Modify existing department information" },
        { label: "Delete Department", href: "/organization-structure/departments/delete", description: "Remove a department from the organization" },
      ],
    },
    {
      title: "Position Management",
      description: "Manage job positions and roles",
      items: [
        { label: "Create Position", href: "/organization-structure/positions/create", description: "Define a new position within the organization" },
        { label: "Update Position", href: "/organization-structure/positions/update", description: "Modify position details and requirements" },
        { label: "Delete Position", href: "/organization-structure/positions/delete", description: "Remove a position from the organization" },
      ],
    },
    {
      title: "Change Requests",
      description: "Manage department and position change requests",
      items: [
        { label: "Create Department Change Request", href: "/organization-structure/requests/departmentChange", description: "Request a change to an employee's department" },
        { label: "Create Position Change Request", href: "/organization-structure/requests/PositionChange", description: "Request a change to an employee's position" },
        { label: "Review Change Requests", href: "/organization-structure/reviewChange", description: "Review and approve or reject change requests" },
      ],
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Organization Structure Module
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Manage departments, positions, and organizational hierarchy
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {modules.map((module) => (
          <div
            key={module.title}
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--org-structure)' }}>
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
                    e.currentTarget.style.borderColor = 'var(--org-structure)';
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
    </div>
  );
}
