// BOHOK Phase 9 — Nagad Webhook Callback Route
// Endpoint: POST /api/webhooks/nagad

import { NextRequest, NextResponse } from 'next/server';
import { nagadAdapter } from '@/lib/server/payment/nagadAdapter';
import { serverIdempotencyStore } from '@/lib/server/security/idempotency';
import { serverPaymentService } from '@/lib/server/payment/paymentGatewayService';
import { serverDb } from '@/lib/server/db/memoryDb';
import { AuditLogger } from '@/lib/server/audit/auditLogger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-nagad-signature') || req.headers.get('x-signature') || '';

    // 1. Signature Verification
    const sigCheck = nagadAdapter.verifyWebhookSignature(rawBody, signature);
    if (!sigCheck.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature', errorBn: 'অবৈধ নগদ ওয়েবহুক স্বাক্ষর।' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody || '{}');
    const paymentRefId = payload.payment_ref_id || payload.trxId;
    const bookingId = payload.order_id || payload.bookingId;

    if (!paymentRefId || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_ref_id or order_id' },
        { status: 400 }
      );
    }

    // 2. Anti-Replay Idempotency Protection
    const replayKey = `wh:nagad:${paymentRefId}`;
    const replayCheck = serverIdempotencyStore.acquire(replayKey, 86400);
    if (replayCheck.isDuplicate) {
      return NextResponse.json({
        success: true,
        message: 'Duplicate Nagad webhook ignored via idempotency check',
        messageBn: 'পূর্বে প্রক্রিয়া করা নগদ ওয়েবহুক অনুরোধ',
      });
    }

    // 3. Payment State Reconciliation
    const booking = serverDb.bookings.get(bookingId);
    if (booking) {
      await serverPaymentService.initiatePayment('nagad', {
        bookingId,
        senderId: booking.senderId,
        senderPhone: '+8801800000000',
        amount: booking.totalAmount,
      });
    }

    serverIdempotencyStore.resolve(replayKey, { processedAt: Date.now() });

    AuditLogger.log({
      actorUserId: 'system:nagad_webhook',
      entityType: 'payment',
      entityId: paymentRefId,
      eventType: 'WEBHOOK_PROCESSED',
      metadata: { provider: 'nagad', bookingId },
    });

    return NextResponse.json({
      success: true,
      message: 'Nagad webhook processed successfully',
      messageBn: 'নগদ ওয়েবহুক সফলভাবে সম্পন্ন হয়েছে।',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
