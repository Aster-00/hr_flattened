import { ObjectId } from "./ObjectId";

export interface ShiftType {
  _id: ObjectId;
  name: string;
  active: boolean;
}
