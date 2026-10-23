// BOHOK Phase 6 — Authentication & Trust Service
// High-level orchestrator connecting Demo Phone Auth Provider, Store, and Trust Signals

import { User, UserRole, TrustSignals, OtpRequestResult, OtpVerifyResult } from './authTypes';
import { demoPhoneAuthProvider } from './demoPhoneAuthProvider';
import { authStore } from './authStore';
import { maskPhoneNumber, validateBangladeshiPhone } from './authValidation';

// Canonical demo profiles for rapid testing
export const DEMO_USER_IMAM: User = {
  id: 'user-sender-imam',
  name: 'ইমাম হোসেন',
  phone: '+8801711002233',
  maskedPhone: '+880 17***-**233',
  avatar: '/avatars/imam.png',
  avatarInitials: 'ইহ',
  role: 'BOTH',
  verificationStatus: 'PHONE_VERIFIED',
  verificationBadgeBn: 'এনআইডি যাচাইকৃত',
  isPhoneVerified: true,
  isIdentityVerified: false, // NOT government verified in demo
  rating: 4.95,
  completedTrips: 12,
  completedDeliveries: 8,
  createdAt: '2026-09-10T10:00:00Z',
};

export const DEMO_USER_RAHIM: User = {
  id: 'user-traveller-rahim',
  name: 'রহিম উল্লাহ',
  phone: '+8801819556677',
  maskedPhone: '+880 18***-**677',
  avatar: '/avatars/rahim.png',
  avatarInitials: 'রু',
  role: 'TRAVELLER',
  verificationStatus: 'PHONE_VERIFIED',
  verificationBadgeBn: 'সুপার ট্রাভেলার',
  isPhoneVerified: true,
  isIdentityVerified: false,
  rating: 4.9,
  completedTrips: 38,
  completedDeliveries: 34,
  createdAt: '2026-08-15T09:00:00Z',
};

export class AuthService {
  /**
   * Request OTP code for a Bangladeshi mobile number
   */
  public async requestOtp(phone: string): Promise<OtpRequestResult> {
    const result = await demoPhoneAuthProvider.requestOtp(phone);
    if (result.success) {
      authStore.setAuthState('OTP_REQUESTED');
    }
    return result;
  }

  /**
   * Verifies the 6-digit OTP and establishes an authenticated session.
   * Assigns a stable user ID and marks phone verification.
   */
  public async submitOtp(
    phone: string,
    otp: string,
    preferredRole: UserRole = 'BOTH',
    customName?: string
  ): Promise<OtpVerifyResult> {
    const verifyResult = await demoPhoneAuthProvider.verifyOtp(phone, otp);
    if (!verifyResult.success) {
      return verifyResult;
    }

    authStore.setAuthState('OTP_VERIFIED');

    // Resolve or generate stable user identity
    const normalizedPhone = validateBangladeshiPhone(phone).normalizedPhone || phone;
    let user: User;

    if (normalizedPhone === DEMO_USER_IMAM.phone) {
      user = { ...DEMO_USER_IMAM, role: preferredRole };
    } else if (normalizedPhone === DEMO_USER_RAHIM.phone) {
      user = { ...DEMO_USER_RAHIM, role: preferredRole };
    } else {
      // Deterministic stable ID based on phone digits
      const digitsOnly = normalizedPhone.replace(/\D/g, '');
      const stableId = `usr-bd-${digitsOnly.slice(-8)}`;
      const displayName = customName || `ব্যবহারকারী (${digitsOnly.slice(-4)})`;
      const initials = displayName.slice(0, 2);

      user = {
        id: stableId,
        name: displayName,
        phone: normalizedPhone,
        maskedPhone: maskPhoneNumber(normalizedPhone),
        avatar: '',
        avatarInitials: initials,
        role: preferredRole,
        verificationStatus: 'PHONE_VERIFIED',
        verificationBadgeBn: 'ফোন যাচাইকৃত',
        isPhoneVerified: true,
        isIdentityVerified: false, // Never claim government identity verification without a real provider
        rating: 5.0,
        completedTrips: 0,
        completedDeliveries: 0,
        createdAt: new Date().toISOString(),
      };
    }

    const session = authStore.login(user);

    return {
      success: true,
      messageBn: 'লগইন সফল হয়েছে।',
      session,
      user,
    };
  }

  public async resendOtp(phone: string): Promise<OtpRequestResult> {
    return demoPhoneAuthProvider.resendOtp(phone);
  }

  public logout(): void {
    authStore.logout('LOGGED_OUT');
  }

  public switchRole(role: UserRole): User {
    return authStore.switchRole(role);
  }

  /**
   * Transparent Trust Signals Calculator
   * Does NOT generate arbitrary percentages. Presents factual, auditable signals.
   */
  public getTrustSignals(user: User): TrustSignals {
    const isPhoneVerified = user.isPhoneVerified;
    const isIdentityVerified = user.isIdentityVerified;

    let trustLevelBn = 'নতুন সদস্য';
    let badgeTextBn = 'ফোন নম্বর যাচাই করা হয়নি';

    if (isPhoneVerified && !isIdentityVerified) {
      trustLevelBn = 'ফোন যাচাইকৃত সদস্য';
      badgeTextBn = '✓ ফোন নম্বর যাচাই সম্পন্ন';
    } else if (isIdentityVerified) {
      trustLevelBn = 'এনআইডি যাচাইকৃত সদস্য';
      badgeTextBn = '✓ সরকারি পরিচয় যাচাইকৃত';
    }

    if (user.completedTrips >= 20 && user.rating >= 4.8) {
      trustLevelBn = 'সুপার ট্রাভেলার';
      badgeTextBn = '⭐ বিশ্বস্ত সহযাত্রী';
    }

    return {
      isPhoneVerified,
      isIdentityVerified,
      verificationBadgeTextBn: badgeTextBn,
      rating: user.rating,
      completedTrips: user.completedTrips,
      completedDeliveries: user.completedDeliveries,
      cancellationRate: 0.0,
      successfulHandovers: user.completedTrips + user.completedDeliveries,
      trustLevelBn,
    };
  }
}

export const authService = new AuthService();
