export const ENUMS = {
  ConfigStatus: {
    DRAFT: 'draft',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  PolicyType: {
    DEDUCTION: 'Deduction',
    ALLOWANCE: 'Allowance',
    BENEFIT: 'Benefit',
    MISCONDUCT: 'Misconduct',
    LEAVE: 'Leave',
  },
  Applicability: {
    ALL_EMPLOYEES: 'All Employees',
    FULL_TIME: 'Full Time Employees',
    PART_TIME: 'Part Time Employees',
    CONTRACTORS: 'Contractors',
  },
  PayType: {
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    CONTRACT_BASED: 'contract_based',
  },
};

export const policyTypeOptions = Object.entries(ENUMS.PolicyType).map(([_, value]) => ({
  label: value,
  value,
}));

export const applicabilityOptions = Object.entries(ENUMS.Applicability).map(([_, value]) => ({
  label: value,
  value,
}));

export const payTypeOptions = Object.entries(ENUMS.PayType).map(([_, value]) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}));
