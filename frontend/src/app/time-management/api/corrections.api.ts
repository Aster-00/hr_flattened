import { apiClient } from "./axios";
import { CorrectionRequest } from "../types/CorrectionRequest";

const BASE = "/attendance/corrections";

/**
 * Get all correction requests (Manager / HR)
 */
export async function getCorrections(): Promise<CorrectionRequest[]> {
    const res = await apiClient.get<CorrectionRequest[]>(BASE);
    return res.data;
}

/**
 * Approve correction
 */
export async function approveCorrection(
    id: string,
    managerComment?: string
): Promise<void> {
    await apiClient.patch(`${BASE}/${id}`, {
        status: "APPROVED",
        managerComment,
    });
}

/**
 * Reject correction
 */
export async function rejectCorrection(
    id: string,
    managerComment?: string
): Promise<void> {
    await apiClient.patch(`${BASE}/${id}`, {
        status: "REJECTED",
        managerComment,
    });
}
