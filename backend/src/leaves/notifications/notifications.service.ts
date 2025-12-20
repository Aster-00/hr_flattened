// src/leaves/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  // In-memory storage for testing (replace with DB later when schema is allowed)
  private notifications: any[] = [];
  private idCounter = 1;

  // Basic CRUD: create a notification log entry
  async create(dto: any) {
    const created = {
      _id: String(this.idCounter++),
      ...dto,
      createdAt: new Date(),
    };
    this.notifications.push(created);
    return created;
  }

  // List all notifications
  async findAll() {
    return this.notifications;
  }

  // Get single notification by id
  async findOne(id: string) {
    const notif = this.notifications.find((n) => n._id === id);
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    return notif;
  }

  // Update notification (e.g., marking as read or editing message)
  async update(id: string, dto: any) {
    const index = this.notifications.findIndex((n) => n._id === id);
    if (index === -1) {
      throw new NotFoundException('Notification not found');
    }
    this.notifications[index] = {
      ...this.notifications[index],
      ...dto,
    };
    return this.notifications[index];
  }

  // Delete notification
  async delete(id: string) {
    const index = this.notifications.findIndex((n) => n._id === id);
    if (index === -1) {
      throw new NotFoundException('Notification not found');
    }
    const deleted = this.notifications.splice(index, 1)[0];
    return deleted;
  }

  // Convenience helper for other services (Requests/Tracking)
  async emitForUser(
    receiverId: string,
    title: string,
    message: string,
    extra?: Record<string, any>,
  ) {
    const created = {
      _id: String(this.idCounter++),
      receiverId,
      title,
      message,
      meta: extra ?? {},
      createdAt: new Date(),
    };
    this.notifications.push(created);
    console.log(`[Notification] User: ${receiverId}, Title: ${title}, Message: ${message}`);
    return created;
  }
}
