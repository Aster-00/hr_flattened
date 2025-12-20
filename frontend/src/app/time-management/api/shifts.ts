import {apiClient} from "./axios";
import { Shift } from "../types/shift";

export const getShifts = async (): Promise<Shift[]> => {
  const res = await apiClient.get("/shifts", { withCredentials: true });
  return res.data;
};

export const createShift = async (data: Partial<Shift>) => {
  return apiClient.post("/shifts", data, { withCredentials: true });
};

export const updateShift = async (id: string, data: Partial<Shift>) => {
  return apiClient.patch(`/shifts/${id}`, data, { withCredentials: true });
};

export const getShiftById = async (id: string): Promise<Shift> => {
  const res = await apiClient.get(`/shifts/${id}`, { withCredentials: true });
  return res.data;
};
