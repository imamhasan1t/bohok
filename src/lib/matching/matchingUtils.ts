// BOHOK Phase 5 — Intelligent Matching Engine Utilities
// Deterministic corridor analysis, time & distance scoring, and Bengali explainability

import {
  RouteCompatibilityLevel,
  ParcelMatchRequirement,
  TravellerTripMatchCandidate,
  MatchScoreWeights,
  MatchScoreBreakdown,
} from './matchingTypes';
import { toBengaliNumerals } from '@/lib/utils';

// Major National Highway Corridors across Bangladesh (ordered lists of hub IDs)
export const HIGHWAY_CORRIDORS: Record<string, string[]> = {
  // N1: Dhaka -> Cumilla -> Feni -> Chattogram (with branch connection to Noakhali)
  N1: ['dhaka', 'cumilla', 'feni', 'chattogram'],
  // N2: Dhaka -> Narsingdi -> Brahmanbaria -> Sylhet
  N2: ['dhaka', 'brahmanbaria', 'sylhet'],
  // N5: Dhaka -> Tangail -> Sirajganj -> Bogura -> Rajshahi
  N5: ['dhaka', 'tangail', 'sirajganj', 'bogura', 'rajshahi'],
  // N8: Dhaka -> Bhanga -> Barishal -> Khulna
  N8: ['dhaka', 'bhanga', 'barishal', 'khulna'],
};

// Branch feeder maps (e.g., Noakhali connects to Cumilla & Feni along N1)
export const CORRIDOR_BRANCHES: Record<string, string[]> = {
  noakhali: ['cumilla', 'feni'],
};

/**
 * Evaluates route compatibility without hardcoding Cumilla or any specific city.
 * Supports exact endpoints, directional corridor sub-segments, and adjacent branches.
 */
export function evaluateRouteCompatibility(
  parcelOrigin: string,
  parcelDest: string,
  tripOrigin: string,
  tripDest: string
): { level: RouteCompatibilityLevel; ratio: number; noteBn: string } {
  // 1. Direct Perfect Match
  if (parcelOrigin === tripOrigin && parcelDest === tripDest) {
    return {
      level: 'PERFECT',
      ratio: 1.0,
      noteBn: 'সরাসরি রুট সম্পূর্ণ মিলে গেছে',
    };
  }

  // 2. Nationwide Corridor Overlap (Same direction along highway)
  for (const [, hubs] of Object.entries(HIGHWAY_CORRIDORS)) {
    const tripStartIdx = hubs.indexOf(tripOrigin);
    const tripEndIdx = hubs.indexOf(tripDest);

    if (tripStartIdx !== -1 && tripEndIdx !== -1 && tripStartIdx < tripEndIdx) {
      // Traveller is travelling along this corridor from tripStartIdx -> tripEndIdx
      const parcelStartIdx = hubs.indexOf(parcelOrigin);
      const parcelEndIdx = hubs.indexOf(parcelDest);

      // Check if parcel route is a subset of traveller's corridor journey
      if (
        parcelStartIdx !== -1 &&
        parcelEndIdx !== -1 &&
        parcelStartIdx < parcelEndIdx &&
        parcelStartIdx >= tripStartIdx &&
        parcelEndIdx <= tripEndIdx
      ) {
        return {
          level: 'GOOD',
          ratio: 0.85,
          noteBn: 'মূল মহাসড়ক করিডোরের সরাসরি অন্তর্ভূক্ত',
        };
      }
    }
  }

  // 3. Feeder branch check (e.g. Noakhali connecting to N1 via Cumilla or Feni)
  const isParcelBranch =
    CORRIDOR_BRANCHES[parcelDest]?.includes(tripDest) ||
    CORRIDOR_BRANCHES[parcelOrigin]?.includes(tripOrigin);

  if (isParcelBranch && (parcelOrigin === tripOrigin || parcelDest === tripDest)) {
    return {
      level: 'PARTIAL',
      ratio: 0.55,
      noteBn: 'সংযুক্ত ফিডার রুটের মাধ্যমে পৌঁছানো সম্ভব',
    };
  }

  // 4. Reverse or completely disconnected routes
  return {
    level: 'NO_MATCH',
    ratio: 0.0,
    noteBn: 'রুটের দিক বা গন্তব্য সম্পূর্ণ ভিন্ন',
  };
}

/**
 * Calculates time compatibility score (0 to 1 ratio)
 */
export function calculateTimeCompatibility(
  parcel: ParcelMatchRequirement,
  trip: TravellerTripMatchCandidate
): { ratio: number; noteBn: string; isTooLate: boolean } {
  // If parcel has explicit required delivery hour (e.g. 14.0 for 2 PM)
  if (parcel.requiredDeliveryHour && trip.estimatedArrivalHour) {
    const diffHours = parcel.requiredDeliveryHour - trip.estimatedArrivalHour;

    if (diffHours >= 1.5) {
      return {
        ratio: 1.0,
        noteBn: 'কাঙ্ক্ষিত সময়ের আগেই পৌঁছাবে',
        isTooLate: false,
      };
    } else if (diffHours >= 0) {
      return {
        ratio: 0.85,
        noteBn: 'কাঙ্ক্ষিত সময়ের সামান্য পূর্বে পৌঁছাবে',
        isTooLate: false,
      };
    } else if (diffHours >= -0.5) {
      // Up to 30 mins late: minor penalty
      return {
        ratio: 0.45,
        noteBn: 'কাঙ্ক্ষিত সময়ের সামান্য দেরিতে পৌঁছানোর সম্ভাবনা',
        isTooLate: false,
      };
    } else {
      // More than 30 mins late: disqualifying / 0 score
      return {
        ratio: 0.0,
        noteBn: 'কাঙ্ক্ষিত ডেলিভারি সময়ের পরে পৌঁছাবে',
        isTooLate: true,
      };
    }
  }

  // General urgency handling
  if (parcel.urgency === 'today') {
    // Favorable if traveller departs earlier in the day
    const hour = trip.departureHour ?? 9;
    if (hour <= 9) {
      return { ratio: 1.0, noteBn: 'সকালের প্রথম ট্রিপ—আজই দ্রুত ডেলিভারি', isTooLate: false };
    } else if (hour <= 14) {
      return { ratio: 0.9, noteBn: 'দুপুরের যাত্রা—আজ সন্ধ্যার আগেই পৌঁছাবে', isTooLate: false };
    } else {
      return { ratio: 0.75, noteBn: 'সন্ধ্যার ট্রিপ—আজ রাতে ডেলিভারি সম্পন্ন হবে', isTooLate: false };
    }
  } else if (parcel.urgency === 'tomorrow') {
    return { ratio: 0.95, noteBn: 'আগামীকালের সূচি অনুযায়ী উপযুক্ত', isTooLate: false };
  }

  return { ratio: 0.8, noteBn: 'যাত্রার নির্ধারিত সময় অনুকূল', isTooLate: false };
}

/**
 * Calculates pickup distance compatibility score (0 to 1 ratio)
 */
export function calculateDistanceCompatibility(
  distanceKm: number
): { ratio: number; noteBn: string } {
  if (distanceKm <= 1.5) {
    return { ratio: 1.0, noteBn: `পিকআপের খুব কাছে (~${toBengaliNumerals(distanceKm)} কিমি)` };
  } else if (distanceKm <= 3.5) {
    return { ratio: 0.85, noteBn: `পিকআপের কাছাকাছি (~${toBengaliNumerals(distanceKm)} কিমি)` };
  } else if (distanceKm <= 6.0) {
    return { ratio: 0.65, noteBn: `মধ্যম দূরত্ব (~${toBengaliNumerals(distanceKm)} কিমি)` };
  } else if (distanceKm <= 10.0) {
    return { ratio: 0.4, noteBn: `সামান্য দূরত্বে (~${toBengaliNumerals(distanceKm)} কিমি)` };
  }
  return { ratio: 0.15, noteBn: `অপেক্ষাকৃত দূরবর্তী (~${toBengaliNumerals(distanceKm)} কিমি)` };
}

/**
 * Calculates capacity compatibility score (0 to 1 ratio)
 * Hard filter: If parcel weight > available capacity, ratio is 0.0 and isExceeded = true
 */
export function calculateCapacityCompatibility(
  parcelWeightKg: number,
  availableCapacityKg: number
): { ratio: number; noteBn: string; isExceeded: boolean } {
  if (parcelWeightKg > availableCapacityKg) {
    return {
      ratio: 0.0,
      noteBn: `পর্যাপ্ত ধারণক্ষমতা নেই (${toBengaliNumerals(availableCapacityKg)} কেজি খালি)`,
      isExceeded: true,
    };
  }

  const loadFactor = parcelWeightKg / Math.max(availableCapacityKg, 0.1);

  if (loadFactor <= 0.4) {
    return {
      ratio: 1.0,
      noteBn: `প্রচুর খালি জায়গা রয়েছে (${toBengaliNumerals(availableCapacityKg)} কেজি পর্যন্ত)`,
      isExceeded: false,
    };
  } else if (loadFactor <= 0.75) {
    return {
      ratio: 0.88,
      noteBn: `সহজে বহনের উপযোগী স্পেস রয়েছে`,
      isExceeded: false,
    };
  }
  return {
    ratio: 0.7,
    noteBn: `অনুমোদিত ওজনের সীমার মধ্যে রয়েছে`,
    isExceeded: false,
  };
}

/**
 * Calculates reliability score (0 to 1 ratio)
 */
export function calculateReliabilityCompatibility(
  rating: number,
  totalTrips: number,
  isVerified: boolean
): { ratio: number; noteBn: string } {
  if (rating >= 4.85 && totalTrips >= 15 && isVerified) {
    return { ratio: 1.0, noteBn: `শীর্ষ রেটেড ও অভিজ্ঞ সহযাত্রী (⭐ ${toBengaliNumerals(rating)})` };
  } else if (rating >= 4.7 && totalTrips >= 8 && isVerified) {
    return { ratio: 0.9, noteBn: `উচ্চ নির্ভরযোগ্যতা ও সফল ট্রিপ হিস্ট্রি` };
  } else if (rating >= 4.4 && totalTrips >= 3) {
    return { ratio: 0.8, noteBn: `যাচাইকৃত ও ভালো ট্র্যাক রেকর্ড` };
  } else if (isVerified) {
    return { ratio: 0.65, noteBn: `এনআইডি যাচাইকৃত সহযাত্রী` };
  }
  return { ratio: 0.45, noteBn: `নতুন সহযাত্রী প্রোফাইল` };
}

/**
 * Calculates delivery speed compatibility score (0 to 1 ratio)
 */
export function calculateSpeedCompatibility(
  travelMode: string
): { ratio: number; noteBn: string } {
  switch (travelMode) {
    case 'car':
    case 'motorcycle':
      return { ratio: 1.0, noteBn: 'প্রাইভেট এক্সপ্রেস যাতায়াত—দ্রুততম ডেলিভারি' };
    case 'train':
      return { ratio: 0.85, noteBn: 'ট্রেন যাত্রা—ট্রাফিক জ্যামমুক্ত সময়নিষ্ঠ পৌঁছানো' };
    case 'bus':
      return { ratio: 0.75, noteBn: 'হাইওয়ে এক্সপ্রেস বাস সার্ভিস' };
    default:
      return { ratio: 0.6, noteBn: 'স্ট্যান্ডার্ড ট্রাভেল মাধ্যম' };
  }
}

/**
 * Synthesizes transparent, explainable reason bullet points in Bangladeshi Bengali
 */
export function generateBengaliReasons(
  routeNoteBn: string,
  timeNoteBn: string,
  distanceNoteBn: string,
  capacityNoteBn: string,
  reliabilityNoteBn: string,
  speedNoteBn: string,
  isTopMatch: boolean
): string[] {
  const reasons: string[] = [];

  if (isTopMatch) {
    reasons.push('⭐ BOHOK-এর অ্যালগরিদমে সেরা সম্ভাব্য সমন্বয়');
  }

  // Include top positive aspects
  reasons.push(routeNoteBn);
  reasons.push(timeNoteBn);
  reasons.push(distanceNoteBn);
  reasons.push(capacityNoteBn);

  return reasons.slice(0, 4);
}
