/**
 * Formatting utility functions for leaves module
 */

/**
 * Formats a number with specified decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Formats leave duration (days) with proper pluralization
 * @param days - Number of days
 * @returns Formatted duration string
 */
export function formatDuration(days: number): string {
  if (days === 1) {
    return '1 day';
  } else if (days === Math.floor(days)) {
    return `${Math.floor(days)} days`;
  } else {
    return `${formatNumber(days, 1)} days`;
  }
}

/**
 * Formats percentage
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

/**
 * Formats currency amount
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a status string (converts snake_case to Title Case)
 * @param status - Status string
 * @returns Formatted status string
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Formats a leave type code to a readable name
 * @param code - Leave type code (e.g., 'ANNUAL', 'SICK_LEAVE')
 * @returns Formatted leave type name
 */
export function formatLeaveTypeCode(code: string): string {
  return code
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncates text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return formatNumber(bytes / Math.pow(k, i), 2) + ' ' + sizes[i];
}

/**
 * Formats a full name from parts
 * @param firstName - First name
 * @param lastName - Last name
 * @param middleName - Optional middle name
 * @returns Formatted full name
 */
export function formatFullName(
  firstName: string,
  lastName: string,
  middleName?: string
): string {
  const parts = [firstName];
  if (middleName) parts.push(middleName);
  parts.push(lastName);
  return parts.join(' ');
}

/**
 * Formats an approval role to a readable label
 * @param role - Approval role (e.g., 'manager', 'hr')
 * @returns Formatted role label
 */
export function formatApprovalRole(role: string): string {
  return capitalize(role);
}

/**
 * Formats employee ID or code
 * @param id - Employee ID
 * @param prefix - Optional prefix (e.g., 'EMP-')
 * @returns Formatted employee ID
 */
export function formatEmployeeId(id: string, prefix: string = ''): string {
  return prefix ? `${prefix}${id}` : id;
}

/**
 * Formats a phone number (basic formatting)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if doesn't match expected format
}

/**
 * Formats an email address (masks if needed for privacy)
 * @param email - Email address
 * @param mask - Whether to mask the email (default: false)
 * @returns Formatted email
 */
export function formatEmail(email: string, mask: boolean = false): string {
  if (!mask) return email;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return email;
  }
  
  const maskedLocal = localPart.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Formats a relative time with unit
 * @param value - Time value
 * @param unit - Time unit ('days', 'months', 'years')
 * @returns Formatted time string
 */
export function formatRelativeTime(value: number, unit: 'days' | 'months' | 'years'): string {
  const unitSingular = unit.slice(0, -1); // Remove 's' for singular
  if (value === 1) {
    return `1 ${unitSingular}`;
  }
  return `${value} ${unit}`;
}
