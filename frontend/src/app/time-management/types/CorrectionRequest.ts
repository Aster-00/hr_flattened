export type CorrectionStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface CorrectionRequest {
    _id: string;
    employeeId: string;
    date: string;
    reason: string;
    status: CorrectionStatus;
    createdAt: string;
    updatedAt: string;
}
