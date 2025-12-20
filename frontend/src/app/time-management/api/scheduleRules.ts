import {apiClient} from "./axios";
import { ScheduleRule } from "../types/ScheduleRule";

/**
 * Get all schedule rules
 */
export const getScheduleRules = async (): Promise<ScheduleRule[]> => {
  const res = await apiClient.get("/schedule-rules");
  return res.data;
};

/**
 * Get single schedule rule by ID
 */
export const getScheduleRuleById = async (
  id: string
): Promise<ScheduleRule> => {
  const res = await apiClient.get(`/schedule-rules/${id}`);
  return res.data;
};

/**
 * Create schedule rule
 */
export const createScheduleRule = async (data: {
  name: string;
  pattern: string;
  active: boolean;
}): Promise<ScheduleRule> => {
  const res = await apiClient.post("/schedule-rules", data);
  return res.data;
};

/**
 * Update schedule rule
 */
export const updateScheduleRule = async (
  id: string,
  data: {
    name: string;
    pattern: string;
    active: boolean;
  }
): Promise<ScheduleRule> => {
  const res = await apiClient.patch(`/schedule-rules/${id}`, data);
  return res.data;
};
