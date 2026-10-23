// BOHOK Phase 8 — Typed Server Application Errors & Bengali User Messages
// Protects internal error stacks while returning user-friendly responses

export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_STATE'
  | 'CAPACITY_EXCEEDED'
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_ALREADY_USED'
  | 'PAYMENT_FAILED'
  | 'BOOKING_CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  messageBn: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly messageBn: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.messageBn = options.messageBn;
    this.statusCode = options.statusCode;
    this.details = options.details;
  }
}

// Error Factories for clean, standard usage across backend services
export const AppErrors = {
  authRequired(message = 'Authentication required', messageBn = 'অনুগ্রহ করে প্রথমে লগইন করুন।') {
    return new AppError({
      code: 'AUTH_REQUIRED',
      message,
      messageBn,
      statusCode: 401,
    });
  },

  forbidden(message = 'Access forbidden', messageBn = 'আপনার এই কাজটি করার অনুমতি নেই।') {
    return new AppError({
      code: 'FORBIDDEN',
      message,
      messageBn,
      statusCode: 403,
    });
  },

  notFound(entity = 'Resource', messageBn = 'অনুরোধকৃত তথ্য খুঁজে পাওয়া যায়নি।') {
    return new AppError({
      code: 'NOT_FOUND',
      message: `${entity} not found`,
      messageBn,
      statusCode: 404,
    });
  },

  invalidState(current: string, target: string, messageBn?: string) {
    return new AppError({
      code: 'INVALID_STATE',
      message: `Cannot transition from '${current}' to '${target}'`,
      messageBn: messageBn || `বর্তমান অবস্থা '${current}' থেকে '${target}'-এ পরিবর্তন গ্রহণযোগ্য নয়।`,
      statusCode: 400,
      details: { current, target },
    });
  },

  capacityExceeded(required: number, available: number) {
    return new AppError({
      code: 'CAPACITY_EXCEEDED',
      message: `Capacity exceeded: requested ${required}kg, available ${available}kg`,
      messageBn: `সহযাত্রীর অবশিষ্ট সক্ষমতা (${available} কেজি) পার্সেলের ওজনের (${required} কেজি) চেয়ে কম।`,
      statusCode: 400,
      details: { required, available },
    });
  },

  otpInvalid(attemptsRemaining?: number) {
    const attemptsMsg = attemptsRemaining !== undefined ? ` (অবশিষ্ট সুযোগ: ${attemptsRemaining} বার)` : '';
    return new AppError({
      code: 'OTP_INVALID',
      message: 'Invalid OTP code',
      messageBn: `ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোডটি লিখুন।${attemptsMsg}`,
      statusCode: 400,
      details: { attemptsRemaining },
    });
  },

  otpExpired() {
    return new AppError({
      code: 'OTP_EXPIRED',
      message: 'OTP has expired',
      messageBn: 'ওটিপির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন ওটিপির জন্য অনুরোধ করুন।',
      statusCode: 400,
    });
  },

  otpAlreadyUsed() {
    return new AppError({
      code: 'OTP_ALREADY_USED',
      message: 'OTP code has already been verified',
      messageBn: 'এই ওটিপি কোডটি ইতিমধ্যে যাচাই করা হয়েছে।',
      statusCode: 400,
    });
  },

  bookingConflict(message = 'Active booking conflict', messageBn = 'এই পার্সেলটির জন্য ইতিমধ্যে একটি সক্রিয় বুকিং চলমান রয়েছে।') {
    return new AppError({
      code: 'BOOKING_CONFLICT',
      message,
      messageBn,
      statusCode: 409,
    });
  },

  validationError(field: string, message: string, messageBn: string) {
    return new AppError({
      code: 'VALIDATION_ERROR',
      message: `Validation failed on ${field}: ${message}`,
      messageBn,
      statusCode: 422,
      details: { field },
    });
  },

  internal(message = 'Internal server error', messageBn = 'সার্ভারে সাময়িক ত্রুটি দেখা দিয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।') {
    return new AppError({
      code: 'INTERNAL_ERROR',
      message,
      messageBn,
      statusCode: 500,
    });
  },
};
