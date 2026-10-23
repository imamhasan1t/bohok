// BOHOK Phase 9 — Idempotency & Webhook Anti-Replay Store
// Guarantees exact-once execution for financial authorizations, bookings, and webhook callbacks

export interface IdempotencyRecord<T = unknown> {
  key: string;
  createdAt: number;
  expiresAt: number;
  status: 'PENDING' | 'RESOLVED' | 'FAILED';
  responsePayload?: T;
}

export class IdempotencyStore {
  private records = new Map<string, IdempotencyRecord>();

  /**
   * Check or acquire lock for an idempotency key
   * @param key Unique key (e.g., `wh:bkash:trx_12345` or `booking_create:usr_1:nonce_abc`)
   * @param ttlSeconds TTL in seconds (default 24 hours)
   */
  public acquire<T = unknown>(
    key: string,
    ttlSeconds = 86400
  ): { isDuplicate: boolean; record?: IdempotencyRecord<T> } {
    const now = Date.now();
    const existing = this.records.get(key);

    if (existing) {
      if (existing.expiresAt > now) {
        return { isDuplicate: true, record: existing as IdempotencyRecord<T> };
      }
      // Expired record
      this.records.delete(key);
    }

    const newRecord: IdempotencyRecord<T> = {
      key,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
      status: 'PENDING',
    };

    this.records.set(key, newRecord as IdempotencyRecord);
    return { isDuplicate: false, record: newRecord };
  }

  /**
   * Store the resolved response payload for cached replay
   */
  public resolve<T = unknown>(key: string, payload: T): void {
    const record = this.records.get(key);
    if (record) {
      record.status = 'RESOLVED';
      record.responsePayload = payload;
    }
  }

  /**
   * Release or fail the idempotency key so the client may safely retry
   */
  public fail(key: string): void {
    this.records.delete(key);
  }

  /**
   * Clean up expired records
   */
  public purgeExpired(): void {
    const now = Date.now();
    for (const [key, rec] of this.records.entries()) {
      if (rec.expiresAt <= now) {
        this.records.delete(key);
      }
    }
  }

  public clear(): void {
    this.records.clear();
  }
}

export const serverIdempotencyStore = new IdempotencyStore();
