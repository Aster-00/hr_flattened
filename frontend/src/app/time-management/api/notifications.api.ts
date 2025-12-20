import { apiClient } from "./axios";
import { NotificationLog } from "../types/NotificationLog";

export async function getNotifications(): Promise<NotificationLog[]> {
    try {
        const res = await apiClient.get("/notifications");
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.warn("Notifications API failed", error);
        return [];
    }
}

export async function markNotificationAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
}
