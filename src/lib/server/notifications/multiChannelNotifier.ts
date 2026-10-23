// BOHOK Phase 9 — Multi-Channel Notification Dispatcher
// Dispatches notifications simultaneously to In-App, SMS, and Real-Time SSE

import { ServerNotificationService, NotificationType } from './notificationService';
import { serverSmsService } from '../sms/smsService';
import { serverRealtimeBus, RealtimeEventType } from '../realtime/realtimeBus';
import { NotificationTemplates, NotificationTemplateData } from './notificationTemplates';
import { serverDb } from '../db/memoryDb';

export interface DispatchNotificationOptions {
  userId: string;
  recipientPhone?: string;
  bookingId?: string;
  templateName: keyof typeof NotificationTemplates;
  data: NotificationTemplateData;
  channels?: Array<'in_app' | 'sms' | 'realtime'>;
}

export class MultiChannelNotifier {
  public static async dispatch(options: DispatchNotificationOptions): Promise<{
    inAppId?: string;
    smsSent: boolean;
    realtimeSent: boolean;
  }> {
    const channels = options.channels || ['in_app', 'sms', 'realtime'];
    const templateFn = NotificationTemplates[options.templateName];
    if (!templateFn) {
      throw new Error(`Unknown notification template: ${options.templateName}`);
    }

    const { titleBn, bodyBn, smsBn } = templateFn(options.data);
    let inAppId: string | undefined;
    let smsSent = false;
    let realtimeSent = false;

    // 1. In-App Notification
    if (channels.includes('in_app')) {
      const typeMap: Record<string, NotificationType> = {
        bookingRequested: 'BOOKING_REQUESTED',
        bookingAccepted: 'BOOKING_ACCEPTED',
        paymentHeld: 'PAYMENT_HELD',
        handoverOtp: 'TRAVELLER_ARRIVED',
        handoverConfirmed: 'HANDOVER_COMPLETE',
        approachingDestination: 'DESTINATION_REACHED',
        deliveryOtp: 'DELIVERY_COMPLETE',
        deliveryConfirmed: 'DELIVERY_COMPLETE',
        payoutReleased: 'PAYMENT_RELEASED',
        disputeRaised: 'DISPUTE_RAISED',
      };
      const notifType: NotificationType = typeMap[options.templateName] || 'BOOKING_ACCEPTED';

      const inApp = ServerNotificationService.dispatch({
        userId: options.userId,
        type: notifType,
        titleBn,
        bodyBn,
        entityType: 'booking',
        entityId: options.bookingId,
      });
      inAppId = inApp.id;
    }

    // 2. SMS Notification
    if (channels.includes('sms')) {
      let phone = options.recipientPhone;
      if (!phone) {
        const user = serverDb.users.get(options.userId);
        phone = user?.phone;
      }

      if (phone) {
        const res = await serverSmsService.sendTransactionAlert(
          phone,
          smsBn,
          'BOOKING_ALERT'
        );
        smsSent = res.success;
      }
    }

    // 3. Real-Time SSE Event Broadcast
    if (channels.includes('realtime') && options.bookingId) {
      serverRealtimeBus.publish({
        type: 'IN_TRANSIT' as RealtimeEventType,
        bookingId: options.bookingId,
        userId: options.userId,
        titleBn,
        messageBn: bodyBn,
        data: { templateName: options.templateName },
      });
      realtimeSent = true;
    }

    return { inAppId, smsSent, realtimeSent };
  }
}
