import React, { useState } from 'react';
import { useVerifyMedical } from '../../hooks/mutations/useVerifyMedical';
import type { VerifyMedicalInput } from '../../types';

interface VerifyMedicalPanelProps {
  requestId: string;
  attachments?: Array<{ name: string; url: string }>;
  onSuccess?: () => void;
}

export const VerifyMedicalPanel: React.FC<VerifyMedicalPanelProps> = ({
  requestId,
  attachments = [],
  onSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const verifyMedical = useVerifyMedical();

  const handleVerify = async (isValid: boolean) => {
    setVerified(isValid);
    try {
      const input: VerifyMedicalInput | undefined = notes
        ? { requestId, verified: isValid, comments: notes }
        : undefined;
      // TODO: Uncomment when Sara implements mutation
      // await verifyMedical.mutateAsync({ id: requestId, input });
      await verifyMedical.mutateAsync(requestId);
      onSuccess?.();
      setNotes('');
      setVerified(null);
    } catch (error) {
      console.error('Medical verification failed:', error);
      setVerified(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Document Verification</h3>

      {/* Attachments */}
      {attachments.length > 0 ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Documents</label>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="text-blue-600">📎</span>
                <span className="text-sm text-gray-900">{attachment.name}</span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">⚠️ No medical documents attached to this request.</p>
        </div>
      )}

      {/* Verification Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Verification Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Add any notes about the verification (optional)..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleVerify(true)}
          disabled={verifyMedical.isPending}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
        >
          {verifyMedical.isPending && verified === true ? 'Verifying...' : '✓ Verify as Valid'}
        </button>
        <button
          onClick={() => handleVerify(false)}
          disabled={verifyMedical.isPending}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 font-medium"
        >
          {verifyMedical.isPending && verified === false ? 'Rejecting...' : '× Mark as Invalid'}
        </button>
      </div>
    </div>
  );
};
