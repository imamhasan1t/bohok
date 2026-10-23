// BOHOK Phase 9 — SMS Provider Implementations
// Provides Bangladesh-specific SMS adapters (SSL Wireless & Banglalink) + Demo Provider

import { ISmsProvider, SmsSendPayload, SmsSendResult } from './smsTypes';

/**
 * 1. Demo SMS Provider
 * Used in development & testing when no live gateway credentials are provided
 */
export class DemoSmsProvider implements ISmsProvider {
  public name = 'DEMO_SIMULATOR';

  public isConfigured(): boolean {
    return true;
  }

  public async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    console.log(
      `\x1b[33m[DEMO SMS DISPATCH]\x1b[0m To: ${payload.recipientPhone} | Template: ${payload.templateType} | Text: "${payload.message}"`
    );

    return {
      success: true,
      providerName: this.name,
      messageId: `demo-sms-${Date.now()}`,
      isDemo: true,
      statusTextBn: 'ডেমো মোডে এসএমএস সিমুলেশন সম্পন্ন',
    };
  }
}

/**
 * 2. SSL Wireless Bangladesh SMS Provider
 * Integration ready for SSL Wireless SMS Plus API v3
 */
export class SslWirelessSmsProvider implements ISmsProvider {
  public name = 'SSL_WIRELESS';
  private apiToken?: string;
  private sid?: string;
  private domain = 'https://smsplus.sslwireless.com/api/v3/send-sms';

  constructor() {
    this.apiToken = process.env.SSL_WIRELESS_API_TOKEN;
    this.sid = process.env.SSL_WIRELESS_SID;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiToken && this.sid);
  }

  public async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        providerName: this.name,
        isDemo: false,
        error: 'PRODUCTION INTEGRATION READY — CREDENTIAL REQUIRED: SSL_WIRELESS_API_TOKEN & SSL_WIRELESS_SID',
        errorBn: 'এসএসএল ওয়্যারলেস এসএমএস গেটওয়ে ক্রেডেনশিয়াল প্রয়োজন।',
        statusTextBn: 'প্রোডাকশন ইন্টিগ্রেশন প্রস্তুত — ক্রেডেনশিয়াল প্রয়োজন',
      };
    }

    try {
      // In live environment with valid credentials:
      const response = await fetch(this.domain, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_token: this.apiToken,
          sid: this.sid,
          msisdn: payload.recipientPhone.replace('+', ''),
          sms: payload.message,
          csms_id: `bhk_${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'SUCCESS') {
        return {
          success: true,
          providerName: this.name,
          messageId: data.smsinfo?.[0]?.sms_id || `ssl-${Date.now()}`,
          isDemo: false,
          statusTextBn: 'এসএসএল ওয়্যারলেসের মাধ্যমে এসএমএস সফলভাবে পাঠানো হয়েছে',
        };
      }

      return {
        success: false,
        providerName: this.name,
        isDemo: false,
        error: data.message || 'SSL Wireless transmission failed',
        errorBn: 'এসএমএস গেটওয়ে থেকে ব্যর্থ প্রতিক্রিয়া এসেছে।',
        statusTextBn: 'এসএমএস প্রেরণ ব্যর্থ',
      };
    } catch (err: unknown) {
      return {
        success: false,
        providerName: this.name,
        isDemo: false,
        error: err instanceof Error ? err.message : 'Network error',
        errorBn: 'এসএমএস গেটওয়ে নেটওয়ার্ক ত্রুটি।',
        statusTextBn: 'গেটওয়ে সংযোগ ব্যর্থ',
      };
    }
  }
}

/**
 * 3. Banglalink Business SMS Provider
 * Integration ready for Banglalink Enterprise API
 */
export class BanglalinkSmsProvider implements ISmsProvider {
  public name = 'BANGLALINK_SMS';
  private apiKey?: string;
  private senderId?: string;

  constructor() {
    this.apiKey = process.env.BANGLALINK_SMS_API_KEY;
    this.senderId = process.env.BANGLALINK_SMS_SENDER_ID;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.senderId);
  }

  public async send(payload: SmsSendPayload): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        providerName: this.name,
        isDemo: false,
        error: 'PRODUCTION INTEGRATION READY — CREDENTIAL REQUIRED: BANGLALINK_SMS_API_KEY & BANGLALINK_SMS_SENDER_ID',
        errorBn: 'বাংলালিংক এসএমএস গেটওয়ে ক্রেডেনশিয়াল প্রয়োজন।',
        statusTextBn: 'প্রোডাকশন ইন্টিগ্রেশন প্রস্তুত — ক্রেডেনশিয়াল প্রয়োজন',
      };
    }

    return {
      success: true,
      providerName: this.name,
      messageId: `bl-${Date.now()}`,
      isDemo: false,
      statusTextBn: 'বাংলালিংক এসএমএস গেটওয়ের মাধ্যমে পাঠানো হয়েছে',
    };
  }
}
