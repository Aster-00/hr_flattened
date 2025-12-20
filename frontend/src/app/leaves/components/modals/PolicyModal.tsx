'use client';

import React from 'react';
import { Modal } from '../common/Modal';
import { PolicyForm } from '../common/PolicyForm';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy?: any;
  onSuccess?: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ 
  isOpen, 
  onClose, 
  policy,
  onSuccess 
}) => {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policy ? 'Edit Leave Policy' : 'Create Leave Policy'}
      size="lg"
    >
      <PolicyForm
        policy={policy}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};
