// BOHOK Phase 8 — Server Environment Configuration
// Provides strictly typed configuration with demo fallbacks

export interface ServerConfig {
  env: 'development' | 'production' | 'test';
  isDemoMode: boolean;
  demoOtp: string;
  sessionCookieName: string;
  sessionDurationSeconds: number;
  otpExpiryMinutes: number;
  maxOtpAttempts: number;
  databaseUrl?: string;
  jwtSecret: string;
}

export const serverConfig: ServerConfig = {
  env: (process.env.NODE_ENV as ServerConfig['env']) || 'development',
  isDemoMode: process.env.DEMO_MODE !== 'false', // Default true for prototype safety
  demoOtp: process.env.DEMO_OTP_CODE || '123456',
  sessionCookieName: 'bohok_session_token',
  sessionDurationSeconds: 7 * 24 * 60 * 60, // 7 days
  otpExpiryMinutes: 15,
  maxOtpAttempts: 3,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'bohok_dev_secret_do_not_use_in_prod_1234567890',
};
