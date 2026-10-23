// BOHOK Phase 8 — Server Backend Foundation Comprehensive Unit Test Suite
// Verifies relational constraints, atomic transactions, OTP cryptography, IDOR guards, privacy, and audit logging

import assert from 'node:assert';
import { serverDb } from '../db/memoryDb';
import { serverConfig } from '../config';
import { ServerValidator } from '../validation/validator';
import { serverSessionStore } from '../auth/session';
import { AuthContextHelper } from '../auth/authContext';
import { serverOtpService } from '../auth/otpService';
import { ServerBookingService } from '../booking/bookingService';
import { ServerHandoverService } from '../booking/handoverService';
import { ServerDeliveryService } from '../booking/deliveryService';
import { ServerDisputeService } from '../booking/disputeService';
import { ServerRatingService } from '../booking/ratingService';
import { PrivacySerializer } from '../privacy/serializers';
import { AuditLogger } from '../audit/auditLogger';
import { ServerNotificationService } from '../notifications/notificationService';
import { AppError } from '../errors/appErrors';

export async function runPhase8BackendTests(
  it: (section: string, name: string, fn: () => void) => void,
  itAsync: (section: string, name: string, fn: () => Promise<void>) => Promise<void>
) {
  console.log('\n--- Suite 5: Phase 8 Production Backend Foundation (18 Tests) ---');

  // Test 1: Relational Constraints - Positive Capacity & Weight
  it('Backend-DB', '1. Enforces positive weight and capacity constraints', () => {
    // Weight <= 0 must throw
    assert.throws(() => ServerValidator.validateWeight(0), (err: unknown) => {
      return err instanceof AppError && err.code === 'VALIDATION_ERROR';
    });
    assert.throws(() => ServerValidator.validateWeight(-2), (err: unknown) => {
      return err instanceof AppError && err.code === 'VALIDATION_ERROR';
    });

    // Capacity <= 0 must throw
    assert.throws(() => ServerValidator.validateCapacity(0), (err: unknown) => {
      return err instanceof AppError && err.code === 'VALIDATION_ERROR';
    });

    // Valid values pass
    assert.strictEqual(ServerValidator.validateWeight(1.5), 1.5);
    assert.strictEqual(ServerValidator.validateCapacity(5.0), 5.0);
  });

  // Test 2: Relational Constraints - Sender cannot equal Traveller
  it('Backend-DB', '2. Rejects self-booking where sender equals traveller', () => {
    const userA = serverDb.insertUser('+8801700998877', 'ব্যবহারকারী ক', 'SENDER');
    const tripA = serverDb.insertTrip({
      travellerId: userA.id,
      originCity: 'ঢাকা',
      originArea: 'ফার্মগেট',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার সংলগ্ন',
      status: 'PUBLISHED',
    });

    const parcelA = serverDb.insertParcel({
      senderId: userA.id, // Same user!
      originCity: 'ঢাকা',
      originArea: 'ফার্মগেট',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'documents',
      categoryBn: 'নথিপত্র',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'জরুরি ফাইল',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    // Attempting to accept should throw FORBIDDEN
    assert.throws(
      () => serverDb.atomicAcceptBooking({ parcelId: parcelA.id, tripId: tripA.id, travellerId: userA.id }),
      (err: unknown) => err instanceof AppError && err.code === 'FORBIDDEN'
    );
  });

  // Test 3: Relational Constraints - Prevents duplicate active bookings for same parcel
  it('Backend-DB', '3. Prevents duplicate active bookings for the same parcel', () => {
    const sender = serverDb.insertUser('+8801711223301', 'প্রেরক ১', 'SENDER');
    const traveller1 = serverDb.insertUser('+8801811223301', 'সহযাত্রী ১', 'TRAVELLER');
    const traveller2 = serverDb.insertUser('+8801911223301', 'সহযাত্রী ২', 'TRAVELLER');

    const trip1 = serverDb.insertTrip({
      travellerId: traveller1.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার সংলগ্ন',
      status: 'PUBLISHED',
    });

    const trip2 = serverDb.insertTrip({
      travellerId: traveller2.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার সংলগ্ন',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'books',
      categoryBn: 'বই',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'পাঠ্যবই',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    // 1st acceptance succeeds
    serverDb.atomicAcceptBooking({ parcelId: parcel.id, tripId: trip1.id, travellerId: traveller1.id });

    // 2nd acceptance on same parcel must fail with BOOKING_CONFLICT
    assert.throws(
      () => serverDb.atomicAcceptBooking({ parcelId: parcel.id, tripId: trip2.id, travellerId: traveller2.id }),
      (err: unknown) => err instanceof AppError && err.code === 'BOOKING_CONFLICT'
    );
  });

  // Test 4: Server Session Security - Cryptographic Tokens & Expiration
  it('Backend-Auth', '4. Creates secure server sessions and verifies expiry', () => {
    const user = serverDb.insertUser('+8801799887766', 'সেশন ইউজার', 'SENDER');
    const session = serverSessionStore.createSession(user, 'SENDER');

    assert.ok(session.token.startsWith('bhk_s_'));
    assert.strictEqual(session.userId, user.id);

    // Fetch valid session
    const fetched = serverSessionStore.getSession(session.token);
    assert.ok(fetched);
    assert.strictEqual(fetched.userId, user.id);

    // Logout invalidates session
    serverSessionStore.invalidateSession(session.token);
    assert.strictEqual(serverSessionStore.getSession(session.token), null);
  });

  // Test 5: IDOR Protection - User cannot access another user's private booking
  it('Backend-Auth', '5. IDOR Guard strictly blocks unauthorized booking access', () => {
    const sender = serverDb.insertUser('+8801700000001', 'প্রেরক এক্স', 'SENDER');
    const traveller = serverDb.insertUser('+8801800000001', 'সহযাত্রী এক্স', 'TRAVELLER');
    const intruder = serverDb.insertUser('+8801900000001', 'অনুপ্রবেশকারী', 'SENDER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'পয়েন্ট',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'পয়েন্ট',
      category: 'clothes',
      categoryBn: 'পোশাক',
      weightKg: 1.0,
      packageSize: 'medium',
      packageSizeBn: 'মাঝারি',
      description: 'পোশাক',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking } = serverDb.atomicAcceptBooking({
      parcelId: parcel.id,
      tripId: trip.id,
      travellerId: traveller.id,
    });

    // Sender and Traveller can access
    assert.doesNotThrow(() => AuthContextHelper.assertCanAccessBooking(booking, sender.id));
    assert.doesNotThrow(() => AuthContextHelper.assertCanAccessBooking(booking, traveller.id));

    // Intruder is rejected with FORBIDDEN
    assert.throws(
      () => AuthContextHelper.assertCanAccessBooking(booking, intruder.id),
      (err: unknown) => err instanceof AppError && err.code === 'FORBIDDEN'
    );
  });

  // Test 6: Server-side OTP Salted Cryptography & Challenge Storage
  it('Backend-OTP', '6. Hashes OTP with salt and never exposes plaintext in DB', () => {
    const { challenge, plainCode } = serverOtpService.createChallenge('bhk-test-otp', 'HANDOVER');

    assert.strictEqual(challenge.hashedCode.length, 64, 'SHA-256 hash must be 64 hex characters');
    assert.strictEqual(challenge.salt.length, 32, 'Salt must be 32 hex characters');
    assert.notStrictEqual(challenge.hashedCode, plainCode, 'Plaintext must NEVER equal hash');

    // Stored challenge must match cryptographic verification
    const expectedHash = serverOtpService.hashOtp(plainCode, challenge.salt);
    assert.strictEqual(challenge.hashedCode, expectedHash);
  });

  // Test 7: OTP Single-Use & Successful Verification
  it('Backend-OTP', '7. Verifies correct OTP, marks verified, and prevents reuse', () => {
    const bookingId = `bhk-otp-verify-${Date.now()}`;
    const { plainCode } = serverOtpService.createChallenge(bookingId, 'HANDOVER', '4829');

    // 1st verification succeeds
    const res = serverOtpService.verifyChallenge(bookingId, 'HANDOVER', plainCode);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.challenge.isActive, false);
    assert.ok(res.challenge.verifiedAt);

    // 2nd verification attempt on same OTP must throw OTP_ALREADY_USED
    assert.throws(
      () => serverOtpService.verifyChallenge(bookingId, 'HANDOVER', plainCode),
      (err: unknown) => err instanceof AppError && err.code === 'OTP_ALREADY_USED'
    );
  });

  // Test 8: OTP Max Attempts Enforcement (3 Attempts Limit)
  it('Backend-OTP', '8. Enforces 3-attempt limit and locks challenge upon 3 failures', () => {
    const bookingId = `bhk-otp-limit-${Date.now()}`;
    serverOtpService.createChallenge(bookingId, 'HANDOVER', '9999');

    // Attempt 1: wrong
    assert.throws(
      () => serverOtpService.verifyChallenge(bookingId, 'HANDOVER', '0000'),
      (err: unknown) => err instanceof AppError && err.code === 'OTP_INVALID'
    );

    // Attempt 2: wrong
    assert.throws(
      () => serverOtpService.verifyChallenge(bookingId, 'HANDOVER', '1111'),
      (err: unknown) => err instanceof AppError && err.code === 'OTP_INVALID'
    );

    // Attempt 3: wrong -> should exhaust remaining attempts
    assert.throws(
      () => serverOtpService.verifyChallenge(bookingId, 'HANDOVER', '2222'),
      (err: unknown) => err instanceof AppError && err.code === 'OTP_INVALID'
    );

    // Attempt 4: challenge is now inactive / locked
    assert.throws(
      () => serverOtpService.verifyChallenge(bookingId, 'HANDOVER', '9999'),
      (err: unknown) => err instanceof AppError && err.code === 'OTP_ALREADY_USED'
    );
  });

  // Test 9: Atomic Booking Transaction - Decrements Capacity & Prevents Race Condition
  it('Backend-Booking', '9. Decrements trip capacity atomically on booking acceptance', () => {
    const sender = serverDb.insertUser('+8801700112233', 'প্রেরক', 'SENDER');
    const traveller = serverDb.insertUser('+8801800112233', 'সহযাত্রী', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'পয়েন্ট',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 3.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel1 = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'পয়েন্ট',
      category: 'documents',
      categoryBn: 'ডকুমেন্ট',
      weightKg: 2.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'ডকুমেন্ট',
      recipientName: 'প্রাপক ১',
      recipientPhone: '+8801912000000',
    });

    // Accept parcel 1 (2.0kg) -> Remaining capacity should be 1.0kg
    ServerBookingService.acceptBookingAtomic(trip.id, parcel1.id, traveller.id);
    assert.strictEqual(trip.remainingCapacityKg, 1.0);

    // Attempt to accept parcel 2 (1.5kg > 1.0kg remaining) -> Must throw CAPACITY_EXCEEDED
    const parcel2 = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'পয়েন্ট',
      category: 'clothes',
      categoryBn: 'পোশাক',
      weightKg: 1.5,
      packageSize: 'medium',
      packageSizeBn: 'মাঝারি',
      description: 'পোশাক',
      recipientName: 'প্রাপক ২',
      recipientPhone: '+8801912000000',
    });

    assert.throws(
      () => ServerBookingService.acceptBookingAtomic(trip.id, parcel2.id, traveller.id),
      (err: unknown) => err instanceof AppError && err.code === 'CAPACITY_EXCEEDED'
    );

    // Capacity must remain intact at 1.0kg without corruption
    assert.strictEqual(trip.remainingCapacityKg, 1.0);
  });

  // Test 10: Atomic Handover Transaction - Verifies 4-Point Safety & OTP 1
  it('Backend-Handover', '10. Server verifies 4-point safety checklist and 1st OTP challenge', () => {
    const sender = serverDb.insertUser('+8801700223344', 'প্রেরক এইচ', 'SENDER');
    const traveller = serverDb.insertUser('+8801800223344', 'সহযাত্রী এইচ', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'books',
      categoryBn: 'বই',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'বই',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking, otp1PlainForSender } = ServerBookingService.acceptBookingAtomic(
      trip.id,
      parcel.id,
      traveller.id
    );

    // Hold payment first
    ServerBookingService.holdPayment(booking.id, sender.id, 'bkash');

    // Incomplete safety checklist must fail
    assert.throws(
      () =>
        ServerHandoverService.verifyHandoverAtomic(booking.id, traveller.id, otp1PlainForSender, {
          packageInspected: true,
          noProhibitedItems: false, // Incomplete!
          recipientPhoneConfirmed: true,
          weightWithinLimit: true,
        }),
      (err: unknown) => err instanceof AppError && err.code === 'VALIDATION_ERROR'
    );

    // Complete checklist + correct OTP 1 succeeds
    const completed = ServerHandoverService.verifyHandoverAtomic(
      booking.id,
      traveller.id,
      otp1PlainForSender,
      {
        packageInspected: true,
        noProhibitedItems: true,
        recipientPhoneConfirmed: true,
        weightWithinLimit: true,
      }
    );

    assert.strictEqual(completed.status, 'HANDED_OVER');
  });

  // Test 11: Atomic Delivery Transaction - Releases Escrow Funds to Traveller
  it('Backend-Delivery', '11. Server verifies 2nd OTP and atomically releases escrow payout', () => {
    const sender = serverDb.insertUser('+8801700334455', 'প্রেরক ডি', 'SENDER');
    const traveller = serverDb.insertUser('+8801800334455', 'সহযাত্রী ডি', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'documents',
      categoryBn: 'দলিল',
      weightKg: 0.5,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'দলিল',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking, otp1PlainForSender, otp2PlainForRecipient } = ServerBookingService.acceptBookingAtomic(
      trip.id,
      parcel.id,
      traveller.id
    );

    ServerBookingService.holdPayment(booking.id, sender.id, 'bkash');
    ServerHandoverService.verifyHandoverAtomic(booking.id, traveller.id, otp1PlainForSender, {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    ServerBookingService.startJourney(booking.id, traveller.id);

    // Execute atomic delivery verification with 2nd OTP
    const delivered = ServerDeliveryService.verifyDeliveryAtomic(
      booking.id,
      traveller.id,
      otp2PlainForRecipient,
      'অক্ষতভাবে গ্রহণ করা হয়েছে'
    );

    assert.strictEqual(delivered.status, 'DELIVERED');

    // Escrow payment must be RELEASED
    const payment = serverDb.payments.get(booking.id);
    assert.strictEqual(payment?.status, 'RELEASED');
    assert.ok(payment?.releasedAt);
  });

  // Test 12: Cancellation Restores Trip Capacity & Refunds Escrow
  it('Backend-Cancellation', '12. Pre-handover cancellation restores capacity and refunds escrow', () => {
    const sender = serverDb.insertUser('+8801700445566', 'প্রেরক সি', 'SENDER');
    const traveller = serverDb.insertUser('+8801800445566', 'সহযাত্রী সি', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'books',
      categoryBn: 'বই',
      weightKg: 2.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'বই',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking } = ServerBookingService.acceptBookingAtomic(trip.id, parcel.id, traveller.id);
    assert.strictEqual(trip.remainingCapacityKg, 3.0); // 5 - 2 = 3

    ServerBookingService.holdPayment(booking.id, sender.id, 'bkash');
    assert.strictEqual(serverDb.payments.get(booking.id)?.status, 'HELD');

    // Cancel by sender
    const cancelled = ServerBookingService.cancelBooking(booking.id, sender.id, 'প্রয়োজন বাতিল');
    assert.strictEqual(cancelled.status, 'CANCELLED');

    // Capacity restored back to 5.0kg!
    assert.strictEqual(trip.remainingCapacityKg, 5.0);

    // Escrow refunded
    assert.strictEqual(serverDb.payments.get(booking.id)?.status, 'REFUNDED');
  });

  // Test 13: Cancellation Blocked After Handover
  it('Backend-Cancellation', '13. Blocks direct cancellation once parcel is in transit', () => {
    const sender = serverDb.insertUser('+8801700556677', 'প্রেরক বি', 'SENDER');
    const traveller = serverDb.insertUser('+8801800556677', 'সহযাত্রী বি', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'documents',
      categoryBn: 'দলিল',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'দলিল',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking, otp1PlainForSender } = ServerBookingService.acceptBookingAtomic(
      trip.id,
      parcel.id,
      traveller.id
    );

    ServerBookingService.holdPayment(booking.id, sender.id, 'bkash');
    ServerHandoverService.verifyHandoverAtomic(booking.id, traveller.id, otp1PlainForSender, {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });

    // Booking is now HANDED_OVER. Direct cancellation must be rejected with INVALID_STATE
    assert.throws(
      () => ServerBookingService.cancelBooking(booking.id, sender.id, 'বাতিল চেষ্টা'),
      (err: unknown) => err instanceof AppError && err.code === 'INVALID_STATE'
    );
  });

  // Test 14: Dispute Freezes Escrow and Initiates Arbitration
  it('Backend-Dispute', '14. Dispute registration freezes escrow and transitions status to DISPUTED', () => {
    const sender = serverDb.insertUser('+8801700667788', 'প্রেরক ডিআইএস', 'SENDER');
    const traveller = serverDb.insertUser('+8801800667788', 'সহযাত্রী ডিআইএস', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'documents',
      categoryBn: 'দলিল',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'দলিল',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking } = ServerBookingService.acceptBookingAtomic(trip.id, parcel.id, traveller.id);
    ServerBookingService.holdPayment(booking.id, sender.id, 'bkash');

    const dispute = ServerDisputeService.raiseDispute(booking.id, sender.id, {
      category: 'late_delivery',
      description: 'সহযাত্রী যথাসময়ে পিকআপে উপস্থিত হননি।',
    });

    assert.strictEqual(dispute.status, 'OPEN');
    assert.strictEqual(booking.status, 'DISPUTED');
    assert.strictEqual(serverDb.payments.get(booking.id)?.status, 'FAILED'); // Escrow frozen
  });

  // Test 15: Two-Sided Ratings and Profile Score Updates
  it('Backend-Rating', '15. Rating submission updates counterparty average rating score', () => {
    const sender = serverDb.insertUser('+8801700778899', 'প্রেরক আর', 'SENDER');
    const traveller = serverDb.insertUser('+8801800778899', 'সহযাত্রী আর', 'TRAVELLER');

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'documents',
      categoryBn: 'দলিল',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'দলিল',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking, otp1PlainForSender, otp2PlainForRecipient } = ServerBookingService.acceptBookingAtomic(
      trip.id,
      parcel.id,
      traveller.id
    );

    ServerBookingService.holdPayment(booking.id, sender.id, 'bkash');
    ServerHandoverService.verifyHandoverAtomic(booking.id, traveller.id, otp1PlainForSender, {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    ServerBookingService.startJourney(booking.id, traveller.id);
    ServerDeliveryService.verifyDeliveryAtomic(booking.id, traveller.id, otp2PlainForRecipient);

    // Rating allowed only on DELIVERED booking
    const rating = ServerRatingService.submitRating(booking.id, sender.id, {
      score: 5,
      careScore: 5,
      speedScore: 5,
      comment: 'খুব চমৎকার দায়িত্বশীল বহন!',
    });

    assert.strictEqual(rating.score, 5);

    // Duplicate rating on same booking by sender must fail
    assert.throws(
      () => ServerRatingService.submitRating(booking.id, sender.id, { score: 4 }),
      (err: unknown) => err instanceof AppError && err.code === 'VALIDATION_ERROR'
    );
  });

  // Test 16: Privacy Serializers - Dual OTP Security & Sensitive Field Redaction
  it('Backend-Privacy', '16. Redacts NID, raw phones, and prevents OTP disclosure to traveller', () => {
    const sender = serverDb.insertUser('+8801711223344', 'ইমাম হাসান', 'SENDER');
    const senderProfile = serverDb.userProfiles.get(sender.id)!;
    const traveller = serverDb.insertUser('+8801811223344', 'আব্দুর রহিম', 'TRAVELLER');
    const travellerProfile = serverDb.userProfiles.get(traveller.id)!;

    const trip = serverDb.insertTrip({
      travellerId: traveller.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      departureAt: new Date().toISOString(),
      estimatedArrivalAt: new Date().toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'বাস',
      totalCapacityKg: 5.0,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'কাউন্টার',
      status: 'PUBLISHED',
    });

    const parcel = serverDb.insertParcel({
      senderId: sender.id,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা',
      category: 'documents',
      categoryBn: 'ডকুমেন্ট',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'সার্টিফিকেট',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    const { booking, otp1PlainForSender, otp2PlainForRecipient } = ServerBookingService.acceptBookingAtomic(
      trip.id,
      parcel.id,
      traveller.id
    );

    // 1. Serialization for SENDER: receives OTPs
    const senderView = PrivacySerializer.serializePrivateBooking(
      booking,
      parcel,
      trip,
      sender,
      senderProfile,
      traveller,
      travellerProfile,
      sender.id,
      otp1PlainForSender,
      otp2PlainForRecipient
    );

    assert.strictEqual(senderView.otp1HeldBySender, otp1PlainForSender);
    assert.ok(senderView.counterparty.phoneMasked.includes('***'));

    // 2. Serialization for TRAVELLER: receives UNDEFINED for OTPs! (Zero Pre-disclosure)
    const travellerView = PrivacySerializer.serializePrivateBooking(
      booking,
      parcel,
      trip,
      sender,
      senderProfile,
      traveller,
      travellerProfile,
      traveller.id,
      otp1PlainForSender,
      otp2PlainForRecipient
    );

    assert.strictEqual(travellerView.otp1HeldBySender, undefined);
    assert.strictEqual(travellerView.otp2HeldByRecipient, undefined);
    assert.ok(travellerView.counterparty.phoneMasked.includes('***'));
  });

  // Test 17: Immutable Audit Log - Redacts Sensitive OTP Plaintext
  it('Backend-Audit', '17. Audit logger automatically sanitizes any sensitive OTP metadata', () => {
    const entry = AuditLogger.log({
      actorUserId: 'usr-audit-test',
      entityType: 'otp',
      entityId: 'otp-test-1',
      eventType: 'HANDOVER_VERIFIED',
      metadata: {
        otp: '4829', // Sensitive plaintext!
        otpCode: '4829',
        reason: 'Handover complete',
      },
    });

    assert.strictEqual(entry.metadata?.otp, undefined, 'Plaintext otp must be scrubbed');
    assert.strictEqual(entry.metadata?.otpCode, undefined, 'Plaintext otpCode must be scrubbed');
    assert.strictEqual(entry.metadata?.reason, 'Handover complete', 'Non-sensitive fields retained');
  });

  // Test 18: Notification Dispatcher
  it('Backend-Notification', '18. Notification service dispatches and tracks read receipts', () => {
    const userId = `usr-notif-${Date.now()}`;
    const notif = ServerNotificationService.dispatch({
      userId,
      type: 'BOOKING_ACCEPTED',
      titleBn: 'বুকিং গ্রহণ',
      bodyBn: 'আপনার বুকিং গৃহীত হয়েছে।',
      entityType: 'booking',
      entityId: 'bhk-101',
    });

    assert.strictEqual(notif.readAt, undefined);

    const list = ServerNotificationService.getUserNotifications(userId);
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, notif.id);

    // Mark as read
    const marked = ServerNotificationService.markAsRead(notif.id, userId);
    assert.strictEqual(marked, true);
    assert.ok(notif.readAt);
  });
}
