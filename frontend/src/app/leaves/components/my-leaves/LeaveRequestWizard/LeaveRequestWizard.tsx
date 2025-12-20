import React, { useState } from 'react';

interface LeaveRequestWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const LeaveRequestWizard: React.FC<LeaveRequestWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { number: 1, title: 'Leave Type' },
    { number: 2, title: 'Dates' },
    { number: 3, title: 'Details' },
    { number: 4, title: 'Review' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <span className="text-xs mt-2 text-gray-600">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Step {currentStep} of {totalSteps}</p>
          <p className="text-sm text-gray-500">
            Full wizard implementation will be done by Sara
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-6 border-t">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (currentStep < totalSteps) {
              setCurrentStep(currentStep + 1);
            } else {
              onComplete?.();
            }
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {currentStep === totalSteps ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};
