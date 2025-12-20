import { PayrollRun, PayrollAnomalies } from "../types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getHeaders = () => ({
    "Content-Type": "application/json",
});



// Helper to get user details from backend (Cookie-based auth)
export const fetchCurrentUser = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { "Content-Type": "application/json" },
            credentials: 'include', // Important: sends the httpOnly cookie
        });
        if (!res.ok) return null;

        const user = await res.json();
        // Backend returns the raw user object or JWT payload


        // Handle both JWT payload (roles=[]) and DB object (systemRole.roles=[])
        const roleSource = user.roles || user.systemRole?.roles || [];
        const userRole = Array.isArray(roleSource) && roleSource.length > 0 ? roleSource[0] : 'EMPLOYEE';

        return {
            id: user.id || user._id || user.sub,
            role: userRole,
            name: user.name || user.workEmail || user.username
        };
    } catch (e) {
        console.error("Failed to fetch user", e);
        return null;
    }
};

export const fetchUsersByRole = async (role: string) => {
    try {
        const res = await fetch(`${API_URL}/employee-profile/roles?role=${encodeURIComponent(role)}`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error("Failed to fetch users by role", e);
        return [];
    }
};


export const payrollExecutionApi = {
    // Phase 0: Pre-Run
    getPendingItems: async () => {
        const res = await fetch(`${API_URL}/payroll-execution/pending-items`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to fetch pending items: ${res.status} ${res.statusText}`);
        return res.json();
    },

    updateBonusStatus: async (bonusRecordId: string, status: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/bonus-status`, {
            method: "PUT",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ bonusRecordId, status }),
        });
        if (!res.ok) throw new Error("Failed to update bonus status");
        return res.json();
    },

    updateBenefitStatus: async (benefitRecordId: string, status: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/benefit-status`, {
            method: "PUT",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ benefitRecordId, status }),
        });
        if (!res.ok) throw new Error("Failed to update benefit status");
        return res.json();
    },

    validatePhase0: async () => {
        const res = await fetch(`${API_URL}/payroll-execution/validate`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to validate Phase 0");
        return res.json();
    },

    editBonus: async (bonusId: string, givenAmount: number) => {
        const res = await fetch(`${API_URL}/payroll-execution/bonus/${bonusId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ givenAmount }),
        });
        if (!res.ok) throw new Error("Failed to edit bonus");
        return res.json();
    },

    editBenefit: async (benefitId: string, givenAmount: number) => {
        const res = await fetch(`${API_URL}/payroll-execution/benefit/${benefitId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ givenAmount }),
        });
        if (!res.ok) throw new Error("Failed to edit benefit");
        return res.json();
    },

    editPayrollPeriod: async (runId: string, updates: { payrollPeriod?: string; entity?: string }) => {
        const res = await fetch(`${API_URL}/payroll-execution/edit/${runId}`, {
            method: "PUT",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Failed to edit payroll period");
        return res.json();
    },

    // Phase 1: Initiation
    initiatePayroll: async (dto: {
        payrollPeriod: string;
        entity: string;
        payrollSpecialistId: string;
        payrollManagerId: string;
    }) => {
        const res = await fetch(`${API_URL}/payroll-execution/initiate`, {
            method: "POST",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(dto),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to initiate payroll");
        }
        return res.json();
    },

    startCalculation: async (runId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/start-initiation/${runId}`, {
            method: "POST",
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to start calculation");
        return res.json();
    },

    submitForReview: async (runId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/submit-review/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to submit for review");
        return res.json();
    },

    // Phase 2: Execution & Dashboard
    getCurrentRun: async (): Promise<PayrollRun | null> => {
        const res = await fetch(`${API_URL}/payroll-execution/current-run`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to get current run");
        return res.json();
    },

    getAllRuns: async (): Promise<PayrollRun[]> => {
        const res = await fetch(`${API_URL}/payroll-execution/history`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to fetch history: ${res.status} ${res.statusText}`);
        return res.json();
    },

    getAnomalies: async (runId: string): Promise<PayrollAnomalies[]> => {
        const res = await fetch(`${API_URL}/payroll-execution/run/${runId}/anomalies`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to fetch anomalies");
        return res.json();
    },

    resolveAnomaly: async (payslipId: string, notes: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/anomaly/resolve/${payslipId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ notes }),
        });
        if (!res.ok) throw new Error("Failed to resolve anomaly");
        return res.json();
    },

    unresolveAnomaly: async (payslipId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/anomaly/unresolve/${payslipId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to unresolve anomaly");
        return res.json();
    },


    approveByManager: async (runId: string, userId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/approve/manager/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("Manager approval failed");
        return res.json();
    },

    approveByFinance: async (runId: string, userId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/approve/finance/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("Finance approval failed");
        return res.json();
    },

    executePayroll: async (runId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/execute/${runId}`, {
            method: "POST",
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Execution failed");
        return res.json();
    },

    unfreezePayroll: async (runId: string, managerId: string, reason: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/unfreeze/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ managerId, reason }),
        });
        if (!res.ok) throw new Error("Unfreeze failed");
        return res.json();
    },

    rejectByManager: async (runId: string, userId: string, reason: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/reject/manager/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ userId, reason }),
        });
        if (!res.ok) throw new Error("Manager rejection failed");
        return res.json();
    },

    rejectByFinance: async (runId: string, userId: string, reason: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/reject/finance/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ userId, reason }),
        });
        if (!res.ok) throw new Error("Finance rejection failed");
        return res.json();
    },

    rejectPayrollPeriod: async (runId: string, reason: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/reject/${runId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ reason }),
        });
        if (!res.ok) throw new Error("Period rejection failed");
        return res.json();
    },

    updatePayslip: async (payslipId: string, updates: Record<string, any>) => {
        const res = await fetch(`${API_URL}/payroll-execution/payslip/${payslipId}`, {
            method: "PATCH",
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Payslip update failed");
        return res.json();
    },

    getPayslipsForRun: async (runId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/run/${runId}/payslips`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to fetch payslips for run");
        return res.json();
    },

    getPayslipById: async (payslipId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/payslip/detail/${payslipId}`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to fetch payslip");
        return res.json();
    },

    exportBankFile: async (runId: string) => {
        const res = await fetch(`${API_URL}/payroll-execution/export-bank-file/${runId}`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error("Failed to export bank file");
        return res.blob();
    },


    // Employee Self-Service
    getMyPayslips: async () => {
        const res = await fetch(`${API_URL}/payroll-execution/my-payslips`, {
            headers: getHeaders(),
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to fetch payslips: ${res.status} ${res.statusText}`);
        return res.json();
    },
    fetchCurrentUser: fetchCurrentUser
};
