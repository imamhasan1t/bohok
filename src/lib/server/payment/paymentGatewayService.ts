// BOHOK Phase 9 — Centralized Payment Gateway Service & Escrow Orchestration
// Coordinates bKash, Nagad, and Demo Escrow with Idempotency Protection

import {
  PaymentGatewayProvider,
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentExecuteResult,
} from './paymentGatewayTypes';
import { bkashAdapter } from './bkashAdapter';
import { nagadAdapter } from './nagadAdapter';
import { serverIdempotencyStore } from '../security/idempotency';
import { serverDb } from '../db/memoryDb';
import { AuditLogger } from '../audit/auditLogger';
import { ServerNotificationService } from '../notifications/notificationService';
import { AppErrors } from '../errors/appErrors';

export class PaymentGatewayService {
  /**
   * Initiate Escrow Payment through requested MFS Gateway
   */
  public async initiatePayment(
    provider: PaymentGatewayProvider,
    params: PaymentInitiateParams
  ): Promise<PaymentInitiateResult> {
    const booking = serverDb.bookings.get(params.bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং রেকর্ড পাওয়া যায়নি।');
    }

    // Check payment idempotency to prevent duplicate initializations
    const idemKey = `pay_init:${params.bookingId}:${provider}`;
    const idemCheck = serverIdempotencyStore.acquire<PaymentInitiateResult>(idemKey, 3600);
    if (idemCheck.isDuplicate && idemCheck.record?.responsePayload) {
      return idemCheck.record.responsePayload;
    }

    let result: PaymentInitiateResult;

    if (provider === 'bkash') {
      result = await bkashAdapter.initiateEscrowPayment(params);
    } else if (provider === 'nagad') {
      result = await nagadAdapter.initiateEscrowPayment(params);
    } else {
      // Demo escrow
      const paymentId = `demo_escrow_${params.bookingId}`;
      result = {
        success: true,
        paymentId,
        provider: 'demo_escrow',
        isDemo: true,
        status: 'HELD',
        statusTextBn: 'সিমুলেটেড ডেমো এস্ক্রোতে অর্থ নিরাপদে জমা রাখা হয়েছে',
      };
    }

    if (result.success) {
      // Record payment in server repository
      const now = new Date().toISOString();
      serverDb.payments.set(params.bookingId, {
        id: result.paymentId,
        bookingId: params.bookingId,
        amount: params.amount,
        status: 'HELD',
        method: provider,
        heldAt: now,
        createdAt: now,
        updatedAt: now,
      });

      // Update booking status
      booking.status = 'READY_FOR_PICKUP';

      // Cache resolved idempotency result
      serverIdempotencyStore.resolve(idemKey, result);

      AuditLogger.log({
        actorUserId: params.senderId,
        entityType: 'payment',
        entityId: result.paymentId,
        eventType: 'PAYMENT_HELD',
        metadata: {
          bookingId: params.bookingId,
          amount: params.amount,
          provider,
        },
      });

      ServerNotificationService.dispatch({
        userId: booking.travellerId,
        type: 'PAYMENT_HELD',
        titleBn: 'পেমেন্ট সম্পন্ন হয়েছে',
        bodyBn: `প্রেরক ৳${params.amount} এস্ক্রোতে জমা দিয়েছেন। পার্সেল পিকআপের প্রস্তুতি নিন।`,
        entityType: 'booking',
        entityId: params.bookingId,
      });
    } else {
      serverIdempotencyStore.fail(idemKey);
    }

    return result;
  }

  /**
   * Release Escrow funds to Traveller wallet upon verified delivery
   */
  public async releaseEscrow(
    bookingId: string,
    travellerPhone: string
  ): Promise<PaymentExecuteResult> {
    const booking = serverDb.bookings.get(bookingId);
    if (!booking) throw AppErrors.notFound('Booking');

    const payment = serverDb.payments.get(bookingId);
    if (!payment) throw AppErrors.notFound('Payment');

    let result: PaymentExecuteResult;

    if (payment.method === 'bkash') {
      result = await bkashAdapter.releaseEscrowPayout(bookingId, travellerPhone, booking.travellerFee);
    } else if (payment.method === 'nagad') {
      result = await nagadAdapter.releaseEscrowPayout(bookingId, travellerPhone, booking.travellerFee);
    } else {
      result = {
        success: true,
        paymentId: payment.id,
        trxId: `demo_rel_${Date.now()}`,
        amount: booking.travellerFee,
        provider: 'demo_escrow',
        status: 'RELEASED',
        statusTextBn: `ডেমো এস্ক্রো থেকে সহযাত্রীর ওয়ালেটে ৳${booking.travellerFee} রিলিজ করা হয়েছে`,
      };
    }

    if (result.success) {
      const now = new Date().toISOString();
      payment.status = 'RELEASED';
      payment.releasedAt = now;
      payment.updatedAt = now;

      AuditLogger.log({
        actorUserId: booking.travellerId,
        entityType: 'payment',
        entityId: payment.id,
        eventType: 'PAYMENT_RELEASED',
        metadata: {
          bookingId,
          amount: booking.travellerFee,
          provider: payment.method,
        },
      });
    }

    return result;
  }

  /**
   * Refund Escrow funds back to Sender upon cancellation or dispute resolution
   */
  public async refundEscrow(bookingId: string, reason: string): Promise<PaymentExecuteResult> {
    const payment = serverDb.payments.get(bookingId);
    if (!payment) throw AppErrors.notFound('Payment');

    let result: PaymentExecuteResult;
    if (payment.method === 'bkash') {
      result = await bkashAdapter.refundEscrow(bookingId, payment.amount, reason);
    } else if (payment.method === 'nagad') {
      result = await nagadAdapter.refundEscrow(bookingId, payment.amount, reason);
    } else {
      result = {
        success: true,
        paymentId: payment.id,
        trxId: `demo_ref_${Date.now()}`,
        amount: payment.amount,
        provider: 'demo_escrow',
        status: 'REFUNDED',
        statusTextBn: `ডেমো এস্ক্রো থেকে প্রেরককে ৳${payment.amount} ফেরত দেওয়া হয়েছে`,
      };
    }

    payment.status = 'REFUNDED';
    payment.updatedAt = new Date().toISOString();

    return result;
  }
}

export const serverPaymentService = new PaymentGatewayService();
