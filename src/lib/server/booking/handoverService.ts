// BOHOK Phase 8 — Server Handover Transaction Service
// Verifies traveller authorization, 4-point safety checklist, and 1st OTP challenge

import { serverDb } from '../db/memoryDb';
import { DbBooking } from '../db/dbTypes';
import { serverOtpService } from '../auth/otpService';
import { AuditLogger } from '../audit/auditLogger';
import { ServerNotificationService } from '../notifications/notificationService';
import { serverRealtimeBus } from '../realtime/realtimeBus';
import { AppErrors } from '../errors/appErrors';

export interface HandoverChecklistDto {
  packageInspected: boolean;
  noProhibitedItems: boolean;
  recipientPhoneConfirmed: boolean;
  weightWithinLimit: boolean;
}

export const ServerHandoverService = {
  /**
   * Atomic Server Handover Transaction:
   * Only the authenticated traveller can execute this operation.
   */
  verifyHandoverAtomic(
    bookingId: string,
    travellerId: string,
    inputOtp: string,
    checklist: HandoverChecklistDto
  ): DbBooking {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং পাওয়া যায়নি।');
    }

    // 1. Authorize: Only designated traveller can confirm handover
    if (booking.travellerId !== travellerId) {
      throw AppErrors.forbidden(
        'Only the assigned traveller can verify handover',
        'কেবলমাত্র দায়িত্বপ্রাপ্ত সহযাত্রী পার্সেল হস্তান্তর নিশ্চিত করতে পারেন।'
      );
    }

    // 2. Validate current state
    const validStates: DbBooking['status'][] = ['PAYMENT_HELD', 'READY_FOR_PICKUP', 'TRAVELLER_ARRIVED', 'HANDOVER_PENDING'];
    if (!validStates.includes(booking.status)) {
      throw AppErrors.invalidState(
        booking.status,
        'HANDED_OVER',
        'পেমেন্ট সুরক্ষিত থাকা সাপেক্ষে কেবলমাত্র পিকআপ অবস্থায় হস্তান্তর যাচাই সম্ভব।'
      );
    }

    // 3. Validate 4-point safety checklist
    if (
      !checklist.packageInspected ||
      !checklist.noProhibitedItems ||
      !checklist.recipientPhoneConfirmed ||
      !checklist.weightWithinLimit
    ) {
      throw AppErrors.validationError(
        'checklist',
        'All 4 safety checklist items must be confirmed',
        'হ্যান্ডওভার সম্পন্ন করার পূর্বে ৪টি নিরাপত্তা শর্তই পূরণ করা আবশ্যক।'
      );
    }

    // 4. Verify Server-Side OTP Challenge
    serverOtpService.verifyChallenge(bookingId, 'HANDOVER', inputOtp);

    // 5. Atomic state update
    booking.status = 'HANDED_OVER';

    const handover = serverDb.handovers.get(bookingId);
    if (handover) {
      handover.packageInspected = checklist.packageInspected;
      handover.noProhibitedItems = checklist.noProhibitedItems;
      handover.recipientPhoneConfirmed = checklist.recipientPhoneConfirmed;
      handover.weightWithinLimit = checklist.weightWithinLimit;
      handover.pickupVerifiedAt = new Date().toISOString();
      handover.status = 'HANDED_OVER';
    }

    const parcel = serverDb.parcels.get(booking.parcelId);
    if (parcel) {
      parcel.status = 'IN_TRANSIT';
    }

    // 6. Audit & Notification
    AuditLogger.log({
      actorUserId: travellerId,
      entityType: 'booking',
      entityId: booking.id,
      eventType: 'HANDOVER_VERIFIED',
      metadata: { checklistVerified: true },
    });

    ServerNotificationService.dispatch({
      userId: booking.senderId,
      type: 'HANDOVER_COMPLETE',
      titleBn: '১ম ওটিপি যাচাই ও পার্সেল হস্তান্তর সম্পন্ন',
      bodyBn: 'সহযাত্রী পার্সেল বুঝে নিয়েছেন এবং নিরাপদে যাত্রা শুরু করছেন।',
      entityType: 'booking',
      entityId: booking.id,
    });

    serverRealtimeBus.publish({
      type: 'PARCEL_PICKED_UP',
      bookingId: booking.id,
      userId: booking.senderId,
      titleBn: 'পার্সেল হস্তান্তর সফল',
      messageBn: '১ম ওটিপি যাচাইয়ের মাধ্যমে পার্সেল সহযাত্রীর কাছে হস্তান্তর করা হয়েছে।',
      data: { bookingId: booking.id, status: 'HANDED_OVER' },
    });

    return booking;
  },
};
