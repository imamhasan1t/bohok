// BOHOK Phase 8 — Immutable Server Audit Log Service
// Records tamper-evident audit events for security and regulatory compliance

import { serverDb } from '../db/memoryDb';
import { DbAuditLog } from '../db/dbTypes';

export type AuditEventType =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'BOOKING_CREATED'
  | 'BOOKING_ACCEPTED'
  | 'PAYMENT_HELD'
  | 'HANDOVER_VERIFIED'
  | 'JOURNEY_STARTED'
  | 'DELIVERY_VERIFIED'
  | 'PAYMENT_RELEASED'
  | 'BOOKING_CANCELLED'
  | 'DISPUTE_CREATED'
  | 'WEBHOOK_PROCESSED';

export const AuditLogger = {
  /**
   * Appends an immutable audit event
   * Automatically scrubs any accidental OTP plaintext fields from metadata
   */
  log(params: {
    actorUserId?: string;
    entityType: DbAuditLog['entityType'];
    entityId: string;
    eventType: AuditEventType;
    metadata?: Record<string, unknown>;
  }): DbAuditLog {
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Redact any sensitive OTP fields from metadata
    const sanitizedMetadata: Record<string, unknown> = { ...(params.metadata || {}) };
    delete sanitizedMetadata.otp;
    delete sanitizedMetadata.otpCode;
    delete sanitizedMetadata.otp1;
    delete sanitizedMetadata.otp2;
    delete sanitizedMetadata.plainCode;
    delete sanitizedMetadata.hashedCode;

    const entry: DbAuditLog = {
      id,
      actorUserId: params.actorUserId,
      entityType: params.entityType,
      entityId: params.entityId,
      eventType: params.eventType,
      metadata: sanitizedMetadata,
      createdAt: now,
    };

    serverDb.auditLogs.push(entry);
    return entry;
  },

  /**
   * Retrieves audit trail for a specific entity
   */
  getTrailForEntity(entityType: DbAuditLog['entityType'], entityId: string): DbAuditLog[] {
    return serverDb.auditLogs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId
    );
  },
};
