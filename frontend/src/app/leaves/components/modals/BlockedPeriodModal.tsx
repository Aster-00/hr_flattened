'use client';

import React from 'react';
import { Modal } from '../common/Modal';
import { BlockedPeriodForm } from '../common/BlockedPeriodForm';

interface BlockedPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedPeriod: any;
  onSuccess?: () => void;
}

export const BlockedPeriodModal: React.FC<BlockedPeriodModalProps> = ({ 
  isOpen, 
  onClose, 
  blockedPeriod,
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
      title="Edit Blocked Period"
      size="md"
    >
      <BlockedPeriodForm
        blockedPeriod={blockedPeriod}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};
