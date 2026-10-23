// BOHOK Phase 6 — Authentication & Trust Foundation Types
// Strongly typed domain model for user identity, sessions, roles, and trust signals

export type UserRole = 'SENDER' | 'TRAVELLER' | 'BOTH';

export type VerificationStatus =
  | 'NEW'
  | 'PHONE_VERIFIED'
  | 'IDENTITY_VERIFIED'
  | 'TRUSTED_TRAVELLER';

export type AuthState =
  | 'LOGGED_OUT'
  | 'OTP_REQUESTED'
  | 'OTP_VERIFIED'
  | 'AUTHENTICATED'
  | 'SESSION_EXPIRED';

export interface User {
  id: string; // Stable UUID or slug, never name or phone number
  name: string;
  phone: string; // E.g. "+8801711002233"
  maskedPhone: string; // E.g. "+880 17***-**233"
  avatar: string;
  avatarInitials: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  verificationBadgeBn: string;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean; // MUST be false in demo/prototype
  rating: number; // 0.0 to 5.0
  completedTrips: number;
  completedDeliveries: number;
  createdAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface OtpRequestResult {
  success: boolean;
  messageBn: string;
  otpCodeDemo?: string;
  expiresAt: string;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  messageBn: string;
  session?: Session;
  user?: User;
  error?: string;
}

export interface TrustSignals {
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  verificationBadgeTextBn: string;
  rating: number;
  completedTrips: number;
  completedDeliveries: number;
  cancellationRate: number; // 0.0 to 1.0
  successfulHandovers: number;
  trustLevelBn: string;
}

export type AuthEventType =
  | 'USER_REGISTERED'
  | 'OTP_REQUESTED'
  | 'PHONE_VERIFIED'
  | 'LOGIN_SUCCESS'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_COMPLETED'
  | 'VERIFICATION_FAILED';

export interface AuthEvent {
  id: string;
  type: AuthEventType;
  userId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
  descriptionBn: string;
}
