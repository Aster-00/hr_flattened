export enum ConfigStatus {
    DRAFT = 'draft',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum PolicyType {
    DEDUCTION = "Deduction",
    ALLOWANCE = "Allowance",
    BENEFIT = "Benefit",
    MISCONDUCT = "Misconduct",
    LEAVE = "Leave",
}

export enum Applicability {
    AllEmployees = "All Employees",
    FULL_TIME = "Full Time Employees",
    PART_TIME = "Part Time Employees",
    CONTRACTORS = "Contractors",
}

export enum PayType {
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CONTRACT_BASED = 'contract_based',
}
