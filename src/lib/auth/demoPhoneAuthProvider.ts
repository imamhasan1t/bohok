// BOHOK Phase 6 — Phone Auth Provider Abstraction & Demo Implementation
// Provides clean abstraction for future SMS gateways (SSL Wireless, Greenweb, etc.)
// Production security rule: Never exposes real OTP or stores OTPs in client storage

import { OtpRequestResult, OtpVerifyResult } from './authTypes';
import { validateBangladeshiPhone, validateOtpInput } from './authValidation';

export interface PhoneAuthProvider {
  requestOtp(phone: string): Promise<OtpRequestResult>;
  verifyOtp(phone: string, otp: string): Promise<OtpVerifyResult>;
  resendOtp(phone: string): Promise<OtpRequestResult>;
}

export interface ActiveOtpSession {
  phone: string;
  expectedOtp: string;
  expiresAt: Date;
  attemptsCount: number;
}

export class DemoPhoneAuthProvider implements PhoneAuthProvider {
  private activeOtps: Map<string, ActiveOtpSession> = new Map();
  private static readonly DEMO_OTP = '123456';
  private static readonly EXPIRY_MINUTES = 3;

  /**
   * Checks if demo mode is active.
   * By default in client prototype, demo mode is enabled unless explicitly turned off.
   */
  public isDemoModeEnabled(): boolean {
    if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
      return false;
    }
    return true;
  }

  public async requestOtp(phone: string): Promise<OtpRequestResult> {
    const phoneVal = validateBangladeshiPhone(phone);
    if (!phoneVal.isValid || !phoneVal.normalizedPhone) {
      return {
        success: false,
        messageBn: phoneVal.errorBn || 'অবৈধ মোবাইল নম্বর।',
        expiresAt: '',
        error: phoneVal.errorBn,
      };
    }

    const normalizedPhone = phoneVal.normalizedPhone;
    const expiresAt = new Date(Date.now() + DemoPhoneAuthProvider.EXPIRY_MINUTES * 60 * 1000);

    // Save active OTP session in-memory
    this.activeOtps.set(normalizedPhone, {
      phone: normalizedPhone,
      expectedOtp: DemoPhoneAuthProvider.DEMO_OTP,
      expiresAt,
      attemptsCount: 0,
    });

    const isDemo = this.isDemoModeEnabled();

    return {
      success: true,
      messageBn: `আপনার মোবাইলে ৬ সংখ্যার কোড পাঠানো হয়েছে।`,
      otpCodeDemo: isDemo ? DemoPhoneAuthProvider.DEMO_OTP : undefined,
      expiresAt: expiresAt.toISOString(),
    };
  }

  public async verifyOtp(phone: string, otp: string): Promise<OtpVerifyResult> {
    const phoneVal = validateBangladeshiPhone(phone);
    if (!phoneVal.isValid || !phoneVal.normalizedPhone) {
      return {
        success: false,
        messageBn: phoneVal.errorBn || 'অবৈধ মোবাইল নম্বর।',
        error: 'INVALID_PHONE',
      };
    }

    const otpVal = validateOtpInput(otp);
    if (!otpVal.isValid || !otpVal.cleanedOtp) {
      return {
        success: false,
        messageBn: otpVal.errorBn || 'কোডটি সঠিক নয়। আবার চেষ্টা করুন।',
        error: 'INVALID_FORMAT',
      };
    }

    const normalizedPhone = phoneVal.normalizedPhone;
    const session = this.activeOtps.get(normalizedPhone);

    if (!session) {
      return {
        success: false,
        messageBn: 'কোনো সক্রিয় ওটিপি পাওয়া যায়নি। নতুন কোড অনুরোধ করুন।',
        error: 'NO_ACTIVE_OTP',
      };
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      this.activeOtps.delete(normalizedPhone);
      return {
        success: false,
        messageBn: 'এই কোডটির মেয়াদ শেষ হয়েছে। নতুন কোড নিন।',
        error: 'EXPIRED_OTP',
      };
    }

    // Check OTP value
    if (otpVal.cleanedOtp !== session.expectedOtp) {
      session.attemptsCount++;
      return {
        success: false,
        messageBn: 'কোডটি সঠিক নয়। আবার চেষ্টা করুন।',
        error: 'INVALID_OTP',
      };
    }

    // Successfully verified: clean up session
    this.activeOtps.delete(normalizedPhone);

    return {
      success: true,
      messageBn: 'মোবাইল নম্বর সফলভাবে যাচাই হয়েছে।',
    };
  }

  public async resendOtp(phone: string): Promise<OtpRequestResult> {
    return this.requestOtp(phone);
  }

  /**
   * Helper for testing: explicitly force-expire an active OTP session
   */
  public expireOtpForTesting(phone: string): void {
    const phoneVal = validateBangladeshiPhone(phone);
    if (phoneVal.normalizedPhone) {
      const session = this.activeOtps.get(phoneVal.normalizedPhone);
      if (session) {
        session.expiresAt = new Date(Date.now() - 1000);
      }
    }
  }

  public clear(): void {
    this.activeOtps.clear();
  }
}

// Global singleton demo provider
export const demoPhoneAuthProvider = new DemoPhoneAuthProvider();
