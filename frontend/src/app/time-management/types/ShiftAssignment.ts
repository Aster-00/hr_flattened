import { ObjectId } from "./ObjectId";

export type AssignmentStatus =
  | "PENDING"
  | "APPROVED"
  | "CANCELLED"
  | "EXPIRED";


/**
 * Represents either a raw ObjectId string OR a populated reference
 */
export interface PopulatedRef {
  _id: string;
  name?: string;
}

export interface ShiftAssignment {
  _id: string;

  employeeId?: string;
  departmentId?: string;
  positionId?: string;

  shiftId: string | PopulatedRef;        // ✅ FIX
  scheduleRuleId?: string | PopulatedRef;

  startDate: string;
  endDate?: string;

  status: AssignmentStatus;
}
