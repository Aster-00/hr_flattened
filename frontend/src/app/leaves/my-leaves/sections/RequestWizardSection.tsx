import React from 'react';

interface RequestWizardSectionProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const RequestWizardSection: React.FC<RequestWizardSectionProps> = ({ onComplete, onCancel }) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-light)', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>New Leave Request</h2>
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Full request wizard will be implemented by Sara
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
          This will include multi-step form with date selection, leave type, reason, and document upload
        </p>
      </div>
    </div>
  );
};
