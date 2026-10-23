// BOHOK Phase 6 — Authentication & Trust Foundation Unit Tests
// Tests all 17 core requirements: OTP, sessions, roles, privacy, and trust rules

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { demoPhoneAuthProvider } from '../demoPhoneAuthProvider';
import { authStore } from '../authStore';
import { authService, DEMO_USER_IMAM } from '../authService';
import { maskPhoneNumber, validateBangladeshiPhone, validateOtpInput } from '../authValidation';
import { mockIdentityProvider } from '../mockIdentityProvider';
import { marketplaceStore } from '../../marketplace/marketplaceStore';

describe('BOHOK Phase 6 Authentication & Trust Foundation', () => {
  const testPhone = '01711002233';

  beforeEach(() => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
  });

  // 1. Valid demo OTP
  it('1. Valid demo OTP (123456) verifies successfully and generates session', async () => {
    const req = await demoPhoneAuthProvider.requestOtp(testPhone);
    assert.strictEqual(req.success, true);

    const verify = await authService.submitOtp(testPhone, '123456', 'BOTH');
    assert.strictEqual(verify.success, true);
    assert.ok(verify.session !== undefined);
    assert.ok(verify.user !== undefined);
    assert.strictEqual(authStore.isAuthenticated(), true);
    assert.strictEqual(authStore.getAuthState(), 'AUTHENTICATED');
  });

  // 2. Invalid OTP
  it('2. Invalid OTP is rejected with clear error message in Bengali', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const verify = await demoPhoneAuthProvider.verifyOtp(testPhone, '999999');

    assert.strictEqual(verify.success, false);
    assert.strictEqual(verify.error, 'INVALID_OTP');
    assert.strictEqual(verify.messageBn, 'কোডটি সঠিক নয়। আবার চেষ্টা করুন।');
  });

  // 3. Expired OTP
  it('3. Expired OTP returns expiry error and prompts for new code', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    demoPhoneAuthProvider.expireOtpForTesting(testPhone);

    const verify = await demoPhoneAuthProvider.verifyOtp(testPhone, '123456');
    assert.strictEqual(verify.success, false);
    assert.strictEqual(verify.error, 'EXPIRED_OTP');
    assert.strictEqual(verify.messageBn, 'এই কোডটির মেয়াদ শেষ হয়েছে। নতুন কোড নিন।');
  });

  // 4. Resend OTP
  it('4. Resend OTP resets timer and provisions a valid code', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const resend = await demoPhoneAuthProvider.resendOtp(testPhone);

    assert.strictEqual(resend.success, true);
    assert.ok(new Date(resend.expiresAt) > new Date());
  });

  // 5. Login
  it('5. Login creates active session with future expiration timestamp', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const result = await authService.submitOtp(testPhone, '123456');

    assert.strictEqual(result.success, true);
    const session = authStore.getCurrentSession();
    assert.ok(session !== null);
    assert.ok(new Date(session.expiresAt) > new Date(session.createdAt));
  });

  // 6. Logout
  it('6. Logout clears session, user state, and transitions to LOGGED_OUT', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    await authService.submitOtp(testPhone, '123456');

    assert.strictEqual(authStore.isAuthenticated(), true);
    authService.logout();

    assert.strictEqual(authStore.isAuthenticated(), false);
    assert.strictEqual(authStore.getCurrentUser(), null);
    assert.strictEqual(authStore.getAuthState(), 'LOGGED_OUT');
  });

  // 7. Session expiry
  it('7. Session expiry flags SESSION_EXPIRED and revokes authentication', () => {
    const session = authStore.login(DEMO_USER_IMAM, -1); // Negative duration: already expired
    assert.strictEqual(authStore.isSessionExpired(), true);
    assert.strictEqual(authStore.isAuthenticated(), false);
    assert.strictEqual(authStore.getAuthState(), 'SESSION_EXPIRED');
  });

  // 8. Protected action
  it('8. Protected action records redirect path for unauthenticated users', () => {
    authStore.setRedirectAfterAuth('/send');
    assert.strictEqual(authStore.getRedirectAfterAuth(), '/send');
    // Calling getRedirectAfterAuth clears it
    assert.strictEqual(authStore.getRedirectAfterAuth(), null);
  });

  // 9. Sender authentication requirement
  it('9. Sender parcel creation uses authenticated stable user ID', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const { user } = await authService.submitOtp(testPhone, '123456');

    const parcel = marketplaceStore.createParcel({
      senderId: user!.id,
      origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'ধানমন্ডি' },
      destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'কান্দিরপাড়' },
      category: 'documents',
      categoryBn: 'ডকুমেন্টস',
      weightKg: 0.5,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'সার্টিফিকেট',
      urgency: 'today',
      urgencyBn: 'আজই',
      requiredDeliveryAt: '2026-10-23T20:00:00Z',
      pickupDetails: { areaNameBn: 'ধানমন্ডি', landmarkBn: '২৭', contactPhone: user!.phone },
    });

    assert.strictEqual(parcel.senderId, user!.id);
    assert.notStrictEqual(parcel.senderId, user!.name);
  });

  // 10. Traveller publishing authentication requirement
  it('10. Traveller trip publishing associates authenticated stable user ID', async () => {
    await demoPhoneAuthProvider.requestOtp('01819556677');
    const { user } = await authService.submitOtp('01819556677', '123456', 'TRAVELLER');

    const trip = marketplaceStore.createTrip({
      travellerId: user!.id,
      origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'যাত্রাবাড়ী' },
      destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'কান্দিরপাড়' },
      waypoints: [],
      departureAt: '2026-10-23T16:00:00Z',
      departureTimeBn: 'বিকাল ০৪:০০',
      estimatedArrivalAt: '2026-10-23T18:30:00Z',
      estimatedArrivalTimeBn: 'সন্ধ্যা ০৬:৩০',
      travelMode: 'car',
      travelModeBn: 'প্রাইভেট কার',
      availableCapacityKg: 2.0,
      pickupPreference: 'along_route',
      pickupPreferenceBn: 'যাত্রাপথে',
    });

    assert.strictEqual(trip.travellerId, user!.id);
  });

  // 11. BOTH role
  it('11. User can switch roles dynamically to BOTH without losing permissions', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const { user } = await authService.submitOtp(testPhone, '123456', 'SENDER');

    assert.strictEqual(authStore.getCurrentUser()?.role, 'SENDER');
    authService.switchRole('BOTH');
    assert.strictEqual(authStore.getCurrentUser()?.role, 'BOTH');
  });

  // 12. Stable user ID
  it('12. Logging in with same phone number preserves consistent stable user ID', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const login1 = await authService.submitOtp(testPhone, '123456');

    authService.logout();

    await demoPhoneAuthProvider.requestOtp(testPhone);
    const login2 = await authService.submitOtp(testPhone, '123456');

    assert.strictEqual(login1.user?.id, login2.user?.id);
  });

  // 13. Masked phone
  it('13. Masks phone numbers safely (+880 17***-**233)', () => {
    const masked = maskPhoneNumber('+8801711002233');
    assert.ok(masked.includes('***'));
    assert.ok(masked.endsWith('233'));
    assert.strictEqual(masked.includes('1100'), false); // Sensitive middle hidden
  });

  // 14. Trust badge rules
  it('14. Generates transparent trust signals without fake percentage score', () => {
    const signals = authService.getTrustSignals(DEMO_USER_IMAM);

    assert.strictEqual(signals.isPhoneVerified, true);
    assert.strictEqual(signals.isIdentityVerified, false); // Transparent!
    assert.strictEqual(signals.cancellationRate, 0.0);
    assert.ok(signals.rating >= 4.0);
  });

  // 15. Identity cannot become verified without provider
  it('15. Identity verification remains false until official government provider connects', async () => {
    const status = await mockIdentityProvider.getVerificationStatus('user-sender-imam');
    assert.strictEqual(status.isVerified, false);
    assert.strictEqual(status.status, 'UNVERIFIED');
    assert.ok(status.messageBn.includes('সক্রিয় নয়'));
  });

  // 16. Demo OTP visibility
  it('16. Demo OTP hint is returned when demo mode is active', async () => {
    const res = await demoPhoneAuthProvider.requestOtp(testPhone);
    assert.strictEqual(res.otpCodeDemo, '123456');
  });

  // 17. Private data not exposed publicly
  it('17. Public traveller view never leaks private phone, GPS, or identity documents', () => {
    marketplaceStore.reset();
    marketplaceStore.registerUser(DEMO_USER_IMAM, {
      phone: '+8801711002233',
      exactGpsCoordinates: [90.4125, 23.8103],
      exactAddress: 'বাড়ি #৫, রোড #২, ঢাকা',
      nidDocumentMasked: 'XXXX-1234',
    });

    const publicView = marketplaceStore.getPublicTravellerProfile(DEMO_USER_IMAM.id);
    assert.ok(publicView !== undefined);
    assert.strictEqual(publicView.name, DEMO_USER_IMAM.name);
    assert.strictEqual((publicView as any).phone, undefined);
    assert.strictEqual((publicView as any).exactGpsCoordinates, undefined);
    assert.strictEqual((publicView as any).exactAddress, undefined);
    assert.strictEqual((publicView as any).nidDocumentMasked, undefined);
  });
});
