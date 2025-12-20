/**
 * Date utility functions for leaves module
 */

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @param format - Format style ('short', 'long', 'full')
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const optionsMap: Record<'short' | 'long' | 'full', Intl.DateTimeFormatOptions> = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
  };

  return date.toLocaleDateString('en-US', optionsMap[format]);
}

/**
 * Formats a date to ISO date string (YYYY-MM-DD)
 * @param date - Date object or ISO string
 * @returns ISO date string
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Gets the current date as ISO string
 * @returns Current date in YYYY-MM-DD format
 */
export function getCurrentDateISO(): string {
  return formatDateISO(new Date());
}

/**
 * Checks if a date is today
 * @param dateString - ISO date string
 * @returns True if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return formatDateISO(date) === formatDateISO(today);
}

/**
 * Checks if a date is in the past
 * @param dateString - ISO date string
 * @returns True if date is in the past
 */
export function isPast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Checks if a date is in the future
 * @param dateString - ISO date string
 * @returns True if date is in the future
 */
export function isFuture(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Calculates the number of days between two dates
 * @param startDate - Start date (ISO string or Date)
 * @param endDate - End date (ISO string or Date)
 * @returns Number of days (inclusive)
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // Inclusive of both start and end dates
}

/**
 * Adds days to a date
 * @param date - Date to add days to
 * @param days - Number of days to add (can be negative)
 * @returns New date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Gets the start of the week (Monday)
 * @param date - Date to get week start for
 * @returns Date at start of week
 */
export function getWeekStart(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Gets the end of the week (Sunday)
 * @param date - Date to get week end for
 * @returns Date at end of week
 */
export function getWeekEnd(date: Date | string = new Date()): Date {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
}

/**
 * Gets the start of the month
 * @param date - Date to get month start for
 * @returns Date at start of month
 */
export function getMonthStart(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Gets the end of the month
 * @param date - Date to get month end for
 * @returns Date at end of month
 */
export function getMonthEnd(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 * @param date - Date to check
 * @returns True if date is weekend
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Formats a date range as a string
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate, 'short');
  const end = formatDate(endDate, 'short');
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
}

/**
 * Gets relative time string (e.g., "2 days ago", "in 3 days")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays > 0) {
    return `in ${diffDays} days`;
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
}
