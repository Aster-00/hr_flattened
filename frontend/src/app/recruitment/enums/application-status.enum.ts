export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  IN_PROCESS = 'in_process',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

// Stage configuration for Kanban columns based on Application Status
export const APPLICATION_STATUS_STAGES = [
  { id: ApplicationStatus.SUBMITTED, label: 'Submitted', color: '#6b7280' },
  { id: ApplicationStatus.IN_PROCESS, label: 'In Process', color: '#f6793bff' },
  { id: ApplicationStatus.OFFER, label: 'Offer', color: 'var(--warning)' },
  { id: ApplicationStatus.HIRED, label: 'Hired', color: '#10b981' },
  { id: ApplicationStatus.REJECTED, label: 'Rejected', color: '#ef4444' },
];
