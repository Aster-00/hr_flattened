/**
 * Utility functions for leave request status and validation
 */

/**
 * Calculate how many hours a request has been pending
 */
export function getRequestAgeHours(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60);
}

/**
 * Check if a request is overdue (pending > 48 hours)
 */
export function isRequestOverdue(createdAt: string, status: string): boolean {
  if (status !== 'pending') return false;
  return getRequestAgeHours(createdAt) > 48;
}

/**
 * Get formatted age string for display
 */
export function getRequestAgeDisplay(createdAt: string): string {
  const hours = getRequestAgeHours(createdAt);
  
  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return `${minutes}m ago`;
  }
  
  if (hours < 24) {
    return `${Math.floor(hours)}h ago`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
