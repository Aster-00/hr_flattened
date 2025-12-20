export type ObjectId = {
  _id: string; // serialized ObjectId from backend
};

export interface ScheduleRule {
  _id: ObjectId["_id"];
  name: string;
  pattern: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
