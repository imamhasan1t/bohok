// BOHOK Phase 7 — Payment & Escrow Abstraction Types
// Peer-to-peer trust guarantee with demo escrow capabilities

export type PaymentStatus =
  | 'UNPAID'
  | 'INITIATED'
  | 'HELD'
  | 'RELEASED'
  | 'REFUNDED'
  | 'FAILED';

export type PaymentMethod =
  | 'bkash'
  | 'nagad'
  | 'upay'
  | 'card'
  | 'demo_escrow';

export interface PaymentBreakdown {
  travellerFee: number;     // সহযাত্রী প্রাপ্য ভাড়া
  platformFee: number;      // প্ল্যাটফর্ম সার্ভিস ফি
  trustGuarantee: number;   // ট্রাস্ট ও ট্র্যাকিং ফি
  totalAmount: number;      // সর্বমোট প্রদেয়
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  transactionNumber: string;
  amount: number;
  breakdown: PaymentBreakdown;
  method: PaymentMethod;
  methodNameBn: string;
  status: PaymentStatus;
  statusBn: string;
  isDemo: boolean;
  payerUserId: string;
  payeeUserId: string;
  createdAt: string;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  noteBn?: string;
}

export interface PaymentProvider {
  readonly name: string;
  readonly isDemo: boolean;
  
  createTransaction(
    bookingId: string,
    breakdown: PaymentBreakdown,
    method: PaymentMethod,
    payerUserId: string,
    payeeUserId: string
  ): Promise<PaymentTransaction>;
  
  holdEscrow(transactionId: string): Promise<PaymentTransaction>;
  releaseEscrow(transactionId: string): Promise<PaymentTransaction>;
  refundEscrow(transactionId: string, reasonBn: string): Promise<PaymentTransaction>;
  getTransaction(transactionId: string): Promise<PaymentTransaction | null>;
}
