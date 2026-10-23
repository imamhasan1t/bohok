// BOHOK Phase 8 — Server OTP Challenge Security Architecture
// Implements salted cryptographic hashing, 3-attempt limit, short-lived expiry & single-use verification

import crypto from 'node:crypto';
import { serverConfig } from '../config';
import { serverDb } from '../db/memoryDb';
import { DbOtpChallenge } from '../db/dbTypes';
import { AppErrors } from '../errors/appErrors';

export class ServerOtpService {
  /**
   * Hashes a numeric OTP with a cryptographic salt using SHA-256
   */
  public hashOtp(code: string, salt: string): string {
    return crypto.createHash('sha256').update(`${code}:${salt}`).digest('hex');
  }

  /**
   * Generates a new OTP challenge for a booking
   * Handover = 1st OTP (for Sender)
   * Delivery = 2nd OTP (for Recipient)
   */
  public createChallenge(
    bookingId: string,
    purpose: 'HANDOVER' | 'DELIVERY',
    explicitCode?: string
  ): { challenge: DbOtpChallenge; plainCode: string } {
    // Invalidate any previous active challenge for this booking & purpose
    for (const c of serverDb.otpChallenges.values()) {
      if (c.bookingId === bookingId && c.purpose === purpose && c.isActive) {
        c.isActive = false;
      }
    }

    // Generate random 4-digit numeric code or use explicit/demo code
    const plainCode =
      explicitCode ||
      (serverConfig.isDemoMode
        ? purpose === 'HANDOVER'
          ? '4829'
          : '7154'
        : Math.floor(1000 + crypto.randomInt(9000)).toString());

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedCode = this.hashOtp(plainCode, salt);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + serverConfig.otpExpiryMinutes * 60 * 1000).toISOString();

    const challengeId = `otp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const challenge: DbOtpChallenge = {
      id: challengeId,
      bookingId,
      purpose,
      hashedCode,
      salt,
      attemptCount: 0,
      maxAttempts: serverConfig.maxOtpAttempts,
      expiresAt,
      isActive: true,
      createdAt: now.toISOString(),
    };

    serverDb.otpChallenges.set(challengeId, challenge);

    return { challenge, plainCode };
  }

  /**
   * Verifies an OTP challenge submission atomically:
   * 1. Checks challenge exists and is active
   * 2. Checks expiry
   * 3. Checks attempt count < maxAttempts
   * 4. Increments attempt count
   * 5. Computes hash and compares in constant time
   * 6. If match, marks verified & deactivates
   */
  public verifyChallenge(
    bookingId: string,
    purpose: 'HANDOVER' | 'DELIVERY',
    inputCode: string
  ): { success: boolean; challenge: DbOtpChallenge } {
    // Find active challenge for booking and purpose
    let activeChallenge: DbOtpChallenge | null = null;
    for (const c of serverDb.otpChallenges.values()) {
      if (c.bookingId === bookingId && c.purpose === purpose && c.isActive) {
        activeChallenge = c;
        break;
      }
    }

    if (!activeChallenge) {
      throw AppErrors.otpAlreadyUsed();
    }

    // 1. Expiry Check
    if (new Date(activeChallenge.expiresAt).getTime() <= Date.now()) {
      activeChallenge.isActive = false;
      throw AppErrors.otpExpired();
    }

    // 2. Max Attempts Check
    if (activeChallenge.attemptCount >= activeChallenge.maxAttempts) {
      activeChallenge.isActive = false;
      throw AppErrors.otpInvalid(0);
    }

    // 3. Increment attempt
    activeChallenge.attemptCount += 1;

    // 4. Hash comparison in constant time
    const inputHash = this.hashOtp(inputCode.trim(), activeChallenge.salt);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(inputHash, 'hex'),
      Buffer.from(activeChallenge.hashedCode, 'hex')
    );

    if (!isMatch) {
      const remaining = activeChallenge.maxAttempts - activeChallenge.attemptCount;
      if (remaining <= 0) {
        activeChallenge.isActive = false;
      }
      throw AppErrors.otpInvalid(remaining);
    }

    // 5. Successful verification: mark single-use complete
    activeChallenge.verifiedAt = new Date().toISOString();
    activeChallenge.isActive = false;

    return { success: true, challenge: activeChallenge };
  }

  /**
   * Retrieves active challenge for a booking (without plaintext code)
   */
  public getActiveChallenge(bookingId: string, purpose: 'HANDOVER' | 'DELIVERY'): DbOtpChallenge | null {
    for (const c of serverDb.otpChallenges.values()) {
      if (c.bookingId === bookingId && c.purpose === purpose && c.isActive) {
        return c;
      }
    }
    return null;
  }
}

export const serverOtpService = new ServerOtpService();
