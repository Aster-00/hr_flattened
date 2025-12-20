import {apiClient} from "./axios";
import { ShiftType } from "../types/shiftType";

export const getShiftTypes = async (): Promise<ShiftType[]> => {
  const res = await apiClient.get("/shift-types");
  return res.data;
};

export const createShiftType = async (data: Partial<ShiftType>) => {
  const res = await apiClient.post("/shift-types", data);
  return res.data;
};

export const updateShiftType = async (id: string, data: Partial<ShiftType>) => {
  const res = await apiClient.patch(`/shift-types/${id}`, data);
  return res.data;
};

