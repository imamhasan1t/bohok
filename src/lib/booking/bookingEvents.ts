// BOHOK Phase 7 — Booking Event Definitions
// Audit log & event streaming for lifecycle monitoring

import { BookingLifecycleStatus } from './bookingTypes';

export type BookingEventType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'PAYMENT_ESCROW_HELD'
  | 'TRAVELLER_ARRIVED_PICKUP'
  | 'HANDOVER_OTP_VERIFIED'
  | 'JOURNEY_STARTED'
  | 'CHECKPOINT_REACHED'
  | 'ARRIVED_DESTINATION'
  | 'DELIVERY_OTP_VERIFIED'
  | 'PAYMENT_ESCROW_RELEASED'
  | 'RATING_SUBMITTED'
  | 'DISPUTE_RAISED'
  | 'BOOKING_CANCELLED';

export interface BookingEvent {
  id: string;
  bookingId: string;
  type: BookingEventType;
  status: BookingLifecycleStatus;
  titleBn: string;
  descriptionBn: string;
  actorRole: 'sender' | 'traveller' | 'recipient' | 'system';
  actorId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function createBookingEvent(
  bookingId: string,
  type: BookingEventType,
  status: BookingLifecycleStatus,
  titleBn: string,
  descriptionBn: string,
  actorRole: 'sender' | 'traveller' | 'recipient' | 'system',
  actorId: string,
  metadata?: Record<string, unknown>
): BookingEvent {
  return {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingId,
    type,
    status,
    titleBn,
    descriptionBn,
    actorRole,
    actorId,
    metadata,
    createdAt: new Date().toISOString(),
  };
}
