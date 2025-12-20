import React, { useState } from 'react';
import { useAllRequests } from '../../hooks/queries/useAllRequests';
import { VerifyMedicalPanel } from '../../components/hr/VerifyMedicalPanel';
import EmptyState from '../../components/common/EmptyState';

export const VerificationSection: React.FC = () => {
  const { requests } = useAllRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const medicalRequests = requests?.filter(
    (r: any) => r.leaveType.code === 'SICK' && r.attachments && r.attachments.length > 0
  ) || [];

  const selectedRequest = medicalRequests.find((r: any) => r.id === selectedRequestId);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Document Verification</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Pending Verification</h3>
            {medicalRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No medical requests to verify</p>
            ) : (
              <div className="space-y-2">
                {medicalRequests.map((request: any) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequestId(request.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedRequestId === request.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{request.employee.name}</div>
                    <div className="text-xs text-gray-500">{request.attachments?.length || 0} documents</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verification Panel */}
        <div className="lg:col-span-2">
          {!selectedRequest ? (
            <EmptyState
              title="Select a request"
              description="Choose a medical leave request to verify documents"
              icon="📄"
            />
          ) : (
            <VerifyMedicalPanel
              requestId={selectedRequest._id}
              attachments={selectedRequest.attachment ? [{ name: selectedRequest.attachment.filename, url: selectedRequest.attachment.url }] : []}
            />
          )}
        </div>
      </div>
    </div>
  );
};
