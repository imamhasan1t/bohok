// Route: POST /api/auth/verify-otp

import { NextRequest } from 'next/server';
import { ServerValidator } from '@/lib/server/validation/validator';
import { serverConfig } from '@/lib/server/config';
import { serverDb } from '@/lib/server/db/memoryDb';
import { serverSessionStore } from '@/lib/server/auth/session';
import { serverRateLimiter } from '@/lib/server/security/rateLimiter';
import { AuditLogger } from '@/lib/server/audit/auditLogger';
import { AppErrors } from '@/lib/server/errors/appErrors';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = ServerValidator.validatePhone(body.phone);
    const otp = ServerValidator.validateOtp(body.otp);
    const role = (body.role as 'SENDER' | 'TRAVELLER') || 'SENDER';
    const name = body.name?.trim() || (role === 'TRAVELLER' ? 'সহযাত্রী ব্যবহারকারী' : 'প্রেরক ব্যবহারকারী');

    // In demo mode, verify against demoOtp
    if (serverConfig.isDemoMode) {
      if (otp !== serverConfig.demoOtp) {
        throw AppErrors.otpInvalid();
      }
    } else {
      // In production mode, OTP would be verified via SMS service
      if (otp !== serverConfig.demoOtp) {
        throw AppErrors.otpInvalid();
      }
    }

    // Get or create user
    serverRateLimiter.resetKey(`cooldown:otp:${phone}`);
    const user = serverDb.insertUser(phone, name, role);
    const profile = serverDb.userProfiles.get(user.id)!;

    // Create secure session
    const session = serverSessionStore.createSession(user, role);

    AuditLogger.log({
      actorUserId: user.id,
      entityType: 'user',
      entityId: user.id,
      eventType: 'AUTH_LOGIN',
      metadata: { phone: phone.slice(0, 6) + '***' },
    });

    const res = successResponse({
      token: session.token,
      user: {
        id: user.id,
        phone: user.phone,
        name: profile.name,
        avatarInitials: profile.avatarInitials,
        verificationStatus: profile.verificationStatus,
      },
      expiresAt: session.expiresAt,
    });

    // Set secure HTTP-only cookie
    res.cookies.set({
      name: serverConfig.sessionCookieName,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: serverConfig.sessionDurationSeconds,
    });

    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
