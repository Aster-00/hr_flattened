'use client';

interface StatusBadgeProps {
  status: 'draft' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  } as const;

  const statusStyles = {
    draft: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-rejected',
  } as const;

  const statusLabels = {
    draft: 'Draft',
    approved: 'Approved',
    rejected: 'Rejected',
  } as const;

  const typedStatus = status as 'draft' | 'approved' | 'rejected';

  return (
    <span className={`badge ${statusStyles[typedStatus]} ${sizeStyles[size]}`}>
      {statusLabels[typedStatus]}
    </span>
  );
}
