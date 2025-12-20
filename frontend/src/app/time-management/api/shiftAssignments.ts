import {apiClient} from "./axios";
import { ShiftAssignment } from "../types/ShiftAssignment";

export const getShiftAssignments = async (): Promise<ShiftAssignment[]> => {
  const res = await apiClient.get("/shift-assignments");
  return res.data;
};

export const getShiftAssignmentById = async (
  id: string
): Promise<ShiftAssignment> => {
  const res = await apiClient.get(`/shift-assignments/${id}`);
  return res.data;
};
export const approveShiftAssignment = async (id: string) => {
  const res = await apiClient.patch(`/shift-assignments/${id}/approve`);
  return res.data;
};

export const cancelShiftAssignment = async (id: string) => {
  const res = await apiClient.patch(`/shift-assignments/${id}/reject`);
  return res.data;
};

export const createShiftAssignment = async (data: {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  shiftId: string;
  scheduleRuleId?: string;
  startDate: string;
  endDate?: string;
}): Promise<ShiftAssignment> => {
  const res = await apiClient.post("/shift-assignments", data);
  return res.data;
};

export const updateShiftAssignment = async (
  id: string,
  data: Partial<ShiftAssignment>
): Promise<ShiftAssignment> => {
  const res = await apiClient.patch(`/shift-assignments/${id}`, data);
  return res.data;
};
