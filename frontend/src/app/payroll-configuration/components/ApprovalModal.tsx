'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUser } from '../lib/userContext';

interface ApprovalItem {
  _id: string;
  name: string;
  type: string;
  createdAt?: Date | string;
}

interface ApprovalModalProps {
  isOpen: boolean;
  item: ApprovalItem | null;
  onConfirm: (approvedBy: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ApprovalModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  isLoading,
}: ApprovalModalProps) {
  const { user } = useUser();
  const [approvedBy, setApprovedBy] = useState('');

  // Auto-fill with current user ID from context
  useEffect(() => {
    if (isOpen && user?.id) {
      setApprovedBy(user.id);
    }
  }, [isOpen, user?.id]);

  const handleConfirm = async () => {
    if (!approvedBy.trim()) {
      return;
    }
    try {
      await onConfirm(approvedBy);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    setApprovedBy('');
    onCancel();
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} title="Approve Configuration" onClose={handleCancel} size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to approve this {item.type}?
        </p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Name:</span>
            <span className="text-gray-900">{item.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Type:</span>
            <span className="text-gray-900">{item.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Created Date:</span>
            <span className="text-gray-900">{formatDate(item.createdAt)}</span>
          </div>
        </div>

        <div>
          <label htmlFor="approvedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Approved By
          </label>
          <input
            id="approvedBy"
            type="text"
            value={user ? `${user.name || user.workEmail || 'User'} (${user.id})` : ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
            disabled
            readOnly
          />
          <input type="hidden" value={approvedBy} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !approvedBy.trim()}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}

