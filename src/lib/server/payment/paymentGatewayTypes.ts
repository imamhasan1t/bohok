// BOHOK Phase 9 — Payment Gateway & Escrow Adapter Types
// Supports bKash Tokenized Checkout, Nagad Merchant API, and Demo Escrow

export type PaymentGatewayProvider = 'bkash' | 'nagad' | 'demo_escrow';

export interface PaymentInitiateParams {
  bookingId: string;
  senderId: string;
  senderPhone: string;
  amount: number;
  callbackUrl?: string;
}

export interface PaymentInitiateResult {
  success: boolean;
  paymentId: string;
  gatewayUrl?: string;
  provider: PaymentGatewayProvider;
  isDemo: boolean;
  status: 'PENDING' | 'HELD' | 'FAILED';
  statusTextBn: string;
  error?: string;
  errorBn?: string;
}

export interface PaymentExecuteResult {
  success: boolean;
  paymentId: string;
  trxId: string;
  amount: number;
  provider: PaymentGatewayProvider;
  status: 'HELD' | 'RELEASED' | 'REFUNDED' | 'FAILED';
  statusTextBn: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  reason?: string;
}

export interface IPaymentGatewayAdapter {
  provider: PaymentGatewayProvider;
  isConfigured(): boolean;
  initiateEscrowPayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;
  executeEscrowHold(paymentId: string, trxId?: string): Promise<PaymentExecuteResult>;
  releaseEscrowPayout(bookingId: string, travellerPhone: string, amount: number): Promise<PaymentExecuteResult>;
  refundEscrow(bookingId: string, amount: number, reason: string): Promise<PaymentExecuteResult>;
  verifyWebhookSignature(payload: string, signature: string, timestamp?: string): WebhookVerificationResult;
}
