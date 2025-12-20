export interface PayrollRun {
    runId: string;
    payrollPeriod: string;
    status: "draft" | "pending finance approval" | "approved" | "rejected" | "locked" | "under review" | "unlocked" | string;
    totalnetpay: number;
    employees: number;
    exceptions: number;
    paymentStatus: string;
    entity?: string;
    rejectionReason?: string;
    createdAt: string;
}

export interface PayrollAnomalies {
    payslipId: string;
    employeeId: string;
    employeeName: string;
    netPay: number;
    reasons: string[];
    resolved: boolean;
    resolvedAt: string | null;
    resolutionNotes: string | null;
}

