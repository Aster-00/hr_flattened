// RoleManagementTable component
'use client';

import React, { useState } from 'react';
import { useRoles } from '../../hooks/queries/useRoles';
import EditRolePermissionsModal from './EditRolePermissionsModal';
import type { Role } from '../../api/roles.api';

export default function RoleManagementTable() {
  const { roles, isLoading, refetch } = useRoles();
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleEditSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '48px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
          Loading roles...
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Role Management
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Manage permissions for different user roles
          </p>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Role Name
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Description
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Permissions
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Users Assigned
                </th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const roleIcon = role.name === 'admin' ? '👑' : 
                                 role.name === 'hr' ? '👔' : 
                                 role.name === 'manager' ? '📋' : '👤';
                
                return (
                  <tr
                    key={role._id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: role.name === 'admin' ? '#fef3c7' : '#eff6ff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {roleIcon}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#111827',
                            textTransform: 'capitalize'
                          }}>
                            {role.name}
                          </div>
                          {role.name === 'admin' && (
                            <div style={{
                              fontSize: '11px',
                              color: '#92400e',
                              backgroundColor: '#fef3c7',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              marginTop: '2px'
                            }}>
                              Protected
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280', maxWidth: '250px' }}>
                      {role.description}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1e40af'
                      }}>
                        {role.permissions?.length || 0} permissions
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#111827'
                      }}>
                        {role.userCount || 0}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => setEditingRole(role)}
                        style={{
                          padding: '6px 16px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#3b82f6',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>⚙️</span>
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info Footer */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#6b7280'
          }}>
            <span>ℹ️</span>
            <span>
              Admin role permissions are protected and cannot be modified. Other roles can be customized to fit your organization's needs.
            </span>
          </div>
        </div>
      </div>

      <EditRolePermissionsModal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        role={editingRole}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
