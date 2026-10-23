// BOHOK Phase 9 — SMS Provider & Dispatch Architecture Types

export interface SmsSendPayload {
  recipientPhone: string; // E.164 normalized format (+8801XXXXXXXXX)
  message: string;
  templateType: 'OTP' | 'BOOKING_ALERT' | 'HANDOVER_ALERT' | 'DELIVERY_ALERT' | 'PAYMENT_ALERT';
}

export interface SmsSendResult {
  success: boolean;
  providerName: string;
  messageId?: string;
  isDemo: boolean;
  error?: string;
  errorBn?: string;
  statusTextBn: string;
}

export interface ISmsProvider {
  name: string;
  isConfigured(): boolean;
  send(payload: SmsSendPayload): Promise<SmsSendResult>;
}
