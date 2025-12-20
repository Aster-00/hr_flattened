import React, { useState, useEffect } from 'react';
import { useManagerApprove } from '../../hooks/mutations/useManagerApprove';
import { useManagerReject } from '../../hooks/mutations/useManagerReject';
import type { ManagerApprovalInput, ManagerRejectionInput } from '../../types';
import { checkAuth, User } from '@/app/lib/auth';

interface ApprovalActionButtonsProps {
  requestId: string;
  onSuccess?: () => void;
}

export const ApprovalActionButtons: React.FC<ApprovalActionButtonsProps> = ({
  requestId,
  onSuccess,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const approveRequest = useManagerApprove();
  const rejectRequest = useManagerReject();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth().then(setUser);
  }, []);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this leave request?')) return;

    if (!user?.id) {
      alert('User session expired. Please log in again.');
      return;
    }

    try {
      const input: ManagerApprovalInput = {
        approverId: user.id,
        comments: 'Approved by manager',
      };
      await approveRequest.mutateAsync({ id: requestId, input });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!user?.id) {
      alert('User session expired. Please log in again.');
      return;
    }

    try {
      const input: ManagerRejectionInput = {
        approverId: user.id,
        reason: rejectReason,
      };
      await rejectRequest.mutateAsync({ id: requestId, input });
      setShowRejectModal(false);
      setRejectReason('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={approveRequest.isPending}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {approveRequest.isPending ? 'Approving...' : 'Approve'}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={rejectRequest.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          Reject
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Request</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide a clear reason for rejecting this request..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectRequest.isPending || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {rejectRequest.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
