import {apiClient} from "./axios";
import { Notification } from '../types/Notification';

export const getMyNotifications = async (): Promise<Notification[]> => {
  const res = await apiClient.get('/notifications');
  return res.data;
};
