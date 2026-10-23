// BOHOK Phase 8 — Centralized Server Input Validation
// Validates domain invariants with Bengali error messages

import { AppErrors } from '../errors/appErrors';

export const ServerValidator = {
  /**
   * Validates Bangladeshi phone numbers
   * Supports: +8801XXXXXXXXX, 01XXXXXXXXX, 8801XXXXXXXXX
   */
  validatePhone(phone: unknown): string {
    if (typeof phone !== 'string' || !phone.trim()) {
      throw AppErrors.validationError('phone', 'Phone is required', 'ফোন নম্বর প্রদান করা আবশ্যক।');
    }

    const clean = phone.replace(/[\s-]/g, '');
    const regex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

    if (!regex.test(clean)) {
      throw AppErrors.validationError(
        'phone',
        'Invalid Bangladesh mobile number',
        'সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।'
      );
    }

    // Normalize to standard E.164: +8801XXXXXXXXX
    if (clean.startsWith('+88')) return clean;
    if (clean.startsWith('88')) return `+${clean}`;
    return `+88${clean}`;
  },

  /**
   * Validates parcel weight in kilograms (weight > 0)
   */
  validateWeight(weight: unknown, maxKg = 15): number {
    const num = Number(weight);
    if (isNaN(num) || num <= 0) {
      throw AppErrors.validationError(
        'weight',
        'Weight must be strictly greater than 0',
        'পার্সেলের ওজন অবশ্যই ০-এর চেয়ে বেশি হতে হবে।'
      );
    }
    if (num > maxKg) {
      throw AppErrors.validationError(
        'weight',
        `Weight exceeds maximum limit of ${maxKg}kg`,
        `ব্যক্তিগত ভ্রমণের সুবিধার জন্য পার্সেলের সর্বোচ্চ ওজন ${maxKg} কেজি হতে পারে।`
      );
    }
    return Math.round(num * 100) / 100;
  },

  /**
   * Validates trip capacity in kilograms (capacity > 0)
   */
  validateCapacity(capacity: unknown, maxKg = 30): number {
    const num = Number(capacity);
    if (isNaN(num) || num <= 0) {
      throw AppErrors.validationError(
        'capacity',
        'Capacity must be strictly greater than 0',
        'যাত্রাপথে পার্সেল বহনের সক্ষমতা অবশ্যই ০-এর চেয়ে বেশি হতে হবে।'
      );
    }
    if (num > maxKg) {
      throw AppErrors.validationError(
        'capacity',
        `Capacity exceeds maximum allowed ${maxKg}kg`,
        `সহযাত্রী হিসেবে সর্বোচ্চ ${maxKg} কেজি সক্ষমতা পোস্ট করা সম্ভব।`
      );
    }
    return Math.round(num * 100) / 100;
  },

  /**
   * Validates OTP code format (4 to 6 numeric digits)
   */
  validateOtp(otp: unknown): string {
    if (typeof otp !== 'string' || !/^\d{4,6}$/.test(otp.trim())) {
      throw AppErrors.validationError(
        'otp',
        'OTP must be a 4 to 6 digit code',
        'ওটিপি কোডটি ৪ থেকে ৬ সংখ্যার নির্ভুল পিন হতে হবে।'
      );
    }
    return otp.trim();
  },

  /**
   * Validates rating score (1 to 5 integer)
   */
  validateRating(score: unknown): number {
    const num = Number(score);
    if (isNaN(num) || num < 1 || num > 5 || !Number.isInteger(num)) {
      throw AppErrors.validationError(
        'score',
        'Rating must be an integer between 1 and 5',
        'রেটিং অবশ্যই ১ থেকে ৫ তারকার মধ্যে হতে হবে।'
      );
    }
    return num;
  },

  /**
   * Validates non-empty string fields (e.g. city, area, reason)
   */
  validateRequiredString(value: unknown, fieldName: string, fieldNameBn: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw AppErrors.validationError(
        fieldName,
        `${fieldName} is required`,
        `${fieldNameBn} পূরণ করা আবশ্যক।`
      );
    }
    return value.trim();
  },
};
