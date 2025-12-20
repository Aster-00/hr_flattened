'use client';

import { useState, ReactNode } from 'react';

interface CRUDTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => ReactNode;
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
  }[];
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
  onDelete?: (item: any) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  processingItemId?: string | null;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function CRUDTable({
  data,
  columns,
  onEdit,
  onView,
  onDelete,
  isLoading = false,
  emptyMessage = 'No data available',
  processingItemId,
  selectedIds: externalSelectedIds,
  onSelectionChange,
}: CRUDTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

  // Use external state if provided, otherwise use internal state
  const selectedIds = externalSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;

  const toggleSelection = (id: string) => {
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setSelectedIds(nextIds);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item._id || item.id));
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          border: '3px solid var(--primary-100)',
          borderTopColor: 'var(--primary-600)',
          borderRadius: '50%',
          animation: 'table-spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes table-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p className="text-secondary" style={{ fontSize: '1.125rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid var(--border-light)' }}>
      <table className="table" style={{ margin: 0 }}>
        <thead>
          <tr>
            <th style={{ width: '48px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === data.length && data.length > 0}
                onChange={toggleSelectAll}
                style={{ cursor: 'pointer', width: '1.125rem', height: '1.125rem' }}
              />
            </th>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '1rem', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#374151', letterSpacing: '0.05em' }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onView || onDelete) && (
              <th style={{ textAlign: 'center', padding: '1rem', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#374151', letterSpacing: '0.05em' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const itemId = item._id || item.id;
            const isProcessing = processingItemId === itemId;
            return (
              <tr
                key={itemId || idx}
                style={{
                  opacity: isProcessing ? 0.5 : 1,
                  pointerEvents: isProcessing ? 'none' : 'auto',
                  transition: 'background-color 0.2s ease',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <td style={{ textAlign: 'center', padding: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(itemId)}
                    onChange={() => toggleSelection(itemId)}
                    style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem' }}
                    disabled={isProcessing}
                  />
                </td>
                {columns.map((col) => (
                  <td key={`${itemId}-${col.key}`} style={{ padding: '1rem', color: 'var(--secondary-700)', fontSize: '0.875rem' }}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onView || onDelete) && (
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          style={{
                            padding: '0.375rem 1rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        >
                          View
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          style={{
                            padding: '0.375rem 1rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: '0.5rem',
                            border: 'none',
                            backgroundColor: '#10a37f', // Green from photo
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0e8a6d'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10a37f'}
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          style={{
                            padding: '0.375rem 1rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            borderRadius: '0.5rem',
                            border: 'none',
                            backgroundColor: '#ef4444', // Red from photo
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
