// BOHOK Phase 9 — Centralized SMS Service with Rate Limiting & Cooldown Protection

import { ISmsProvider, SmsSendResult } from './smsTypes';
import { DemoSmsProvider, SslWirelessSmsProvider, BanglalinkSmsProvider } from './smsProviders';
import { serverRateLimiter } from '../security/rateLimiter';
import { serverConfig } from '../config';

export class SmsService {
  private primaryProvider: ISmsProvider;
  private demoProvider: DemoSmsProvider;

  constructor() {
    this.demoProvider = new DemoSmsProvider();

    // Select live provider if configured
    const ssl = new SslWirelessSmsProvider();
    const bl = new BanglalinkSmsProvider();

    if (ssl.isConfigured()) {
      this.primaryProvider = ssl;
    } else if (bl.isConfigured()) {
      this.primaryProvider = bl;
    } else {
      this.primaryProvider = this.demoProvider;
    }
  }

  public getActiveProviderName(): string {
    return this.primaryProvider.name;
  }

  /**
   * Dispatch an OTP to a recipient with 60-second cooldown and 10-minute rate limiting
   */
  public async sendOtp(
    phone: string,
    plainOtp: string
  ): Promise<SmsSendResult & { cooldownSeconds: number }> {
    const cooldownKey = `cooldown:otp:${phone}`;
    const rateLimitKey = `ratelimit:otp:${phone}`;

    // 1. Check 60-second cooldown
    const cooldown = serverRateLimiter.checkCooldown(cooldownKey, 60);
    if (cooldown.inCooldown) {
      return {
        success: false,
        providerName: this.primaryProvider.name,
        isDemo: serverConfig.isDemoMode,
        error: `Please wait ${cooldown.remainingSeconds} seconds before requesting a new code.`,
        errorBn: `অনুগ্রহ করে নতুন কোড চাওয়ার আগে ${cooldown.remainingSeconds} সেকেন্ড অপেক্ষা করুন।`,
        statusTextBn: 'কুলডাউন সক্রিয় রয়েছে',
        cooldownSeconds: cooldown.remainingSeconds,
      };
    }

    // 2. Check 10-minute sliding window rate limit (max 5 OTPs per 10 mins)
    const limit = serverRateLimiter.checkLimit(rateLimitKey, 5, 600);
    if (!limit.allowed) {
      return {
        success: false,
        providerName: this.primaryProvider.name,
        isDemo: serverConfig.isDemoMode,
        error: 'Too many OTP requests. Try again later.',
        errorBn: limit.messageBn || 'অতিরিক্ত ওটিপি অনুরোধ পাঠানো হয়েছে।',
        statusTextBn: 'রেট লিমিট অতিক্রান্ত',
        cooldownSeconds: limit.resetInSeconds,
      };
    }

    // Record cooldown timestamp
    serverRateLimiter.checkLimit(cooldownKey, 1, 60);

    // Natural Bangladeshi Bengali OTP Template
    const message = `বহক (BOHOK) যাচাইকরণ কোড হলো ${plainOtp}। এটি ১৫ মিনিট পর্যন্ত কার্যকর থাকবে। কারো সাথে এই কোড শেয়ার করবেন না।`;

    const result = await this.primaryProvider.send({
      recipientPhone: phone,
      message,
      templateType: 'OTP',
    });

    return {
      ...result,
      cooldownSeconds: 60,
    };
  }

  /**
   * Dispatch a transaction notification via SMS
   */
  public async sendTransactionAlert(
    phone: string,
    message: string,
    templateType: 'BOOKING_ALERT' | 'HANDOVER_ALERT' | 'DELIVERY_ALERT' | 'PAYMENT_ALERT'
  ): Promise<SmsSendResult> {
    return this.primaryProvider.send({
      recipientPhone: phone,
      message,
      templateType,
    });
  }
}

export const serverSmsService = new SmsService();
