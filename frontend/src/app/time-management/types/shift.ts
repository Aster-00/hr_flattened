import { ObjectId } from "./ObjectId";
import { PunchPolicy } from "./enums";


export interface Shift {
  _id: ObjectId;
  name: string;
  shiftType: ObjectId;   // ref ShiftType
  startTime: string;    // "HH:mm"
  endTime: string;      // "HH:mm"
  punchPolicy: PunchPolicy;
  graceInMinutes: number;
  graceOutMinutes: number;
  requiresApprovalForOvertime: boolean;
  active: boolean;
}
