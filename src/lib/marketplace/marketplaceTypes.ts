// BOHOK Phase 5.5 — Marketplace State Architecture Types
// Pure, strongly-typed domain model for Bangladesh peer-to-peer crowdshipping

import { RouteCompatibilityLevel } from '@/lib/matching/matchingTypes';

// ==========================================
// 1. STATE MACHINE STATUS ENUMS & TYPES
// ==========================================

export type TripStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'MATCHING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParcelStatus =
  | 'DRAFT'
  | 'SEARCHING'
  | 'MATCHED'
  | 'BOOKED'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type MatchStatus =
  | 'CANDIDATE'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED';

export type BookingStatus =
  | 'PENDING_TRAVELLER'
  | 'CONFIRMED'
  | 'PICKUP_PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERY_PENDING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DISPUTED';

export type HandoverStatus =
  | 'PICKUP_PENDING'
  | 'PICKUP_VERIFIED'
  | 'DELIVERY_PENDING'
  | 'DELIVERY_VERIFIED';

export type PaymentStatus =
  | 'PENDING'
  | 'HELD'
  | 'RELEASED'
  | 'REFUNDED'
  | 'DISPUTED';

// ==========================================
// 2. CANCELLATION & DISPUTE REASONS
// ==========================================

export type SenderCancellationReason =
  | 'changed_mind'
  | 'wrong_details'
  | 'no_longer_needed'
  | 'other';

export type TravellerCancellationReason =
  | 'trip_cancelled'
  | 'personal_reason'
  | 'capacity_issue'
  | 'other';

export type DisputeReason =
  | 'parcel_damaged'
  | 'parcel_missing'
  | 'late_delivery'
  | 'wrong_recipient'
  | 'handover_problem'
  | 'other';

// ==========================================
// 3. CORE ENTITIES
// ==========================================

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  avatarInitials: string;
  verificationStatus:
    | 'verified'
    | 'pending'
    | 'unverified'
    | 'NEW'
    | 'PHONE_VERIFIED'
    | 'IDENTITY_VERIFIED'
    | 'TRUSTED_TRAVELLER';
  verificationBadgeBn: string;
  rating: number;
  completedTrips: number;
  createdAt: string;
}

export interface SenderProfile {
  userId: string;
  defaultPickupAreaBn?: string;
  totalParcelsSent: number;
}

export interface TravellerProfile {
  userId: string;
  vehicleMode: 'bus' | 'train' | 'car' | 'motorcycle' | 'other';
  vehicleModeBn: string;
  reliabilityScore: number; // 0 to 100
  completedTrips: number;
  cancellationRate: number; // 0.0 to 1.0
}

export interface WaypointLocation {
  id: string;
  hubId: string;
  nameBn: string;
  order: number;
  isStopPoint: boolean;
}

export interface LocationReference {
  hubId: string;
  hubNameBn: string;
  areaNameBn: string;
  landmarkBn?: string;
  approximateDistanceKm?: number;
}

export interface Trip {
  id: string;
  travellerId: string;
  origin: LocationReference;
  destination: LocationReference;
  waypoints: WaypointLocation[];
  departureAt: string; // ISO 8601 or formatted date-time
  departureTimeBn: string;
  estimatedArrivalAt: string;
  estimatedArrivalTimeBn: string;
  travelMode: 'bus' | 'train' | 'car' | 'motorcycle' | 'other';
  travelModeBn: string;
  availableCapacityKg: number; // Total trip maximum capacity
  remainingCapacityKg: number; // Dynamically decremented when bookings confirmed
  pickupPreference: 'near_me' | 'specific_area' | 'along_route';
  pickupPreferenceBn: string;
  status: TripStatus;
  createdAt: string;
}

export interface PickupDetails {
  areaNameBn: string;
  landmarkBn: string;
  contactPhone: string;
  coordinatesApproximate?: [number, number];
}

export interface Parcel {
  id: string;
  senderId: string;
  origin: LocationReference;
  destination: LocationReference;
  category: 'documents' | 'books' | 'clothes' | 'other_permitted';
  categoryBn: string;
  weightKg: number;
  packageSize: 'small' | 'medium' | 'large';
  packageSizeBn: string;
  description: string;
  urgency: 'today' | 'tomorrow' | 'custom_time';
  urgencyBn: string;
  requiredDeliveryAt: string;
  pickupDetails: PickupDetails;
  status: ParcelStatus;
  createdAt: string;
}

export interface MatchScoreSummary {
  routeScore: number;
  timeScore: number;
  distanceScore: number;
  capacityScore: number;
  reliabilityScore: number;
  speedScore: number;
}

export interface Match {
  id: string;
  parcelId: string;
  tripId: string;
  score: number; // 0 to 100
  routeScore: number;
  timeScore: number;
  distanceScore: number;
  capacityScore: number;
  reliabilityScore: number;
  speedScore: number;
  compatibilityLevel: RouteCompatibilityLevel;
  reasons: string[];
  status: MatchStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  matchId: string;
  senderId: string;
  travellerId: string;
  parcelId: string;
  tripId: string;
  status: BookingStatus;
  price: number;
  cancellationReason?: SenderCancellationReason | TravellerCancellationReason;
  disputeReason?: DisputeReason;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface Handover {
  id: string;
  bookingId: string;
  pickupOtp: string;
  deliveryOtp: string;
  pickupVerifiedAt?: string;
  deliveryVerifiedAt?: string;
  status: HandoverStatus;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  releasedAt?: string;
}

export interface Rating {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  score: number; // 1 to 5
  comment?: string;
  createdAt: string;
}

// ==========================================
// 4. PRIVACY MODEL
// ==========================================

export interface PublicTravellerProfile {
  name: string;
  avatar: string;
  avatarInitials: string;
  rating: number;
  verificationBadgeBn: string;
  approximateAreaBn: string;
  routeBn: string;
  departureTimeBn: string;
  vehicleModeBn: string;
  totalTripsCompleted: number;
}

export interface PrivateTravellerDetails {
  phone: string;
  exactGpsCoordinates?: [number, number];
  exactAddress?: string;
  nidDocumentMasked?: string;
}

// ==========================================
// 5. EVENT MODEL
// ==========================================

export type MarketplaceEventType =
  | 'PARCEL_CREATED'
  | 'TRIP_PUBLISHED'
  | 'MATCH_FOUND'
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_DECLINED'
  | 'PICKUP_VERIFIED'
  | 'TRIP_STARTED'
  | 'DELIVERY_VERIFIED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'DISPUTE_RAISED';

export interface MarketplaceEvent {
  id: string;
  type: MarketplaceEventType;
  entityId: string;
  timestamp: string;
  payload: Record<string, unknown>;
  descriptionBn: string;
}
