/**
 * REC-027: Approver Role Types for Offer Approval Workflow
 *
 * Defines the standard roles that can approve job offers.
 * BR 26b: The system must support securing related parties' approval before sending out the offer.
 */
export enum ApproverRole {
  /** HR Manager - Reviews offer compliance and terms */
  HR_MANAGER = 'HR Manager',

  /** Department/Hiring Manager - Reviews role fit and team needs */
  HIRING_MANAGER = 'Hiring Manager',

  /** Finance - Reviews budget and salary approval (REC-027 Financial Approval) */
  FINANCE = 'Finance',

  /** Department Head - Final approval for senior positions */
  DEPARTMENT_HEAD = 'Department Head',

  /** Executive - Required for executive-level hires */
  EXECUTIVE = 'Executive',
}

/**
 * Salary thresholds that require additional financial approval
 * REC-027: Financial Approval requirements
 */
export const FINANCIAL_APPROVAL_THRESHOLDS = {
  /** Standard offers - only HR and Hiring Manager required */
  STANDARD_MAX: 100000,

  /** Senior offers - requires Finance approval */
  SENIOR_MAX: 200000,

  /** Executive offers - requires Finance + Department Head approval */
  EXECUTIVE_MAX: Infinity,
};
