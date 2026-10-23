// BOHOK Phase 9 — bKash Webhook Callback Route
// Endpoint: POST /api/webhooks/bkash

import { NextRequest, NextResponse } from 'next/server';
import { bkashAdapter } from '@/lib/server/payment/bkashAdapter';
import { serverIdempotencyStore } from '@/lib/server/security/idempotency';
import { serverPaymentService } from '@/lib/server/payment/paymentGatewayService';
import { serverDb } from '@/lib/server/db/memoryDb';
import { AuditLogger } from '@/lib/server/audit/auditLogger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-bkash-signature') || req.headers.get('x-signature') || '';

    // 1. Webhook Signature Verification
    const sigCheck = bkashAdapter.verifyWebhookSignature(rawBody, signature);
    if (!sigCheck.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature', errorBn: 'অবৈধ বিকাশ ওয়েবহুক স্বাক্ষর।' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody || '{}');
    const trxId = payload.trxID || payload.trxId;
    const bookingId = payload.merchantInvoiceNumber || payload.bookingId;

    if (!trxId || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing trxId or bookingId' },
        { status: 400 }
      );
    }

    // 2. Anti-Replay Idempotency Protection
    const replayKey = `wh:bkash:${trxId}`;
    const replayCheck = serverIdempotencyStore.acquire(replayKey, 86400);
    if (replayCheck.isDuplicate) {
      return NextResponse.json({
        success: true,
        message: 'Duplicate webhook ignored via idempotency check',
        messageBn: 'পূর্বে প্রক্রিয়া করা ওয়েবহুক অনুরোধ',
      });
    }

    // 3. Payment State Reconciliation
    const booking = serverDb.bookings.get(bookingId);
    if (booking) {
      await serverPaymentService.initiatePayment('bkash', {
        bookingId,
        senderId: booking.senderId,
        senderPhone: '+8801700000000',
        amount: booking.totalAmount,
      });
    }

    serverIdempotencyStore.resolve(replayKey, { processedAt: Date.now() });

    AuditLogger.log({
      actorUserId: 'system:bkash_webhook',
      entityType: 'payment',
      entityId: trxId,
      eventType: 'WEBHOOK_PROCESSED',
      metadata: { provider: 'bkash', bookingId },
    });

    return NextResponse.json({
      success: true,
      message: 'bKash webhook processed successfully',
      messageBn: 'বিকাশ ওয়েবহুক সফলভাবে সম্পন্ন হয়েছে।',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
