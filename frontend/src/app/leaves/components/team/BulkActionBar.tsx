import React from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  onApproveAll?: () => void;
  onRejectAll?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onApproveAll,
  onRejectAll,
  onClear,
  loading,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} {selectedCount === 1 ? 'request' : 'requests'} selected
          </span>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex gap-2">
          {onApproveAll && (
            <button
              onClick={onApproveAll}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Approve All
            </button>
          )}
          
          {onRejectAll && (
            <button
              onClick={onRejectAll}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Reject All
            </button>
          )}
          
          {onClear && (
            <button
              onClick={onClear}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
