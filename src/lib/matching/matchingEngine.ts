// BOHOK Phase 5 — Intelligent Sender ↔ Traveller Matching Engine
// Pure, deterministic, transparent matching algorithm for Bangladesh crowdshipping

import {
  MatchScoreWeights,
  DEFAULT_MATCHING_WEIGHTS,
  ParcelMatchRequirement,
  TravellerTripMatchCandidate,
  MatchResult,
  MatchScoreBreakdown,
  CandidateSortOption,
} from './matchingTypes';
import {
  evaluateRouteCompatibility,
  calculateTimeCompatibility,
  calculateDistanceCompatibility,
  calculateCapacityCompatibility,
  calculateReliabilityCompatibility,
  calculateSpeedCompatibility,
  generateBengaliReasons,
} from './matchingUtils';

/**
 * Calculates a multidimensional match score (0–100) between a sender parcel request
 * and a traveller's planned journey.
 *
 * Scoring Formula:
 * - Route compatibility: 35%
 * - Time compatibility: 20%
 * - Pickup distance: 15%
 * - Capacity: 15% (Hard filter if parcel weight > available capacity)
 * - Traveller reliability: 10%
 * - Delivery speed: 5%
 * Total: 100%
 */
export function calculateMatchScore(
  parcel: ParcelMatchRequirement,
  trip: TravellerTripMatchCandidate,
  weights: MatchScoreWeights = DEFAULT_MATCHING_WEIGHTS
): MatchResult {
  // 1. Route Compatibility (35%)
  const routeEval = evaluateRouteCompatibility(
    parcel.originId,
    parcel.destinationId,
    trip.originId,
    trip.destinationId
  );
  const routeScore = Math.round(routeEval.ratio * weights.route);

  // 2. Time Compatibility (20%)
  const timeEval = calculateTimeCompatibility(parcel, trip);
  const timeScore = Math.round(timeEval.ratio * weights.time);

  // 3. Pickup Distance Compatibility (15%)
  const distanceEval = calculateDistanceCompatibility(trip.approximateDistanceKm);
  const distanceScore = Math.round(distanceEval.ratio * weights.distance);

  // 4. Capacity Compatibility (15%) - Hard constraint checked
  const capacityEval = calculateCapacityCompatibility(
    parcel.weightKg,
    trip.availableCapacityKg
  );
  const capacityScore = Math.round(capacityEval.ratio * weights.capacity);

  // 5. Reliability Compatibility (10%)
  const reliabilityEval = calculateReliabilityCompatibility(
    trip.rating,
    trip.totalTripsCompleted,
    trip.isVerified
  );
  const reliabilityScore = Math.round(reliabilityEval.ratio * weights.reliability);

  // 6. Delivery Speed Compatibility (5%)
  const speedEval = calculateSpeedCompatibility(trip.travelMode);
  const speedScore = Math.round(speedEval.ratio * weights.speed);

  // Eligibility Evaluation
  let isEligible = true;
  let disqualificationReasonBn: string | undefined;

  if (routeEval.level === 'NO_MATCH') {
    isEligible = false;
    disqualificationReasonBn = 'রুটের দিক বা গন্তব্য সম্পূর্ণ অমিল';
  } else if (capacityEval.isExceeded) {
    isEligible = false;
    disqualificationReasonBn = 'পার্সেলের ওজন ধারণক্ষমতার সীমার বেশি';
  } else if (timeEval.isTooLate) {
    isEligible = false;
    disqualificationReasonBn = 'কাঙ্ক্ষিত ডেলিভারি সময়ের পরে পৌঁছাবে';
  }

  // Calculate clamped total score (0 to 100)
  // If ineligible, score is capped or zeroed according to issue
  const rawSum = routeScore + timeScore + distanceScore + capacityScore + reliabilityScore + speedScore;
  const totalScore = isEligible ? Math.min(100, Math.max(0, rawSum)) : Math.min(30, rawSum);

  const breakdown: MatchScoreBreakdown = {
    route: {
      key: 'route',
      score: routeScore,
      maxScore: weights.route,
      percentage: Math.round((routeScore / Math.max(weights.route, 1)) * 100),
      labelBn: 'রুট সামঞ্জস্য',
      descriptionBn: routeEval.noteBn,
    },
    time: {
      key: 'time',
      score: timeScore,
      maxScore: weights.time,
      percentage: Math.round((timeScore / Math.max(weights.time, 1)) * 100),
      labelBn: 'সময় উপযোগিতা',
      descriptionBn: timeEval.noteBn,
    },
    distance: {
      key: 'distance',
      score: distanceScore,
      maxScore: weights.distance,
      percentage: Math.round((distanceScore / Math.max(weights.distance, 1)) * 100),
      labelBn: 'পিকআপ দূরত্ব',
      descriptionBn: distanceEval.noteBn,
    },
    capacity: {
      key: 'capacity',
      score: capacityScore,
      maxScore: weights.capacity,
      percentage: Math.round((capacityScore / Math.max(weights.capacity, 1)) * 100),
      labelBn: 'ধারণক্ষমতা',
      descriptionBn: capacityEval.noteBn,
    },
    reliability: {
      key: 'reliability',
      score: reliabilityScore,
      maxScore: weights.reliability,
      percentage: Math.round((reliabilityScore / Math.max(weights.reliability, 1)) * 100),
      labelBn: 'যাত্রী নির্ভরযোগ্যতা',
      descriptionBn: reliabilityEval.noteBn,
    },
    speed: {
      key: 'speed',
      score: speedScore,
      maxScore: weights.speed,
      percentage: Math.round((speedScore / Math.max(weights.speed, 1)) * 100),
      labelBn: 'ডেলিভারি গতি',
      descriptionBn: speedEval.noteBn,
    },
  };

  const reasons = generateBengaliReasons(
    routeEval.noteBn,
    timeEval.noteBn,
    distanceEval.noteBn,
    capacityEval.noteBn,
    reliabilityEval.noteBn,
    speedEval.noteBn,
    totalScore >= 90
  );

  return {
    candidateId: trip.id,
    traveller: trip,
    totalScore,
    compatibilityLevel: routeEval.level,
    isEligible,
    disqualificationReasonBn,
    breakdown,
    reasons,
    reasonsSummaryBn: reasons.slice(0, 2).join(' • '),
    isTopMatch: false,
  };
}

/**
 * Evaluates, filters, ranks, and sorts a list of candidate trips for a given parcel request.
 */
export function rankCandidates(
  parcel: ParcelMatchRequirement,
  candidates: TravellerTripMatchCandidate[],
  weights: MatchScoreWeights = DEFAULT_MATCHING_WEIGHTS,
  sortOption: CandidateSortOption = 'best_match'
): MatchResult[] {
  // Score all candidates
  const scored = candidates.map((c) => calculateMatchScore(parcel, c, weights));

  // Only recommend eligible candidates with valid route levels
  const eligible = scored.filter((item) => item.isEligible && item.compatibilityLevel !== 'NO_MATCH');

  // Sorting
  eligible.sort((a, b) => {
    switch (sortOption) {
      case 'nearest':
        return a.traveller.approximateDistanceKm - b.traveller.approximateDistanceKm;
      case 'rating':
        return b.traveller.rating - a.traveller.rating;
      case 'earliest': {
        const hourA = a.traveller.departureHour ?? 12;
        const hourB = b.traveller.departureHour ?? 12;
        return hourA - hourB;
      }
      case 'best_match':
      default:
        // Primary sort: totalScore descending; secondary: rating
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.traveller.rating - a.traveller.rating;
    }
  });

  // Mark the top eligible candidate
  if (eligible.length > 0) {
    eligible[0].isTopMatch = true;
  }

  return eligible;
}
