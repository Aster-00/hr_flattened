'use client';

import React from 'react';
import { formatFileSize } from '../../../../utils/format';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

/**
 * Attachment Preview Component
 * Displays a preview of an uploaded file with remove option
 */
export default function AttachmentPreview({
  file,
  onRemove,
  className = '',
}: AttachmentPreviewProps) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div
      className={`card ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: '1.5rem',
            flexShrink: 0,
          }}
        >
          {getFileIcon(file.name)}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file.name}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            {formatFileSize(file.size)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--error)',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.25rem',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--error-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Remove file"
      >
        ×
      </button>
    </div>
  );
}

// Attachment Preview component
