// BOHOK Type Definitions - Phase 2 Nationwide Mobility Architecture

export interface Coordinate {
  lat: number;
  lng: number;
  nameBn: string;
}

export type VerificationLevel = 'nid_verified' | 'nid_workplace' | 'trusted_ambassador';

export interface CityHub {
  id: string;
  nameBn: string;
  nameEn: string;
  divisionBn: string;
  coordinates: [number, number]; // [lng, lat]
  mapPosition: { x: number; y: number }; // SVG canvas coordinates (0-1000, 0-700)
  isPilotHub?: boolean;
}

export interface Waypoint {
  id: string;
  nameBn: string;
  nameEn: string;
  coordinates: [number, number];
  mapPosition: { x: number; y: number };
  isMajorStop: boolean;
  landmarkBn?: string;
}

export interface Traveller {
  id: string;
  routeId: string;
  name: string;
  avatarInitials: string;
  isVerified: boolean;
  verificationBadgeText: string;
  verificationType: VerificationLevel;
  rating: number;
  totalTripsCompleted: number;
  departureTime: string;
  departureDate: string;
  departurePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  originAreaBn: string;
  destinationAreaBn: string;
  approximateDistanceKm: number;
  availableCapacityKg: number;
  allowedParcelTypes: string[];
  vehicleModeBn: string;
  estimatedArrival: string;
  isFeatured?: boolean;
  coordinates: {
    origin: [number, number];
    currentApproximate: [number, number];
    destination: [number, number];
  };
  mapPosition: { x: number; y: number }; // SVG canvas position near origin
  privacyNoteBn: string;
}

export interface NationwideRoute {
  id: string;
  originId: string;
  destinationId: string;
  fromBn: string;
  toBn: string;
  fromEn: string;
  toEn: string;
  highwayCode: string; // e.g. "N1", "N2", "N5", "N8"
  distanceKm: number;
  estimatedHours: string;
  status: 'pilot_active' | 'network_ready' | 'upcoming';
  stats: {
    nearbyTravellersCount: number;
    nearestDistanceKm: number;
    todayPotentialMatches: number;
    dailyTripsCountApprox: number;
  };
  svgPath: string; // Smooth SVG path connecting origin, waypoints, and destination
  cameraViewBox: { x: number; y: number; width: number; height: number };
  waypoints: Waypoint[];
  descriptionBn: string;
  sampleTravellerIds: string[];
}

export type ParcelJourneyStep = 'sender' | 'pickup' | 'traveller' | 'destination' | 'recipient';

export interface JourneyStage {
  id: ParcelJourneyStep;
  labelBn: string;
  subtitleBn: string;
  iconName: string;
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface StepItem {
  number: string;
  titleBn: string;
  subtitleBn: string;
  descriptionBn: string;
  highlightTextBn: string;
  iconName: string;
  tagBn: string;
}

export interface TrustItem {
  id: string;
  titleBn: string;
  subtitleBn: string;
  badgeBn: string;
  descriptionBn: string;
  securityGuaranteeBn: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  categoryBn: string;
  questionBn: string;
  answerBn: string;
}
