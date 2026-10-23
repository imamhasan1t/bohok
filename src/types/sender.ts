// BOHOK Phase 3 — Sender Flow Types

export type ParcelCategory = 'documents' | 'books' | 'clothes' | 'other_permitted';

export type ParcelSize = 'small' | 'medium' | 'large';

export type UrgencyOption = 'today' | 'tomorrow' | 'custom_time';

export type SenderStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ParcelDetails {
  category: ParcelCategory;
  categoryLabelBn: string;
  weightKg: number;
  size: ParcelSize;
  sizeLabelBn: string;
  description: string;
}

export interface PickupDetails {
  areaName: string;
  landmark: string;
  contactPhone: string;
  approximateDistanceNoteBn: string;
  coordinates?: [number, number];
}

export interface SenderFormData {
  // Step 1: Route
  originId: string;
  destinationId: string;
  originCityBn: string;
  destinationCityBn: string;
  
  // Step 2: Parcel
  parcel: ParcelDetails;

  // Step 3: Urgency
  urgency: UrgencyOption;
  urgencyLabelBn: string;
  targetTimeNoteBn: string;

  // Step 4: Pickup
  pickup: PickupDetails;

  // Step 5 & 6: Selected Traveller
  selectedTravellerId?: string;
  selectedTravellerPrice?: number;
}

import type { MatchScoreBreakdown, RouteCompatibilityLevel } from '@/lib/matching/matchingTypes';

export type SortCriteria = 'best_match' | 'nearest' | 'rating' | 'earliest';

export interface MatchingResult {
  travellerId: string;
  name: string;
  avatarInitials: string;
  isVerified: boolean;
  verificationBadgeText: string;
  rating: number;
  totalTripsCompleted: number;
  routeTitleBn: string;
  departureTime: string;
  departureDate: string;
  approximateDistanceKm: number;
  availableCapacityKg: number;
  estimatedDeliveryTime: string;
  estimatedPrice: number;
  vehicleModeBn: string;
  originAreaBn: string;
  destinationAreaBn: string;
  allowedParcelTypes: string[];
  
  // Phase 5 Matching Engine Intelligence
  matchScore?: number;
  compatibilityLevel?: RouteCompatibilityLevel;
  breakdown?: MatchScoreBreakdown;
  reasons?: string[];
  reasonsSummaryBn?: string;
  isTopMatch?: boolean;
  disqualificationReasonBn?: string;
}

export interface BookingConfirmationData {
  bookingId: string;
  routeBn: string;
  travellerName: string;
  travellerRating: number;
  travellerVehicle: string;
  parcelCategoryBn: string;
  weightKg: number;
  pickupArea: string;
  pickupTimeEstimate: string;
  deliveryTimeEstimate: string;
  price: number;
  pickupOtpCode: string;
  dropoffOtpCode: string;
  paymentStatus: 'demo_escrow_secured';
  createdAtBn: string;
}
