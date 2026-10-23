// BOHOK Phase 7 — Booking State Machine Transition Layer
// Enforces deterministic state transitions for crowdshipping parcel operations

import { BookingLifecycleStatus } from './bookingTypes';

// Allowed forward and branching transitions
export const BOOKING_LIFECYCLE_TRANSITIONS: Record<
  BookingLifecycleStatus,
  readonly BookingLifecycleStatus[]
> = {
  PENDING_TRAVELLER: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['PAYMENT_HELD', 'CANCELLED'],
  PAYMENT_HELD: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['TRAVELLER_ARRIVED', 'CANCELLED'],
  TRAVELLER_ARRIVED: ['HANDOVER_PENDING', 'CANCELLED'],
  HANDOVER_PENDING: ['HANDED_OVER', 'CANCELLED'],
  // Once handed over, the parcel is physically with the traveller; direct cancellation is forbidden.
  // Any issue must be filed as DISPUTED.
  HANDED_OVER: ['IN_TRANSIT', 'DISPUTED'],
  IN_TRANSIT: ['ARRIVED_DESTINATION', 'DISPUTED'],
  ARRIVED_DESTINATION: ['DELIVERY_PENDING', 'DISPUTED'],
  DELIVERY_PENDING: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['DISPUTED'], // Can dispute even after delivery if damaged inside
  CANCELLED: [],
  DISPUTED: ['DELIVERED', 'CANCELLED'], // Disputed cases may be reconciled or resolved to cancelled/delivered
};

export interface BookingValidationResult {
  valid: boolean;
  errorMessage?: string;
  errorMessageBn?: string;
}

/**
 * Validates whether a state transition from `current` to `target` is allowed.
 */
export function validateBookingTransition(
  current: BookingLifecycleStatus,
  target: BookingLifecycleStatus
): BookingValidationResult {
  if (current === target) {
    return { valid: true };
  }

  const allowed = BOOKING_LIFECYCLE_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      errorMessage: `Invalid Booking transition from '${current}' to '${target}'. Allowed: [${allowed.join(', ')}]`,
      errorMessageBn: `বর্তমান অবস্থা '${current}' থেকে '${target}'-এ পরিবর্তন গ্রহণযোগ্য নয়। অনুমোদিত: [${allowed.join(', ')}]`,
    };
  }

  return { valid: true };
}

/**
 * Helper to check if a booking can be cancelled at its current state.
 * Handover or In-Transit bookings cannot be cancelled without dispute arbitration.
 */
export function canCancelBooking(status: BookingLifecycleStatus): boolean {
  const nonCancellableStates: BookingLifecycleStatus[] = [
    'HANDED_OVER',
    'IN_TRANSIT',
    'ARRIVED_DESTINATION',
    'DELIVERY_PENDING',
    'DELIVERED',
    'CANCELLED',
  ];
  return !nonCancellableStates.includes(status);
}

/**
 * Status display metadata in Bengali
 */
export const BOOKING_STATUS_META: Record<
  BookingLifecycleStatus,
  {
    labelBn: string;
    variant: 'primary' | 'softOrange' | 'verified' | 'neutral' | 'demo' | 'outline' | 'warning' | 'error';
    stepNumber: number;
    descriptionBn: string;
  }
> = {
  PENDING_TRAVELLER: {
    labelBn: 'সহযাত্রীর অনুমোদনের অপেক্ষায়',
    variant: 'warning',
    stepNumber: 1,
    descriptionBn: 'সহযাত্রী যাত্রা পর্যালোচনা করছেন',
  },
  ACCEPTED: {
    labelBn: 'বুকিং গৃহীত',
    variant: 'primary',
    stepNumber: 1,
    descriptionBn: 'সহযাত্রী আপনার পার্সেল বহনে সম্মতি দিয়েছেন',
  },
  PAYMENT_PENDING: {
    labelBn: 'পেমেন্ট বাকি',
    variant: 'warning',
    stepNumber: 2,
    descriptionBn: 'এসক্রো পেমেন্ট সম্পন্ন করুন',
  },
  PAYMENT_HELD: {
    labelBn: 'পেমেন্ট সুরক্ষিত (এসক্রো)',
    variant: 'verified',
    stepNumber: 2,
    descriptionBn: 'টাকা গ্রাহক ও সহযাত্রীর সুরক্ষার্থে জমা আছে',
  },
  READY_FOR_PICKUP: {
    labelBn: 'পিকআপের প্রস্তুতি',
    variant: 'outline',
    stepNumber: 3,
    descriptionBn: 'পিকআপ স্থানে যাওয়ার প্রস্তুতি চলছে',
  },
  TRAVELLER_ARRIVED: {
    labelBn: 'সহযাত্রী পিকআপে উপস্থিত',
    variant: 'primary',
    stepNumber: 3,
    descriptionBn: 'সহযাত্রী পিকআপ লোকেশনে পৌঁছেছেন',
  },
  HANDOVER_PENDING: {
    labelBn: 'হস্তান্তর যাচাইকরণ চলছে',
    variant: 'warning',
    stepNumber: 3,
    descriptionBn: 'নিরাপত্তা চেকলিস্ট ও ১ম ওটিপি যাচাই করুন',
  },
  HANDED_OVER: {
    labelBn: 'পার্সেল হস্তান্তর সম্পন্ন',
    variant: 'verified',
    stepNumber: 3,
    descriptionBn: 'সহযাত্রী পণ্য বুঝে পেয়েছেন (১ম ওটিপি ভেরিফাইড)',
  },
  IN_TRANSIT: {
    labelBn: 'যাত্রা চলমান (অন দ্য ওয়ে)',
    variant: 'primary',
    stepNumber: 4,
    descriptionBn: 'পার্সেল জাতীয় মহাসড়কে গন্তব্যের উদ্দেশ্যে চলছে',
  },
  ARRIVED_DESTINATION: {
    labelBn: 'গন্তব্যে পৌঁছেছে',
    variant: 'outline',
    stepNumber: 5,
    descriptionBn: 'সহযাত্রী গন্তব্য শহরে পৌঁছেছেন',
  },
  DELIVERY_PENDING: {
    labelBn: 'ডেলিভারি যাচাইকরণ চলছে',
    variant: 'warning',
    stepNumber: 6,
    descriptionBn: 'প্রাপকের ২য় ওটিপি কোড দিয়ে ডেলিভারি নিশ্চিত করুন',
  },
  DELIVERED: {
    labelBn: 'সফলভাবে ডেলিভারি সম্পন্ন',
    variant: 'verified',
    stepNumber: 6,
    descriptionBn: 'পার্সেল সঠিক প্রাপক বুঝে পেয়েছেন',
  },
  CANCELLED: {
    labelBn: 'বাতিল করা হয়েছে',
    variant: 'error',
    stepNumber: 0,
    descriptionBn: 'এই বুকিং অনুরোধটি বাতিল করা হয়েছে',
  },
  DISPUTED: {
    labelBn: 'সমস্যা পর্যালোচনায় (বিরোধ)',
    variant: 'error',
    stepNumber: 0,
    descriptionBn: 'সাপোর্ট টিম বিষয়টির সমাধান করছে',
  },
};
