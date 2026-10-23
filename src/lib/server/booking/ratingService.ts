// BOHOK Phase 8 — Server Rating & Reputation Service
// Manages two-sided 1-5 star ratings and updates verified user trust scores

import { serverDb } from '../db/memoryDb';
import { DbRating } from '../db/dbTypes';
import { ServerValidator } from '../validation/validator';
import { AuditLogger } from '../audit/auditLogger';
import { AppErrors } from '../errors/appErrors';

export interface SubmitRatingDto {
  score: number;
  careScore?: number;
  speedScore?: number;
  communicationScore?: number;
  comment?: string;
}

export const ServerRatingService = {
  submitRating(bookingId: string, callerUserId: string, dto: SubmitRatingDto): DbRating {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং পাওয়া যায়নি।');
    }

    // 1. Authorize: Only sender or traveller can rate
    if (booking.senderId !== callerUserId && booking.travellerId !== callerUserId) {
      throw AppErrors.forbidden('Not a participant', 'আপনি এই বুকিংয়ের অংশগ্রহণকারী নন।');
    }

    // 2. Condition: Rating only allowed on completed bookings
    if (booking.status !== 'DELIVERED') {
      throw AppErrors.invalidState(
        booking.status,
        'RATED',
        'ডেলিভারি সম্পন্ন হওয়া ব্যতীত রেটিং প্রদান করা অসম্ভব।'
      );
    }

    // 3. Validate score
    const score = ServerValidator.validateRating(dto.score);
    const isSender = callerUserId === booking.senderId;
    const toUserId = isSender ? booking.travellerId : booking.senderId;
    const role = isSender ? 'sender' : 'traveller';

    // 4. Check duplicate rating from same user on this booking
    for (const r of serverDb.ratings.values()) {
      if (r.bookingId === bookingId && r.fromUserId === callerUserId) {
        throw AppErrors.validationError(
          'bookingId',
          'User has already submitted a rating for this booking',
          'আপনি ইতিমধ্যে এই বুকিংয়ের জন্য আপনার মূল্যায়ন সম্পন্ন করেছেন।'
        );
      }
    }

    const ratingId = `rt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const rating: DbRating = {
      id: ratingId,
      bookingId,
      fromUserId: callerUserId,
      toUserId,
      role,
      score,
      careScore: dto.careScore,
      speedScore: dto.speedScore,
      communicationScore: dto.communicationScore,
      comment: dto.comment,
      createdAt: now,
    };

    serverDb.ratings.set(ratingId, rating);

    // 5. Update recipient average rating
    if (isSender) {
      const travellerProfile = serverDb.travellerProfiles.get(toUserId);
      if (travellerProfile) {
        const allTravellerRatings: number[] = [];
        for (const r of serverDb.ratings.values()) {
          if (r.toUserId === toUserId && r.role === 'sender') {
            allTravellerRatings.push(r.score);
          }
        }
        const avg = allTravellerRatings.reduce((a, b) => a + b, 0) / allTravellerRatings.length;
        travellerProfile.ratingAvg = Math.round(avg * 100) / 100;
        travellerProfile.updatedAt = now;
      }
    }

    AuditLogger.log({
      actorUserId: callerUserId,
      entityType: 'booking',
      entityId: bookingId,
      eventType: 'BOOKING_CREATED', // Rating event
      metadata: { score, toUserId },
    });

    return rating;
  },
};
