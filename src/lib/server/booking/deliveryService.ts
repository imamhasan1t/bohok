// BOHOK Phase 8 — Server Delivery & Escrow Release Transaction Service
// Atomic completion: 2nd OTP verification, parcel marked delivered, escrow payout release

import { serverDb } from '../db/memoryDb';
import { DbBooking } from '../db/dbTypes';
import { serverOtpService } from '../auth/otpService';
import { AuditLogger } from '../audit/auditLogger';
import { ServerNotificationService } from '../notifications/notificationService';
import { serverRealtimeBus } from '../realtime/realtimeBus';
import { AppErrors } from '../errors/appErrors';

export const ServerDeliveryService = {
  /**
   * Atomic Server Delivery Transaction:
   * 1. Verifies caller is assigned traveller
   * 2. Verifies booking status allows delivery
   * 3. Verifies 2nd OTP challenge (provided by recipient)
   * 4. Transitions booking -> DELIVERED
   * 5. Releases escrow payment -> RELEASED
   * 6. Updates sender and traveller profile stats
   * 7. Logs immutable audit and notifies both parties
   */
  verifyDeliveryAtomic(
    bookingId: string,
    travellerId: string,
    inputOtp: string,
    recipientNotes?: string
  ): DbBooking {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং পাওয়া যায়নি।');
    }

    // 1. Authorize: Only designated traveller can confirm delivery
    if (booking.travellerId !== travellerId) {
      throw AppErrors.forbidden(
        'Only the assigned traveller can confirm delivery',
        'কেবলমাত্র দায়িত্বপ্রাপ্ত সহযাত্রী ডেলিভারি সম্পন্ন করতে পারেন।'
      );
    }

    // 2. Validate current state
    const validStates: DbBooking['status'][] = ['IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERY_PENDING'];
    if (!validStates.includes(booking.status)) {
      throw AppErrors.invalidState(
        booking.status,
        'DELIVERED',
        'পার্সেল ট্রানজিট বা গন্তব্যে পৌঁছানো ব্যতীত ডেলিভারি নিশ্চিত করা সম্ভব নয়।'
      );
    }

    // 3. Verify Server-Side 2nd OTP Challenge
    serverOtpService.verifyChallenge(bookingId, 'DELIVERY', inputOtp);

    // 4. Atomic state updates
    const now = new Date().toISOString();
    booking.status = 'DELIVERED';
    booking.completedAt = now;

    const handover = serverDb.handovers.get(bookingId);
    if (handover) {
      handover.deliveryVerifiedAt = now;
      handover.travellerNotes = recipientNotes;
      handover.status = 'DELIVERED';
    }

    const parcel = serverDb.parcels.get(booking.parcelId);
    if (parcel) {
      parcel.status = 'DELIVERED';
    }

    // 5. Atomic Escrow Release
    const payment = serverDb.payments.get(bookingId);
    if (payment) {
      payment.status = 'RELEASED';
      payment.releasedAt = now;
    }

    // 6. Update user profile statistics
    const travellerProfile = serverDb.travellerProfiles.get(travellerId);
    if (travellerProfile) {
      travellerProfile.totalTripsCompleted += 1;
      travellerProfile.updatedAt = now;
    }

    const senderProfile = serverDb.senderProfiles.get(booking.senderId);
    if (senderProfile) {
      senderProfile.totalParcelsSent += 1;
      senderProfile.updatedAt = now;
    }

    // 7. Audit & Notifications
    AuditLogger.log({
      actorUserId: travellerId,
      entityType: 'booking',
      entityId: booking.id,
      eventType: 'DELIVERY_VERIFIED',
      metadata: { releasedAmount: booking.travellerFee },
    });

    AuditLogger.log({
      actorUserId: travellerId,
      entityType: 'payment',
      entityId: payment?.id || bookingId,
      eventType: 'PAYMENT_RELEASED',
      metadata: { payeeId: travellerId, amount: booking.travellerFee },
    });

    ServerNotificationService.dispatch({
      userId: booking.senderId,
      type: 'DELIVERY_COMPLETE',
      titleBn: 'পার্সেল সফলভাবে ডেলিভারি সম্পন্ন হয়েছে',
      bodyBn: 'প্রাপক পণ্য বুঝে পেয়েছেন এবং ২য় ওটিপি কোড দিয়ে ডেলিভারি নিশ্চিত করেছেন।',
      entityType: 'booking',
      entityId: booking.id,
    });

    ServerNotificationService.dispatch({
      userId: travellerId,
      type: 'PAYMENT_RELEASED',
      titleBn: 'আপনার ভাড়া অ্যাকাউন্টে যোগ হয়েছে',
      bodyBn: `ডেলিভারি সম্পন্ন হওয়ায় ৳${booking.travellerFee} টাকা আপনার অ্যাকাউন্টে ছাড় দেওয়া হয়েছে।`,
      entityType: 'booking',
      entityId: booking.id,
    });

    serverRealtimeBus.publish({
      type: 'DELIVERY_COMPLETED',
      bookingId: booking.id,
      userId: booking.senderId,
      titleBn: 'ডেলিভারি সম্পন্ন',
      messageBn: '২য় ওটিপি যাচাইয়ের মাধ্যমে পার্সেল সফলভাবে প্রাপকের কাছে পৌঁছেছে।',
      data: { bookingId: booking.id, status: 'DELIVERED', releasedFee: booking.travellerFee },
    });

    serverRealtimeBus.publish({
      type: 'PAYMENT_RELEASED',
      bookingId: booking.id,
      userId: travellerId,
      titleBn: 'পেমেন্ট রিলিজ হয়েছে',
      messageBn: `সহযাত্রীর ওয়ালেটে ৳${booking.travellerFee} যুক্ত হয়েছে।`,
      data: { bookingId: booking.id, amount: booking.travellerFee },
    });

    return booking;
  },
};
