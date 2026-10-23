// BOHOK Phase 8 — Server Dispute Service
// Freezes escrow releases and logs arbitration cases under a 24-hour resolution SLA

import { serverDb } from '../db/memoryDb';
import { DbDispute } from '../db/dbTypes';
import { ServerValidator } from '../validation/validator';
import { AuditLogger } from '../audit/auditLogger';
import { ServerNotificationService } from '../notifications/notificationService';
import { serverRealtimeBus } from '../realtime/realtimeBus';
import { AppErrors } from '../errors/appErrors';

export interface RaiseDisputeDto {
  category: DbDispute['category'];
  description: string;
}

export const ServerDisputeService = {
  raiseDispute(bookingId: string, callerUserId: string, dto: RaiseDisputeDto): DbDispute {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং পাওয়া যায়নি।');
    }

    // 1. Authorize: Only participants can dispute
    if (booking.senderId !== callerUserId && booking.travellerId !== callerUserId) {
      throw AppErrors.forbidden('Not a participant', 'আপনি এই বুকিংয়ের সাথে সংশ্লিষ্ট নন।');
    }

    const description = ServerValidator.validateRequiredString(
      dto.description,
      'description',
      'অভিযোগের বিবরণ'
    );

    const disputeId = `dsp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const dispute: DbDispute = {
      id: disputeId,
      bookingId,
      raisedByUserId: callerUserId,
      category: dto.category || 'other',
      description,
      status: 'OPEN',
      createdAt: now,
    };

    serverDb.disputes.set(disputeId, dispute);

    // Freeze booking state to DISPUTED
    booking.status = 'DISPUTED';
    booking.disputeReason = description;

    // Freeze escrow if held
    const payment = serverDb.payments.get(bookingId);
    if (payment && payment.status === 'HELD') {
      payment.status = 'FAILED'; // Escrow frozen
    }

    // Audit Log
    AuditLogger.log({
      actorUserId: callerUserId,
      entityType: 'dispute',
      entityId: disputeId,
      eventType: 'DISPUTE_CREATED',
      metadata: { bookingId, category: dto.category, description },
    });

    // Notify other party
    const targetUserId = callerUserId === booking.senderId ? booking.travellerId : booking.senderId;
    ServerNotificationService.dispatch({
      userId: targetUserId,
      type: 'DISPUTE_RAISED',
      titleBn: 'বুকিং সংক্রান্ত একটি বিরোধ দায়ের হয়েছে',
      bodyBn: `সমস্যা পর্যালোচনায় নথিভুক্ত হয়েছে। সাপোর্ট টিম ২৪ ঘণ্টার মধ্যে উভয় পক্ষের সাথে যোগাযোগ করবে।`,
      entityType: 'dispute',
      entityId: disputeId,
    });

    serverRealtimeBus.publish({
      type: 'DISPUTE_RAISED',
      bookingId: booking.id,
      userId: targetUserId,
      titleBn: 'বিরোধ উত্থাপিত হয়েছে',
      messageBn: 'বুকিংটিতে বিরোধ উত্থাপিত হওয়ায় পেমেন্ট সাময়িকভাবে স্থগিত করা হয়েছে।',
      data: { bookingId: booking.id, status: 'DISPUTED' },
    });

    return dispute;
  },
};
