'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
}

const toastStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Toast({ id, message, type, onDismiss }: ToastProps) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={`${toastStyles[type]} text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[500px] flex items-center justify-between gap-4 animate-slide-in transition-all duration-300`}
      role="alert"
    >
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg font-semibold">{toastIcons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

