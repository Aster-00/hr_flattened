export enum CandidateStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// Stage configuration for Kanban columns
export const CANDIDATE_STATUS_STAGES = [
  { id: CandidateStatus.APPLIED, label: 'Applied', color: '#6b7280' },
  { id: CandidateStatus.SCREENING, label: 'Screening', color: '#f6793bff' },
  { id: CandidateStatus.INTERVIEW, label: 'Interview', color: 'var(--info)' },
  { id: CandidateStatus.OFFER_SENT, label: 'Offer Sent', color: 'var(--warning)' },
  { id: CandidateStatus.OFFER_ACCEPTED, label: 'Offer Accepted', color: 'var(--success)' },
  { id: CandidateStatus.HIRED, label: 'Hired', color: '#10b981' },
];
