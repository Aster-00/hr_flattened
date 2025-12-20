/**
 * CSV utility functions for leaves module
 */

/**
 * Escapes a CSV field value
 * @param value - Value to escape
 * @returns Escaped CSV field
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of objects to CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (uses object keys if not provided)
 * @returns CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }
  
  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(escapeCSVField).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => escapeCSVField(row[header])).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Exports data to CSV and triggers download
 * @param data - Array of objects to export
 * @param filename - Filename for the CSV file
 * @param headers - Optional custom headers
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  const csv = arrayToCSV(data, headers);
  
  // Create blob
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Formats leave balance data for CSV export
 */
export interface LeaveBalanceCSVRow {
  'Employee ID': string;
  'Employee Name': string;
  'Leave Type': string;
  'Total Entitlement': number;
  'Used': number;
  'Pending': number;
  'Available': number;
  'Carried Over': number;
}

/**
 * Formats leave history data for CSV export
 */
export interface LeaveHistoryCSVRow {
  'Request ID': string;
  'Leave Type': string;
  'Start Date': string;
  'End Date': string;
  'Duration (Days)': number;
  'Status': string;
  'Submitted At': string;
  'Finalized At'?: string;
}

/**
 * Converts leave balances to CSV rows
 * @param balances - Leave balances data
 * @returns CSV rows
 */
export function formatLeaveBalancesForCSV(
  balances: Array<{
    employeeId: string;
    employeeName: string;
    leaveType: string;
    yearlyEntitlement: number;
    taken: number;
    pending: number;
    remaining: number;
    carryForward: number;
  }>
): LeaveBalanceCSVRow[] {
  return balances.map(balance => ({
    'Employee ID': balance.employeeId,
    'Employee Name': balance.employeeName,
    'Leave Type': balance.leaveType,
    'Total Entitlement': balance.yearlyEntitlement,
    'Used': balance.taken,
    'Pending': balance.pending,
    'Available': balance.remaining,
    'Carried Over': balance.carryForward,
  }));
}

/**
 * Converts leave history to CSV rows
 * @param history - Leave history data
 * @returns CSV rows
 */
export function formatLeaveHistoryForCSV(
  history: Array<{
    requestId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    status: string;
    submittedAt: string;
    finalizedAt?: string;
  }>
): LeaveHistoryCSVRow[] {
  return history.map(entry => ({
    'Request ID': entry.requestId,
    'Leave Type': entry.leaveType,
    'Start Date': entry.startDate,
    'End Date': entry.endDate,
    'Duration (Days)': entry.durationDays,
    'Status': entry.status,
    'Submitted At': entry.submittedAt,
    'Finalized At': entry.finalizedAt || '',
  }));
}

/**
 * Parses CSV string to array of objects
 * @param csv - CSV string to parse
 * @returns Array of objects
 */
export function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Parse data rows
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim().replace(/^"|"$/g, '').replace(/""/g, '"') || '';
    });
    
    data.push(row);
  }
  
  return data;
}

// CSV export utility functions
