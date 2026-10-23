// BOHOK Phase 7 — Demo Payment Provider Implementation
// Simulates secure Escrow transactions with transparent fee breakdowns and zero real financial charge

import {
  PaymentBreakdown,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PaymentTransaction,
} from './paymentTypes';

export class DemoPaymentProvider implements PaymentProvider {
  public readonly name = 'BOHOK Demo Escrow System';
  public readonly isDemo = true;

  private transactions = new Map<string, PaymentTransaction>();

  constructor() {
    this.seedInitialTransactions();
  }

  private seedInitialTransactions(): void {
    const txn1: PaymentTransaction = {
      id: 'TXN-DEMO-89241-01',
      bookingId: 'BHK-89241',
      transactionNumber: 'TXN-DEMO-89241-01',
      amount: 180,
      breakdown: { travellerFee: 150, platformFee: 20, trustGuarantee: 10, totalAmount: 180 },
      method: 'bkash',
      methodNameBn: 'বিকাশ (bKash)',
      status: 'HELD',
      statusBn: 'এসক্রোতে সুরক্ষিত রয়েছে',
      isDemo: true,
      payerUserId: 'user-sender-imam',
      payeeUserId: 'user-traveller-rahim',
      createdAt: new Date().toISOString(),
      heldAt: new Date().toISOString(),
    };

    const txn2: PaymentTransaction = {
      id: 'TXN-DEMO-74192-02',
      bookingId: 'BHK-74192',
      transactionNumber: 'TXN-DEMO-74192-02',
      amount: 325,
      breakdown: { travellerFee: 280, platformFee: 30, trustGuarantee: 15, totalAmount: 325 },
      method: 'bkash',
      methodNameBn: 'বিকাশ (bKash)',
      status: 'HELD',
      statusBn: 'এসক্রোতে সুরক্ষিত রয়েছে',
      isDemo: true,
      payerUserId: 'user-sender-imam',
      payeeUserId: 'user-traveller-tanjil',
      createdAt: new Date().toISOString(),
      heldAt: new Date().toISOString(),
    };

    this.transactions.set(txn1.id, txn1);
    this.transactions.set(txn2.id, txn2);
  }

  public async createTransaction(
    bookingId: string,
    breakdown: PaymentBreakdown,
    method: PaymentMethod = 'bkash',
    payerUserId: string,
    payeeUserId: string
  ): Promise<PaymentTransaction> {
    const txnNumber = `TXN-DEMO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const id = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const methodNames: Record<PaymentMethod, string> = {
      bkash: 'বিকাশ (bKash)',
      nagad: 'নগদ (Nagad)',
      upay: 'উপায় (Upay)',
      card: 'ডেবিট/ক্রেডিট কার্ড',
      demo_escrow: 'ডেমো এসক্রো অ্যাকাউন্ট',
    };

    const txn: PaymentTransaction = {
      id,
      bookingId,
      transactionNumber: txnNumber,
      amount: breakdown.totalAmount,
      breakdown,
      method,
      methodNameBn: methodNames[method] || 'ডেমো এসক্রো',
      status: 'INITIATED',
      statusBn: 'পেমেন্ট শুরু হয়েছে',
      isDemo: true,
      payerUserId,
      payeeUserId,
      createdAt: new Date().toISOString(),
      noteBn: 'পরীক্ষামূলক ডেমো এসক্রো তহবিল। কোনো বাস্তব টাকা কাটা হয়নি।',
    };

    this.transactions.set(id, txn);
    return txn;
  }

  public async holdEscrow(transactionId: string): Promise<PaymentTransaction> {
    const txn = this.transactions.get(transactionId);
    if (!txn) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const updated: PaymentTransaction = {
      ...txn,
      status: 'HELD',
      statusBn: 'এসক্রোতে সুরক্ষিত রয়েছে',
      heldAt: new Date().toISOString(),
      noteBn: 'টাকা BOHOK ডেমো এসক্রো ভল্টে সুরক্ষিত আছে। ডেলিভারি যাচাই শেষে সহযাত্রীকে দেওয়া হবে।',
    };

    this.transactions.set(transactionId, updated);
    return updated;
  }

  public async releaseEscrow(transactionId: string): Promise<PaymentTransaction> {
    const txn = this.transactions.get(transactionId);
    if (!txn) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (txn.status !== 'HELD') {
      throw new Error(`Cannot release escrow from status '${txn.status}'. Must be 'HELD'.`);
    }

    const updated: PaymentTransaction = {
      ...txn,
      status: 'RELEASED',
      statusBn: 'সহযাত্রীকে প্রদান সম্পন্ন',
      releasedAt: new Date().toISOString(),
      noteBn: 'ডেলিভারি ওটিপি সফলভাবে যাচাই হয়েছে। সহযাত্রীর ডেমো অ্যাকাউন্টে টাকা স্থানান্তর করা হয়েছে।',
    };

    this.transactions.set(transactionId, updated);
    return updated;
  }

  public async refundEscrow(transactionId: string, reasonBn: string): Promise<PaymentTransaction> {
    const txn = this.transactions.get(transactionId);
    if (!txn) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (txn.status === 'RELEASED') {
      throw new Error(`Cannot refund already released transaction`);
    }

    const updated: PaymentTransaction = {
      ...txn,
      status: 'REFUNDED',
      statusBn: 'প্রেরককে ফেরত প্রদান করা হয়েছে',
      refundedAt: new Date().toISOString(),
      noteBn: `বুকিং বাতিলের কারণে টাকা ফেরত দেওয়া হয়েছে: ${reasonBn}`,
    };

    this.transactions.set(transactionId, updated);
    return updated;
  }

  public async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  public seedTransaction(txn: PaymentTransaction): void {
    this.transactions.set(txn.id, txn);
  }
}

export const defaultDemoPaymentProvider = new DemoPaymentProvider();
