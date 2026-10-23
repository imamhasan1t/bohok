// BOHOK Phase 5 — Intelligent Sender ↔ Traveller Matching Engine Types

export type RouteCompatibilityLevel = 'PERFECT' | 'GOOD' | 'PARTIAL' | 'NO_MATCH';

export interface MatchScoreWeights {
  route: number;      // default: 35 (35%)
  time: number;       // default: 20 (20%)
  distance: number;   // default: 15 (15%)
  capacity: number;   // default: 15 (15%)
  reliability: number;// default: 10 (10%)
  speed: number;      // default: 5 (5%)
}

export const DEFAULT_MATCHING_WEIGHTS: Readonly<MatchScoreWeights> = {
  route: 35,
  time: 20,
  distance: 15,
  capacity: 15,
  reliability: 10,
  speed: 5,
};

export interface MatchBreakdownItem {
  key: keyof MatchScoreWeights;
  score: number;
  maxScore: number;
  percentage: number;
  labelBn: string;
  descriptionBn: string;
}

export interface MatchScoreBreakdown {
  route: MatchBreakdownItem;
  time: MatchBreakdownItem;
  distance: MatchBreakdownItem;
  capacity: MatchBreakdownItem;
  reliability: MatchBreakdownItem;
  speed: MatchBreakdownItem;
}

export interface ParcelMatchRequirement {
  id?: string;
  originId: string;
  destinationId: string;
  originCityBn?: string;
  destinationCityBn?: string;
  weightKg: number;
  size?: 'small' | 'medium' | 'large';
  urgency: 'today' | 'tomorrow' | 'custom_time';
  targetTimeNoteBn?: string;
  requiredDeliveryHour?: number; // 24-hr format (e.g., 14.5 for 2:30 PM)
  pickupAreaBn?: string;
  pickupCoordinates?: [number, number];
}

export interface TravellerTripMatchCandidate {
  id: string;
  travellerId?: string;
  name: string;
  avatarInitials: string;
  isVerified: boolean;
  verificationBadgeText: string;
  rating: number;
  totalTripsCompleted: number;
  originId: string;
  destinationId: string;
  originCityBn?: string;
  destinationCityBn?: string;
  originAreaBn: string;
  destinationAreaBn: string;
  departureDate: string;
  departureTime: string;
  departureHour?: number; // 24-hr format (e.g. 7.5 for 07:30)
  estimatedArrival: string;
  estimatedArrivalHour?: number; // 24-hr format (e.g. 10.25 for 10:15)
  availableCapacityKg: number;
  capacitySize?: 'small' | 'medium' | 'large';
  travelMode: 'bus' | 'train' | 'car' | 'motorcycle' | 'other';
  vehicleModeBn: string;
  approximateDistanceKm: number;
  estimatedPrice: number;
  allowedParcelTypes: string[];
}

export interface MatchResult {
  candidateId: string;
  traveller: TravellerTripMatchCandidate;
  totalScore: number; // 0–100 integer
  compatibilityLevel: RouteCompatibilityLevel;
  isEligible: boolean; // false if capacity exceeded, arrival too late, or NO_MATCH
  disqualificationReasonBn?: string;
  breakdown: MatchScoreBreakdown;
  reasons: string[]; // Bangladeshi Bengali explainable bullet points
  reasonsSummaryBn: string;
  isTopMatch?: boolean;
}

export type CandidateSortOption = 'best_match' | 'nearest' | 'rating' | 'earliest';
