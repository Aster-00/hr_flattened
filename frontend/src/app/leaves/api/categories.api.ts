// API functions for Leave Categories
import { leavesApiClient } from './leaves.client';

const CATEGORIES_BASE = '/leave-categories';

export interface LeaveCategory {
  _id: string;
  name: string;
  description?: string;
}

export async function getAllLeaveCategories(): Promise<LeaveCategory[]> {
  const { data } = await leavesApiClient.get<LeaveCategory[]>(CATEGORIES_BASE);
  return data;
}
