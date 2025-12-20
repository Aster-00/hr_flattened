export type ExceptionStatus =
    | "OPEN"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "RESOLVED";

export interface TimeException {
    _id: string;
    employeeId: string;
    reason: string;
    status: ExceptionStatus;
    createdAt: string;
}
