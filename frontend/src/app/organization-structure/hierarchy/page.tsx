"use client";

import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { json } from "stream/consumers";

interface EmployeeHierarchy {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  manager: { id: string; name: string; position: string | null } | null;
  managerManager: { id: string; name: string; position: string | null } | null;
}

interface TeamMember {
  id: string;
  name: string;
  position: string | null;
  department: string | null;
}

interface HierarchyData {
  employeeHierarchy: EmployeeHierarchy;
  teamStructure: TeamMember[];
}

export default function ViewHierarchyPage() {
  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHierarchyForCurrentUser = async () => {
      setLoading(true);
      setMessage("");
      setHierarchy(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("No authentication token found. Please log in again.");
          return;
        }

        const decoded = jwtDecode(token) as {id : null | string};

        if (!decoded.id) {
          setMessage("User ID not found in token.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/organization-structure/hierarchy/${decoded.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHierarchy(data);
        } else {
          const error = await response.text();
          setMessage(`Error: ${error}`);
        }
      } catch (error) {
        setMessage("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchyForCurrentUser();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Organization Hierarchy
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Explore the complete organizational hierarchy and team structure
        </p>
      </div>

      {loading && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          Loading...
        </div>
      )}

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--error-light)',
          color: 'var(--error-dark)',
          borderLeft: '4px solid var(--error)',
        }}>
          {message}
        </div>
      )}

      {hierarchy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Employee Hierarchy */}
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Employee Hierarchy
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--border-medium)' }}>
                    <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                    <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                    <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager</th>
                    <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager&apos;s Manager</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {hierarchy.employeeHierarchy.name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {hierarchy.employeeHierarchy.position || "N/A"}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {hierarchy.employeeHierarchy.department || "N/A"}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {hierarchy.employeeHierarchy.manager?.name || "N/A"}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {hierarchy.employeeHierarchy.managerManager?.name || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Structure */}
          {hierarchy.teamStructure.length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Team Structure
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--border-medium)' }}>
                      <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                      <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                      <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hierarchy.teamStructure.map((member) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                          {member.name}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                          {member.position || "N/A"}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                          {member.department || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
