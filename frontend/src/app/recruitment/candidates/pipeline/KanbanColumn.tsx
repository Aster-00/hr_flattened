"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

export default function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.75rem',
        border: `2px solid ${isOver ? color : 'var(--border-color)'}`,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
        flex: '0 0 25%',
        minWidth: '280px',
        height: '100%',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: color,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>
          {title}
        </h3>
        <span
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            padding: '0.25rem 0.625rem',
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: '600',
          }}
        >
          {count}
        </span>
      </div>

      {/* Column Content */}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minHeight: 0,
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minHeight: '100%',
        }}>
          {count === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              No candidates in this stage
            </div>
          ) : (
            <>
              {children}
              <div style={{ minHeight: '100px' }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
