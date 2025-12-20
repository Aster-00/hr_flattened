import React from 'react';
import { formatDate } from '../../utils/dates';

interface OverlappingRequest {
  _id: string;
  status: string;
  dates: { from: string; to: string };
  leaveType: { name: string };
}

interface OverlapWarningProps {
  overlappingRequests: OverlappingRequest[];
  isChecking?: boolean;
}

export default function OverlapWarning({ overlappingRequests, isChecking }: OverlapWarningProps) {
  if (isChecking) {
    return (
      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gray-50)',
        border: '1px solid var(--gray-300)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div className="leaves-spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Checking for overlapping requests...
        </p>
      </div>
    );
  }

  if (!overlappingRequests || overlappingRequests.length === 0) {
    return null;
  }

  return (
    <div style={{
      padding: '1rem',
      borderRadius: 'var(--radius-lg)',
      background: '#FEF3C7',
      border: '1px solid #F59E0B',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <svg 
          style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B', flexShrink: 0 }} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#92400E', 
            fontWeight: '600', 
            marginBottom: '0.25rem' 
          }}>
            Overlapping Request Detected
          </p>
          <p style={{ fontSize: '0.875rem', color: '#92400E', marginBottom: '0.75rem' }}>
            The selected dates overlap with {overlappingRequests.length === 1 ? 'an existing request' : `${overlappingRequests.length} existing requests`}. 
            Submitting this request may lead to rejection.
          </p>
          
          {/* List of overlapping requests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {overlappingRequests.map((request) => (
              <div 
                key={request._id}
                style={{
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #F59E0B',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#92400E' }}>
                      {request.leaveType.name}
                    </span>
                    <span style={{ color: '#92400E', margin: '0 0.5rem' }}>•</span>
                    <span style={{ color: '#92400E' }}>
                      {formatDate(request.dates.from)} - {formatDate(request.dates.to)}
                    </span>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: request.status === 'approved' ? '#DCFCE7' : '#FEF3C7',
                    color: request.status === 'approved' ? '#166534' : '#92400E',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
