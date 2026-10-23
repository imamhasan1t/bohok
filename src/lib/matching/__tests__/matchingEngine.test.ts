// BOHOK Phase 5 — Unit Tests for Matching Engine
// Tests all scoring dimensions, corridor overlapping, hard filters, bounds, and explainability
// Uses Node.js native test runner and assert

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateMatchScore, rankCandidates } from '../matchingEngine';
import {
  ParcelMatchRequirement,
  TravellerTripMatchCandidate,
  MatchScoreWeights,
  DEFAULT_MATCHING_WEIGHTS,
} from '../matchingTypes';

describe('BOHOK Matching Engine Test Suite', () => {
  const standardParcel: ParcelMatchRequirement = {
    originId: 'dhaka',
    destinationId: 'cumilla',
    originCityBn: 'ঢাকা',
    destinationCityBn: 'কুমিল্লা',
    weightKg: 1.5,
    size: 'small',
    urgency: 'today',
    requiredDeliveryHour: 14.0, // 2:00 PM
    pickupAreaBn: 'মতিঝিল',
  };

  const idealCandidate: TravellerTripMatchCandidate = {
    id: 'ideal-01',
    name: 'তানভীর হোসেন',
    avatarInitials: 'তহ',
    isVerified: true,
    verificationBadgeText: 'এনআইডি যাচাইকৃত',
    rating: 4.95,
    totalTripsCompleted: 45,
    originId: 'dhaka',
    destinationId: 'cumilla',
    originCityBn: 'ঢাকা',
    destinationCityBn: 'কুমিল্লা',
    originAreaBn: 'মতিঝিল শাপলা চত্বর',
    destinationAreaBn: 'শাসনগাছা',
    departureDate: 'আজ',
    departureTime: 'সকাল ০৮:০০',
    departureHour: 8.0,
    estimatedArrival: 'সকাল ১০:৩০',
    estimatedArrivalHour: 10.5,
    availableCapacityKg: 5.0,
    capacitySize: 'medium',
    travelMode: 'car',
    vehicleModeBn: 'প্রাইভেট কার',
    approximateDistanceKm: 1.1,
    estimatedPrice: 320,
    allowedParcelTypes: ['documents', 'books', 'clothes'],
  };

  it('Case 1: Ideal candidate produces high match score (>= 90%) and PERFECT route level', () => {
    const result = calculateMatchScore(standardParcel, idealCandidate);

    assert.strictEqual(result.isEligible, true);
    assert.strictEqual(result.compatibilityLevel, 'PERFECT');
    assert.ok(result.totalScore >= 92 && result.totalScore <= 100);
    assert.strictEqual(result.breakdown.route.score, DEFAULT_MATCHING_WEIGHTS.route);
    assert.ok(result.reasons.length > 0);
    assert.ok(result.reasons[0].includes('BOHOK'));
  });

  it('Case 2: Nationwide corridor matching (Dhaka -> Chattogram trip matches Dhaka -> Cumilla parcel)', () => {
    const corridorCandidate: TravellerTripMatchCandidate = {
      ...idealCandidate,
      id: 'corridor-chattogram',
      originId: 'dhaka',
      destinationId: 'chattogram',
      destinationCityBn: 'চট্টগ্রাম',
      estimatedArrivalHour: 12.0,
    };

    const result = calculateMatchScore(standardParcel, corridorCandidate);

    assert.strictEqual(result.isEligible, true);
    assert.strictEqual(result.compatibilityLevel, 'GOOD');
    assert.strictEqual(result.breakdown.route.score, Math.round(DEFAULT_MATCHING_WEIGHTS.route * 0.85));
    assert.ok(result.totalScore >= 80);
  });

  it('Case 3: Incompatible route produces NO_MATCH, 0 route score, and is disqualified', () => {
    const wrongRouteCandidate: TravellerTripMatchCandidate = {
      ...idealCandidate,
      id: 'wrong-route',
      originId: 'rajshahi',
      destinationId: 'bogura',
      originCityBn: 'রাজশাহী',
      destinationCityBn: 'বগুড়া',
    };

    const result = calculateMatchScore(standardParcel, wrongRouteCandidate);

    assert.strictEqual(result.compatibilityLevel, 'NO_MATCH');
    assert.strictEqual(result.isEligible, false);
    assert.strictEqual(result.breakdown.route.score, 0);
    assert.ok(result.disqualificationReasonBn !== undefined);
  });

  it('Case 4: Insufficient capacity triggers hard constraint disqualification', () => {
    const smallCapacityCandidate: TravellerTripMatchCandidate = {
      ...idealCandidate,
      id: 'small-capacity',
      availableCapacityKg: 1.0, // Parcel is 1.5kg! Exceeds capacity
    };

    const result = calculateMatchScore(standardParcel, smallCapacityCandidate);

    assert.strictEqual(result.isEligible, false);
    assert.strictEqual(result.breakdown.capacity.score, 0);
    assert.ok(result.disqualificationReasonBn?.includes('ধারণক্ষমতা'));
  });

  it('Case 5: Arrival after required delivery deadline triggers time penalty / disqualification', () => {
    const lateCandidate: TravellerTripMatchCandidate = {
      ...idealCandidate,
      id: 'late-candidate',
      estimatedArrivalHour: 16.0, // Required is 14.0, candidate arrives at 16:00 (2 hrs late)
    };

    const result = calculateMatchScore(standardParcel, lateCandidate);

    assert.strictEqual(result.breakdown.time.score, 0);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.disqualificationReasonBn?.includes('দেরিতে') || result.disqualificationReasonBn?.includes('পরে'));
  });

  it('Case 6: Pickup distance degrades score predictably', () => {
    const nearResult = calculateMatchScore(standardParcel, {
      ...idealCandidate,
      approximateDistanceKm: 1.0,
    });
    const farResult = calculateMatchScore(standardParcel, {
      ...idealCandidate,
      approximateDistanceKm: 12.0,
    });

    assert.strictEqual(nearResult.breakdown.distance.score, DEFAULT_MATCHING_WEIGHTS.distance);
    assert.ok(farResult.breakdown.distance.score < nearResult.breakdown.distance.score / 2);
  });

  it('Case 7: Custom configurable weights are respected without magic numbers', () => {
    const customWeights: MatchScoreWeights = {
      route: 50,
      time: 10,
      distance: 10,
      capacity: 10,
      reliability: 10,
      speed: 10,
    };

    const result = calculateMatchScore(standardParcel, idealCandidate, customWeights);

    assert.strictEqual(result.breakdown.route.maxScore, 50);
    assert.strictEqual(result.breakdown.route.score, 50);
    assert.ok(result.totalScore <= 100);
  });

  it('Case 8: rankCandidates filters out disqualified candidates and sorts by best match', () => {
    const candidates = [
      idealCandidate,
      { ...idealCandidate, id: 'low-rating', rating: 4.2, totalTripsCompleted: 2, approximateDistanceKm: 7.0 },
      { ...idealCandidate, id: 'no-capacity', availableCapacityKg: 0.5 }, // Ineligible
      { ...idealCandidate, id: 'wrong-dest', originId: 'khulna', destinationId: 'barishal' }, // Ineligible
    ];

    const ranked = rankCandidates(standardParcel, candidates, DEFAULT_MATCHING_WEIGHTS, 'best_match');

    // Only 2 eligible candidates should remain
    assert.strictEqual(ranked.length, 2);
    assert.strictEqual(ranked[0].candidateId, 'ideal-01');
    assert.strictEqual(ranked[0].isTopMatch, true);
    assert.ok(ranked[0].totalScore > ranked[1].totalScore);
  });
});
