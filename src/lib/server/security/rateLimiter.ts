// BOHOK Phase 9 — Server-Side Sliding Window Rate Limiter
// Enforces request throttling for OTP generation, authentication, and sensitive mutation endpoints

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  messageBn?: string;
}

interface WindowBucket {
  timestamps: number[];
}

export class MemoryRateLimiter {
  private buckets = new Map<string, WindowBucket>();

  /**
   * Check and consume one token from the rate limit bucket
   * @param key Identifier (e.g. `otp:phone:+8801700000000` or `ip:192.168.1.1`)
   * @param maxRequests Maximum requests allowed within the window
   * @param windowSeconds Window length in seconds
   */
  public checkLimit(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.buckets.set(key, bucket);
    }

    // Filter out expired timestamps
    bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

    if (bucket.timestamps.length >= maxRequests) {
      const oldest = bucket.timestamps[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
        messageBn: `অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে ${resetInSeconds} সেকেন্ড অপেক্ষা করুন।`,
      };
    }

    // Record request timestamp
    bucket.timestamps.push(now);

    return {
      allowed: true,
      remaining: maxRequests - bucket.timestamps.length,
      resetInSeconds: windowSeconds,
    };
  }

  /**
   * Check cooldown between consecutive requests (e.g., 60 seconds between OTP requests)
   */
  public checkCooldown(key: string, cooldownSeconds: number): { inCooldown: boolean; remainingSeconds: number } {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.timestamps.length === 0) {
      return { inCooldown: false, remainingSeconds: 0 };
    }

    const last = bucket.timestamps[bucket.timestamps.length - 1];
    const diffSeconds = Math.floor((now - last) / 1000);

    if (diffSeconds < cooldownSeconds) {
      return {
        inCooldown: true,
        remainingSeconds: cooldownSeconds - diffSeconds,
      };
    }

    return { inCooldown: false, remainingSeconds: 0 };
  }

  /**
   * Clear rate limit history for a specific key (e.g. upon successful verification)
   */
  public resetKey(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all rate limits (testing utility)
   */
  public resetAll(): void {
    this.buckets.clear();
  }
}

export const serverRateLimiter = new MemoryRateLimiter();
