import React, { useState } from 'react';

interface ReturnForCorrectionModalProps {
  isOpen: boolean;
  requestId: string;
  onClose: () => void;
  onSubmit: (requestId: string, feedback: string) => Promise<void>;
}

export const ReturnForCorrectionModal: React.FC<ReturnForCorrectionModalProps> = ({
  isOpen,
  requestId,
  onClose,
  onSubmit,
}) => {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for the correction');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(requestId, feedback);
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Failed to return for correction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Return for Correction</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              This request will be returned to the employee for correction. Provide specific
              feedback on what needs to be fixed.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback / Correction Required <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Example: Please attach a valid medical certificate or provide more details about the reason..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !feedback.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Returning...' : 'Return for Correction'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
