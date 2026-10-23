// BOHOK Phase 8 — Server Notification Dispatcher
// Dispatches localized in-app & transactional event notifications

import { serverDb } from '../db/memoryDb';
import { DbNotification } from '../db/dbTypes';

export type NotificationType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'PAYMENT_HELD'
  | 'TRAVELLER_ARRIVED'
  | 'HANDOVER_COMPLETE'
  | 'JOURNEY_STARTED'
  | 'DESTINATION_REACHED'
  | 'DELIVERY_COMPLETE'
  | 'PAYMENT_RELEASED'
  | 'DISPUTE_RAISED';

export const ServerNotificationService = {
  /**
   * Dispatches a localized notification to a user
   */
  dispatch(params: {
    userId: string;
    type: NotificationType;
    titleBn: string;
    bodyBn: string;
    entityType?: 'booking' | 'trip' | 'parcel' | 'dispute';
    entityId?: string;
  }): DbNotification {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const notif: DbNotification = {
      id,
      userId: params.userId,
      type: params.type,
      titleBn: params.titleBn,
      bodyBn: params.bodyBn,
      entityType: params.entityType,
      entityId: params.entityId,
      createdAt: now,
    };

    serverDb.notifications.set(id, notif);
    return notif;
  },

  /**
   * Retrieves all notifications for a specific user
   */
  getUserNotifications(userId: string): DbNotification[] {
    const list: DbNotification[] = [];
    for (const n of serverDb.notifications.values()) {
      if (n.userId === userId) {
        list.push(n);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Marks a notification as read
   */
  markAsRead(notificationId: string, userId: string): boolean {
    const notif = serverDb.notifications.get(notificationId);
    if (notif && notif.userId === userId) {
      notif.readAt = new Date().toISOString();
      return true;
    }
    return false;
  },
};
