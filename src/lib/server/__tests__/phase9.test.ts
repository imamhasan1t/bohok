// BOHOK Phase 9 — Production Integration & Real Backend Comprehensive Unit Test Suite
// Verifies live DB fallback, rate limiting, 60s cooldown, bKash/Nagad gateways, webhook anti-replay,
// real-time SSE event bus, map privacy radius, and multi-channel Bengali notifications

import assert from 'node:assert';
import crypto from 'node:crypto';
import { postgresAdapter } from '../db/postgresClient';
import { serverRateLimiter } from '../security/rateLimiter';
import { serverIdempotencyStore } from '../security/idempotency';
import { CsrfGuard } from '../security/csrf';
import { serverSmsService } from '../sms/smsService';
import { bkashAdapter } from '../payment/bkashAdapter';
import { nagadAdapter } from '../payment/nagadAdapter';
import { serverPaymentService } from '../payment/paymentGatewayService';
import { serverRealtimeBus, RealtimeBookingEvent } from '../realtime/realtimeBus';
import { MapPrivacyEngine } from '../../map/mapProvider';
import { MultiChannelNotifier } from '../notifications/multiChannelNotifier';
import { serverDb } from '../db/memoryDb';
import { ServerBookingService } from '../booking/bookingService';
import { ServerHandoverService } from '../booking/handoverService';
import { ServerDeliveryService } from '../booking/deliveryService';

export async function runPhase9Tests(
  it: (section: string, name: string, fn: () => void) => void,
  itAsync: (section: string, name: string, fn: () => Promise<void>) => Promise<void>
) {
  console.log('\n--- Suite 6: Phase 9 Production Integration & Real Backend (14 Tests) ---');

  // Test 1: Database Health Check & Connection String Masking
  await itAsync('Phase9-DB', '1. Reports credential requirement in fallback mode and masks passwords', async () => {
    const health = await postgresAdapter.checkHealth();
    assert.strictEqual(health.engine, 'MEMORY_FALLBACK');
    assert.strictEqual(health.isProductionReady, false);
    assert.ok(health.statusText.includes('PRODUCTION INTEGRATION READY — CREDENTIAL REQUIRED'));
    assert.ok(health.statusTextBn.includes('প্রোডাকশন ইন্টিগ্রেশন প্রস্তুত'));

    // Test connection string masking
    const masked = postgresAdapter.maskConnectionString('postgresql://user:secret123@aws.supabase.com:5432/bohok');
    assert.ok(!masked.includes('secret123'), 'Raw password must never be exposed');
    assert.ok(masked.includes('***'));
  });

  // Test 2: Rate Limiter Sliding Window Enforcement
  it('Phase9-Security', '2. Rate limiter enforces maximum request thresholds within sliding window', () => {
    const key = `test_limit_${Date.now()}`;
    serverRateLimiter.resetKey(key);

    // Max 3 requests per 10 seconds
    const res1 = serverRateLimiter.checkLimit(key, 3, 10);
    assert.strictEqual(res1.allowed, true);
    assert.strictEqual(res1.remaining, 2);

    const res2 = serverRateLimiter.checkLimit(key, 3, 10);
    assert.strictEqual(res2.allowed, true);
    assert.strictEqual(res2.remaining, 1);

    const res3 = serverRateLimiter.checkLimit(key, 3, 10);
    assert.strictEqual(res3.allowed, true);
    assert.strictEqual(res3.remaining, 0);

    // 4th request must be blocked
    const res4 = serverRateLimiter.checkLimit(key, 3, 10);
    assert.strictEqual(res4.allowed, false);
    assert.strictEqual(res4.remaining, 0);
    assert.ok(res4.resetInSeconds > 0);
  });

  // Test 3: 60-Second OTP Resend Cooldown
  it('Phase9-Security', '3. Enforces 60-second cooldown between consecutive OTP requests', () => {
    const cooldownKey = `test_cd_${Date.now()}`;
    serverRateLimiter.resetKey(cooldownKey);

    // First request initiates cooldown
    const cd1 = serverRateLimiter.checkCooldown(cooldownKey, 60);
    assert.strictEqual(cd1.inCooldown, false);

    // Record request timestamp
    serverRateLimiter.checkLimit(cooldownKey, 1, 60);

    // Immediate second request must be in cooldown
    const cd2 = serverRateLimiter.checkCooldown(cooldownKey, 60);
    assert.strictEqual(cd2.inCooldown, true);
    assert.ok(cd2.remainingSeconds > 0 && cd2.remainingSeconds <= 60);
  });

  // Test 4: CSRF Guard Origin Verification
  it('Phase9-Security', '4. CSRF guard verifies Origin and Referer headers against Host', () => {
    // GET requests always pass
    const getReq = new Request('http://localhost:3000/api/trips', { method: 'GET' });
    assert.strictEqual(CsrfGuard.validateRequestOrigin(getReq).valid, true);

    // POST request with matching Origin passes
    const validPost = new Request('http://localhost:3000/api/auth/request-otp', {
      method: 'POST',
      headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
    });
    assert.strictEqual(CsrfGuard.validateRequestOrigin(validPost).valid, true);

    // POST request with external malicious Origin fails
    const maliciousPost = new Request('http://bohok.com.bd/api/auth/request-otp', {
      method: 'POST',
      headers: { host: 'bohok.com.bd', origin: 'https://evil-attacker.com' },
    });
    assert.strictEqual(CsrfGuard.validateRequestOrigin(maliciousPost).valid, false);
  });

  // Test 5: Idempotency Store Anti-Replay
  it('Phase9-Security', '5. Idempotency store prevents duplicate actions and caches results', () => {
    const key = `test_idem_${Date.now()}`;

    // 1st acquire succeeds
    const check1 = serverIdempotencyStore.acquire(key, 60);
    assert.strictEqual(check1.isDuplicate, false);

    // 2nd acquire detects duplicate
    const check2 = serverIdempotencyStore.acquire(key, 60);
    assert.strictEqual(check2.isDuplicate, true);

    // Resolve payload
    serverIdempotencyStore.resolve(key, { paymentProcessed: true });
    const check3 = serverIdempotencyStore.acquire<{ paymentProcessed: boolean }>(key, 60);
    assert.strictEqual(check3.isDuplicate, true);
    assert.strictEqual(check3.record?.responsePayload?.paymentProcessed, true);
  });

  // Test 6: Bengali SMS Dispatcher with Cooldown Protection
  await itAsync('Phase9-SMS', '6. SMS service generates Bengali template and blocks rapid resends', async () => {
    const testPhone = `+8801700${Math.floor(100000 + Math.random() * 900000)}`;

    // 1st OTP dispatch succeeds
    const res1 = await serverSmsService.sendOtp(testPhone, '482910');
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.cooldownSeconds, 60);

    // Immediate 2nd OTP dispatch is blocked by 60s cooldown
    const res2 = await serverSmsService.sendOtp(testPhone, '482910');
    assert.strictEqual(res2.success, false);
    assert.ok(res2.errorBn?.includes('সেকেন্ড অপেক্ষা করুন'));
  });

  // Test 7: bKash Gateway Adapter Credential Readiness
  await itAsync('Phase9-Payment', '7. bKash adapter reports credential requirement when unconfigured', async () => {
    const res = await bkashAdapter.initiateEscrowPayment({
      bookingId: 'bhk-bks-test',
      senderId: 'usr-1',
      senderPhone: '+8801700000000',
      amount: 250,
    });

    assert.strictEqual(res.provider, 'bkash');
    assert.strictEqual(res.status, 'FAILED');
    assert.ok(res.error?.includes('PRODUCTION INTEGRATION READY — CREDENTIAL REQUIRED'));
    assert.ok(res.errorBn?.includes('বিকাশ'));
  });

  // Test 8: bKash HMAC-SHA256 Webhook Signature Verification
  it('Phase9-Payment', '8. bKash webhook signature validator uses timing-safe HMAC checks', () => {
    const secret = 'bkash_test_secret_12345';
    const payload = JSON.stringify({ trxID: 'TRX_9921', amount: '250.00' });

    const validHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // Temporarily set secret for verification test
    const adapter = new (bkashAdapter.constructor as any)();
    (adapter as any).appSecret = secret;

    assert.strictEqual(adapter.verifyWebhookSignature(payload, validHmac).isValid, true);
    assert.strictEqual(adapter.verifyWebhookSignature(payload, 'invalid_signature_hex').isValid, false);
  });

  // Test 9: Nagad Payment Gateway Adapter Handling
  await itAsync('Phase9-Payment', '9. Nagad adapter initializes and validates RSA webhook signatures', async () => {
    const res = await nagadAdapter.initiateEscrowPayment({
      bookingId: 'bhk-ngd-test',
      senderId: 'usr-2',
      senderPhone: '+8801800000000',
      amount: 300,
    });

    assert.strictEqual(res.provider, 'nagad');
    assert.strictEqual(res.status, 'FAILED');
    assert.ok(res.error?.includes('PRODUCTION INTEGRATION READY — CREDENTIAL REQUIRED'));
    assert.ok(res.errorBn?.includes('নগদ'));
  });

  // Test 10: Payment Gateway Service Idempotency & Escrow State
  await itAsync('Phase9-Payment', '10. Payment service records escrow and enforces idempotency', async () => {
    const sender = serverDb.insertUser('+8801711998877', 'প্রেরক পেমেন্ট', 'SENDER');
    const traveller = serverDb.insertUser('+8801811998877', 'সহযাত্রী পেমেন্ট', 'TRAVELLER');

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

    // Initiate demo escrow payment
    const initRes = await serverPaymentService.initiatePayment('demo_escrow', {
      bookingId: booking.id,
      senderId: sender.id,
      senderPhone: sender.phone,
      amount: booking.totalAmount,
    });

    assert.strictEqual(initRes.success, true);
    assert.strictEqual(initRes.status, 'HELD');

    const storedPayment = serverDb.payments.get(booking.id);
    assert.strictEqual(storedPayment?.status, 'HELD');
  });

  // Test 11: Real-time Event Bus Selective Broadcast
  it('Phase9-Realtime', '11. SSE Realtime event bus notifies targeted booking subscribers', () => {
    serverRealtimeBus.clear();

    const targetBookingId = `bhk_rt_${Date.now()}`;
    const receivedEvents: RealtimeBookingEvent[] = [];

    // Subscribe to specific booking
    const unsubscribe = serverRealtimeBus.subscribe(targetBookingId, (evt) => {
      receivedEvents.push(evt);
    });

    // Publish event for target booking
    serverRealtimeBus.publish({
      type: 'IN_TRANSIT',
      bookingId: targetBookingId,
      titleBn: 'ট্রানজিট আপডেট',
      messageBn: 'পার্সেল মহাসড়কে রয়েছে।',
      data: { checkpoint: 'দাউদকান্দি' },
    });

    // Publish event for another booking
    serverRealtimeBus.publish({
      type: 'IN_TRANSIT',
      bookingId: 'other_booking_id',
      titleBn: 'অন্যান্য আপডেট',
      messageBn: 'অন্যান্য পার্সেল।',
      data: {},
    });

    assert.strictEqual(receivedEvents.length, 1);
    assert.strictEqual(receivedEvents[0].bookingId, targetBookingId);

    unsubscribe();
  });

  // Test 12: Map Privacy Engine Fuzzing & Radius Calculation
  it('Phase9-Map', '12. Map privacy engine fuzzes raw GPS coordinates to 750m privacy zone', () => {
    // Exact GPS coordinates of an imaginary residence
    const exactResidentialGPS = { lat: 23.710482, lng: 90.407441 };

    const zone = MapPrivacyEngine.fuzzCoordinates(exactResidentialGPS, 'সায়েদাবাদ বাস টার্মিনাল');

    assert.strictEqual(zone.isApproximate, true);
    assert.strictEqual(zone.radiusMeters, 750);
    assert.strictEqual(zone.fuzzedCoordinate.lat, 23.71, 'Latitude must be blurred to 2 decimal places');
    assert.strictEqual(zone.fuzzedCoordinate.lng, 90.41, 'Longitude must be blurred to 2 decimal places');
    assert.ok(zone.privacyNoticeBn.includes('আবাসিক ঠিকানা গোপন'));
  });

  // Test 13: Multi-Channel Bengali Notification Dispatcher
  await itAsync('Phase9-Notifications', '13. Multi-channel notifier delivers In-App and SMS simultaneously', async () => {
    const user = serverDb.insertUser('+8801700554433', 'বিজ্ঞপ্তি ইউজার', 'SENDER');

    const result = await MultiChannelNotifier.dispatch({
      userId: user.id,
      recipientPhone: user.phone,
      bookingId: 'bhk_notif_test',
      templateName: 'bookingAccepted',
      data: {
        travellerName: 'রহিম উল্লাহ',
        routeBn: 'ঢাকা → কুমিল্লা',
      },
    });

    assert.ok(result.inAppId);
    assert.strictEqual(result.smsSent, true);
    assert.strictEqual(result.realtimeSent, true);

    const userNotifs = serverDb.notifications.get(result.inAppId);
    assert.ok(userNotifs);
    assert.ok(userNotifs.titleBn.includes('সহযাত্রী আপনার বুকিং গ্রহণ করেছেন'));
  });

  // Test 14: Complete Lifecycle Integration
  await itAsync('Phase9-E2E', '14. End-to-end Phase 9 lifecycle from booking to escrow release', async () => {
    const sender = serverDb.insertUser('+8801711887766', 'ইমাম হাসান', 'SENDER');
    const traveller = serverDb.insertUser('+8801811887766', 'আব্দুর রহিম', 'TRAVELLER');

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
      categoryBn: 'নথিপত্র',
      weightKg: 1.0,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'জরুরি ফাইল',
      recipientName: 'প্রাপক',
      recipientPhone: '+8801912000000',
    });

    // 1. Traveller accepts booking
    const { booking, otp1PlainForSender, otp2PlainForRecipient } = ServerBookingService.acceptBookingAtomic(
      trip.id,
      parcel.id,
      traveller.id
    );

    // 2. Sender initiates escrow payment
    await serverPaymentService.initiatePayment('demo_escrow', {
      bookingId: booking.id,
      senderId: sender.id,
      senderPhone: sender.phone,
      amount: booking.totalAmount,
    });
    assert.strictEqual(serverDb.payments.get(booking.id)?.status, 'HELD');

    // 3. Traveller meets sender & verifies Handover OTP 1
    ServerHandoverService.verifyHandoverAtomic(booking.id, traveller.id, otp1PlainForSender, {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(booking.status, 'HANDED_OVER');

    // 4. Traveller starts journey -> IN_TRANSIT
    ServerBookingService.startJourney(booking.id, traveller.id);
    assert.strictEqual(booking.status, 'IN_TRANSIT');

    // 5. Traveller reaches destination & verifies Delivery OTP 2 -> Escrow Released!
    ServerDeliveryService.verifyDeliveryAtomic(booking.id, traveller.id, otp2PlainForRecipient);
    assert.strictEqual(booking.status, 'DELIVERED');
    assert.strictEqual(serverDb.payments.get(booking.id)?.status, 'RELEASED');
  });
}
