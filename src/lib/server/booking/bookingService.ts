// BOHOK Phase 8 — Server Booking Lifecycle Service
// Executes atomic booking operations, capacity management, and escrow initiation

import { serverDb } from '../db/memoryDb';
import { DbBooking } from '../db/dbTypes';
import { serverOtpService } from '../auth/otpService';
import { AuditLogger } from '../audit/auditLogger';
import { ServerNotificationService } from '../notifications/notificationService';
import { serverRealtimeBus } from '../realtime/realtimeBus';
import { AppErrors } from '../errors/appErrors';

export const ServerBookingService = {
  /**
   * Atomic Booking Acceptance by Traveller:
   * 1. Validates traveller ownership and trip capacity
   * 2. Decrements capacity atomically
   * 3. Transitions state to ACCEPTED
   * 4. Pre-generates dual-OTP challenges securely on server
   * 5. Dispatches notifications & audit logs
   */
  acceptBookingAtomic(tripId: string, parcelId: string, travellerId: string): {
    booking: DbBooking;
    otp1PlainForSender: string;
    otp2PlainForRecipient: string;
  } {
    // 1. Run atomic DB transaction
    const { booking, trip, parcel } = serverDb.atomicAcceptBooking({
      parcelId,
      tripId,
      travellerId,
    });

    // 2. Generate Server-Side Salted OTP Challenges
    // OTP 1: for pickup handover (held by Sender)
    const { plainCode: otp1PlainForSender } = serverOtpService.createChallenge(
      booking.id,
      'HANDOVER'
    );

    // OTP 2: for delivery dropoff (held by Recipient)
    const { plainCode: otp2PlainForRecipient } = serverOtpService.createChallenge(
      booking.id,
      'DELIVERY'
    );

    // 3. Dispatch Notifications
    ServerNotificationService.dispatch({
      userId: parcel.senderId,
      type: 'BOOKING_ACCEPTED',
      titleBn: 'সহযাত্রী আপনার বুকিং গ্রহণ করেছেন',
      bodyBn: `সহযাত্রী যাত্রা #${trip.id.slice(-6)} পার্সেলটি বহনে সম্মতি দিয়েছেন। এসক্রো পেমেন্ট পরিশোধ করুন।`,
      entityType: 'booking',
      entityId: booking.id,
    });

    // 4. Audit Log
    AuditLogger.log({
      actorUserId: travellerId,
      entityType: 'booking',
      entityId: booking.id,
      eventType: 'BOOKING_ACCEPTED',
      metadata: { tripId, parcelId, travellerFee: booking.travellerFee },
    });

    // 5. Realtime Broadcast
    serverRealtimeBus.publish({
      type: 'BOOKING_ACCEPTED',
      bookingId: booking.id,
      userId: parcel.senderId,
      titleBn: 'বুকিং গৃহীত হয়েছে',
      messageBn: 'সহযাত্রী আপনার বুকিং অনুরোধ গ্রহণ করেছেন।',
      data: { bookingId: booking.id, status: booking.status },
    });

    return { booking, otp1PlainForSender, otp2PlainForRecipient };
  },

  /**
   * Hold payment in demo escrow
   */
  holdPayment(bookingId: string, senderId: string, method: 'bkash' | 'nagad' | 'card' | 'demo_escrow' = 'bkash'): DbBooking {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং পাওয়া যায়নি।');
    }
    if (booking.senderId !== senderId) {
      throw AppErrors.forbidden('Not the sender', 'কেবলমাত্র প্রেরক পেমেন্ট পরিশোধ করতে পারেন।');
    }

    if (booking.status !== 'ACCEPTED' && booking.status !== 'PAYMENT_PENDING') {
      throw AppErrors.invalidState(booking.status, 'PAYMENT_HELD');
    }

    // Update payment record
    const payment = serverDb.payments.get(bookingId);
    if (payment) {
      payment.status = 'HELD';
      payment.method = method;
      payment.heldAt = new Date().toISOString();
    }

    booking.status = 'PAYMENT_HELD';

    // Audit Log
    AuditLogger.log({
      actorUserId: senderId,
      entityType: 'payment',
      entityId: payment?.id || bookingId,
      eventType: 'PAYMENT_HELD',
      metadata: { amount: booking.totalAmount, method },
    });

    ServerNotificationService.dispatch({
      userId: booking.travellerId,
      type: 'PAYMENT_HELD',
      titleBn: 'এসক্রো পেমেন্ট জমা হয়েছে',
      bodyBn: `প্রেরক ৳${booking.totalAmount} জমা দিয়েছেন। নির্ধারিত সময়ে পিকআপ পয়েন্টে উপস্থিত থাকুন।`,
      entityType: 'booking',
      entityId: booking.id,
    });

    serverRealtimeBus.publish({
      type: 'PAYMENT_HELD',
      bookingId: booking.id,
      userId: booking.travellerId,
      titleBn: 'পেমেন্ট হোল্ড করা হয়েছে',
      messageBn: `৳${booking.totalAmount} এস্ক্রোতে নিরাপদে জমা হয়েছে।`,
      data: { bookingId: booking.id, amount: booking.totalAmount },
    });

    return booking;
  },

  /**
   * Start Journey (Enters IN_TRANSIT)
   */
  startJourney(bookingId: string, travellerId: string): DbBooking {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) throw AppErrors.notFound('Booking');
    if (booking.travellerId !== travellerId) throw AppErrors.forbidden();

    if (booking.status !== 'HANDED_OVER') {
      throw AppErrors.invalidState(booking.status, 'IN_TRANSIT', 'হস্তান্তর সম্পন্ন না হওয়া পর্যন্ত যাত্রা শুরু করা অসম্ভব।');
    }

    booking.status = 'IN_TRANSIT';

    AuditLogger.log({
      actorUserId: travellerId,
      entityType: 'booking',
      entityId: booking.id,
      eventType: 'JOURNEY_STARTED',
    });

    ServerNotificationService.dispatch({
      userId: booking.senderId,
      type: 'JOURNEY_STARTED',
      titleBn: 'পার্সেল নিয়ে যাত্রা শুরু হয়েছে',
      bodyBn: 'সহযাত্রী জাতীয় মহাসড়কে পার্সেল সহকারে গন্তব্যের উদ্দেশ্যে রওনা হয়েছেন।',
      entityType: 'booking',
      entityId: booking.id,
    });

    serverRealtimeBus.publish({
      type: 'IN_TRANSIT',
      bookingId: booking.id,
      userId: booking.senderId,
      titleBn: 'পার্সেল ট্রানজিটে রয়েছে',
      messageBn: 'সহযাত্রী পার্সেল নিয়ে জাতীয় মহাসড়কে যাত্রা শুরু করেছেন।',
      data: { bookingId: booking.id, status: 'IN_TRANSIT' },
    });

    return booking;
  },

  /**
   * Cancel booking (Restores capacity and refunds escrow)
   */
  cancelBooking(bookingId: string, actorUserId: string, reasonBn: string): DbBooking {
    const cancelled = serverDb.atomicCancelBooking(bookingId, actorUserId, reasonBn);

    AuditLogger.log({
      actorUserId,
      entityType: 'booking',
      entityId: bookingId,
      eventType: 'BOOKING_CANCELLED',
      metadata: { reasonBn },
    });

    // Notify other party
    const targetUserId = actorUserId === cancelled.senderId ? cancelled.travellerId : cancelled.senderId;
    ServerNotificationService.dispatch({
      userId: targetUserId,
      type: 'BOOKING_REQUESTED',
      titleBn: 'বুকিং বাতিল করা হয়েছে',
      bodyBn: `কারণ: ${reasonBn}`,
      entityType: 'booking',
      entityId: bookingId,
    });

    return cancelled;
  },
};
