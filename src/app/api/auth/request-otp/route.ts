// Route: POST /api/auth/request-otp

import { NextRequest } from 'next/server';
import { ServerValidator } from '@/lib/server/validation/validator';
import { serverConfig } from '@/lib/server/config';
import { serverSmsService } from '@/lib/server/sms/smsService';
import { CsrfGuard } from '@/lib/server/security/csrf';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const csrf = CsrfGuard.validateRequestOrigin(req);
    if (!csrf.valid) {
      return errorResponse({
        code: 'FORBIDDEN',
        message: csrf.reason || 'Invalid origin',
        userMessageBn: 'অননুমোদিত অনুরোধ। অনুগ্রহ করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।',
        statusCode: 403,
      });
    }

    const body = await req.json().catch(() => ({}));
    const phone = ServerValidator.validatePhone(body.phone);

    const otpCode = serverConfig.isDemoMode ? serverConfig.demoOtp : Math.floor(100000 + Math.random() * 900000).toString();
    const smsResult = await serverSmsService.sendOtp(phone, otpCode);

    if (!smsResult.success) {
      return errorResponse({
        code: 'RATE_LIMIT_EXCEEDED',
        message: smsResult.error || 'Cooldown active',
        userMessageBn: smsResult.errorBn || 'অনুগ্রহ করে অপেক্ষা করে আবার চেষ্টা করুন।',
        statusCode: 429,
      });
    }

    return successResponse({
      phone,
      isDemoMode: serverConfig.isDemoMode,
      demoOtpCode: serverConfig.isDemoMode ? serverConfig.demoOtp : undefined,
      cooldownSeconds: smsResult.cooldownSeconds,
      providerName: smsResult.providerName,
      messageBn: serverConfig.isDemoMode
        ? 'ডেমো মোড সক্রিয়। কোড হিসেবে 123456 ব্যবহার করুন।'
        : 'আপনার মোবাইলে ওটিপি কোড পাঠানো হয়েছে।',
    });
  } catch (err) {
    return errorResponse(err);
  }
}
