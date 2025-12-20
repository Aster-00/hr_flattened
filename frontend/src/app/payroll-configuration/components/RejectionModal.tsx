'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUser } from '../lib/userContext';

interface RejectionItem {
  _id: string;
  name: string;
  type: string;
  createdAt?: Date | string;
}

interface RejectionModalProps {
  isOpen: boolean;
  item: RejectionItem | null;
  onConfirm: (rejectedBy: string, reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function RejectionModal({
  isOpen,
  item,
  onConfirm,
  onCancel,
  isLoading,
}: RejectionModalProps) {
  const { user } = useUser();
  const [rejectedBy, setRejectedBy] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Auto-fill with current user ID from context
  useEffect(() => {
    if (isOpen && user?.id) {
      setRejectedBy(user.id);
    }
  }, [isOpen, user?.id]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const validateReason = (value: string): string => {
    if (!value.trim()) {
      return 'Rejection reason is required';
    }
    if (value.trim().length < 10) {
      return 'Rejection reason must be at least 10 characters';
    }
    return '';
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    // Validate on every change to show real-time feedback
    const validationError = validateReason(value);
    setError(validationError);
  };

  const handleConfirm = async () => {
    if (!rejectedBy.trim()) {
      return;
    }

    const validationError = validateReason(reason);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    try {
      await onConfirm(rejectedBy, reason.trim());
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    setRejectedBy('');
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

  const isReasonValid = reason.trim().length >= 10;
  const isFormValid = rejectedBy.trim() && isReasonValid;

  return (
    <Modal isOpen={isOpen} title="Reject Configuration" onClose={handleCancel} size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          Please provide a reason for rejecting this {item.type}
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
          <label htmlFor="rejectedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Rejected By
          </label>
          <input
            id="rejectedBy"
            type="text"
            value={user ? `${user.name || user.workEmail || 'User'} (${user.id})` : ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
            disabled
            readOnly
          />
          <input type="hidden" value={rejectedBy} />
        </div>

        <div>
          <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason
          </label>
          <textarea
            id="rejectionReason"
            value={reason}
            onChange={handleReasonChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-black ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Provide a clear explanation for the rejection (minimum 10 characters)"
            disabled={isLoading}
            required
          />
          <div className="mt-1 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Provide a clear explanation for the rejection
            </p>
            <p className={`text-xs font-medium ${reason.trim().length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
              {reason.trim().length}/10 characters
            </p>
          </div>
          {error && (
            <div className="mt-1 flex items-center gap-1">
              <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
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
            disabled={isLoading || !isFormValid}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            Reject
          </button>
        </div>
      </div>
    </Modal>
  );
}

