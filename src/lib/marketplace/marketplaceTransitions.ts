// BOHOK Phase 5.5 — State Machine Transition Validation Layer
// Enforces strict, deterministic lifecycle transitions for Bangladesh crowdshipping

import {
  TripStatus,
  ParcelStatus,
  MatchStatus,
  BookingStatus,
  HandoverStatus,
  PaymentStatus,
} from './marketplaceTypes';

// ==========================================
// 1. ALLOWED TRANSITIONS DEFINITION
// ==========================================

export const TRIP_TRANSITIONS: Record<TripStatus, readonly TripStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['MATCHING', 'ACTIVE', 'CANCELLED'],
  MATCHING: ['ACTIVE', 'PUBLISHED', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const PARCEL_TRANSITIONS: Record<ParcelStatus, readonly ParcelStatus[]> = {
  DRAFT: ['SEARCHING', 'CANCELLED'],
  SEARCHING: ['MATCHED', 'BOOKED', 'CANCELLED'],
  MATCHED: ['BOOKED', 'SEARCHING', 'CANCELLED'],
  BOOKED: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const MATCH_TRANSITIONS: Record<MatchStatus, readonly MatchStatus[]> = {
  CANDIDATE: ['REQUESTED', 'EXPIRED'],
  REQUESTED: ['ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'],
  ACCEPTED: ['CANCELLED'],
  DECLINED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  PENDING_TRAVELLER: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKUP_PENDING', 'CANCELLED'],
  PICKUP_PENDING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERY_PENDING', 'DISPUTED'],
  DELIVERY_PENDING: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['DISPUTED'],
  CANCELLED: [],
  DISPUTED: ['DELIVERED', 'CANCELLED'],
};

export const HANDOVER_TRANSITIONS: Record<HandoverStatus, readonly HandoverStatus[]> = {
  PICKUP_PENDING: ['PICKUP_VERIFIED'],
  PICKUP_VERIFIED: ['DELIVERY_PENDING'],
  DELIVERY_PENDING: ['DELIVERY_VERIFIED'],
  DELIVERY_VERIFIED: [],
};

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  PENDING: ['HELD', 'REFUNDED'],
  HELD: ['RELEASED', 'REFUNDED', 'DISPUTED'],
  RELEASED: [],
  REFUNDED: [],
  DISPUTED: ['RELEASED', 'REFUNDED'],
};

// ==========================================
// 2. VALIDATION UTILITIES
// ==========================================

export interface TransitionValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export function validateTripTransition(
  current: TripStatus,
  target: TripStatus
): TransitionValidationResult {
  if (current === target) {
    return { valid: true };
  }
  const allowed = TRIP_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Trip transition: Cannot transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

export function validateParcelTransition(
  current: ParcelStatus,
  target: ParcelStatus
): TransitionValidationResult {
  if (current === target) {
    return { valid: true };
  }
  const allowed = PARCEL_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Parcel transition: Cannot transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

export function validateMatchTransition(
  current: MatchStatus,
  target: MatchStatus
): TransitionValidationResult {
  if (current === target) {
    return { valid: true };
  }
  const allowed = MATCH_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Match transition: Cannot transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

export function validateBookingTransition(
  current: BookingStatus,
  target: BookingStatus
): TransitionValidationResult {
  if (current === target) {
    return { valid: true };
  }
  const allowed = BOOKING_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Booking transition: Cannot transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

export function validateHandoverTransition(
  current: HandoverStatus,
  target: HandoverStatus
): TransitionValidationResult {
  if (current === target) {
    return { valid: true };
  }
  const allowed = HANDOVER_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Handover transition: Cannot transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

export function validatePaymentTransition(
  current: PaymentStatus,
  target: PaymentStatus
): TransitionValidationResult {
  if (current === target) {
    return { valid: true };
  }
  const allowed = PAYMENT_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Payment transition: Cannot transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}
