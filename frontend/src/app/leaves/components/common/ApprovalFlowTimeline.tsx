import React from 'react';
// TODO: Uncomment when Sara implements types
// import type { LeaveStatus } from '../../types';
type LeaveStatus = any; // Temporary until Sara implements types

interface ApprovalStep {
  status: LeaveStatus;
  label: string;
  approver?: string;
  timestamp?: string;
  comments?: string;
}

interface ApprovalFlowTimelineProps {
  steps: ApprovalStep[];
  currentStatus: LeaveStatus;
}

export const ApprovalFlowTimeline: React.FC<ApprovalFlowTimelineProps> = ({ steps, currentStatus }) => {
  const getStatusIcon = (status: LeaveStatus, isActive: boolean) => {
    if (status === 'Rejected' || status === 'Cancelled') {
      return <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
        <span className="text-red-600 text-lg">×</span>
      </div>;
    }
    
    if (isActive) {
      return <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
        <span className="text-blue-600 text-lg">•</span>
      </div>;
    }
    
    if (status === 'HR_Finalized' || status === 'Manager_Approved') {
      return <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
        <span className="text-green-600">✓</span>
      </div>;
    }
    
    return <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
      <span className="text-gray-400">○</span>
    </div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Approval Flow</h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isActive = step.status === currentStatus;
          const isCompleted = ['Manager_Approved', 'HR_Finalized'].includes(step.status) && 
                             steps.findIndex(s => s.status === currentStatus) > index;
          
          return (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-4 top-8 w-0.5 h-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
              
              <div className="flex gap-4">
                {getStatusIcon(step.status, isActive)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                      {step.label}
                    </h4>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">{step.timestamp}</span>
                    )}
                  </div>
                  
                  {step.approver && (
                    <p className="text-sm text-gray-600">By: {step.approver}</p>
                  )}
                  
                  {step.comments && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{step.comments}"</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
