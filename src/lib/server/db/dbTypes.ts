// BOHOK Phase 8 — Database Entity Definitions
// Aligned with PostgreSQL relational tables, foreign keys, and strict constraints

export interface DbUser {
  id: string; // UUID
  phone: string; // Normalized E.164: +8801XXXXXXXXX
  createdAt: string;
  updatedAt: string;
}

export interface DbUserProfile {
  userId: string; // UUID -> DbUser.id
  name: string;
  avatarUrl?: string;
  avatarInitials: string;
  verificationStatus: 'NEW' | 'PHONE_VERIFIED' | 'IDENTITY_VERIFIED' | 'TRUSTED_TRAVELLER';
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  updatedAt: string;
}

export interface DbUserRole {
  id: string;
  userId: string;
  role: 'SENDER' | 'TRAVELLER' | 'ADMIN';
  createdAt: string;
}

export interface DbTravellerProfile {
  userId: string;
  totalTripsCompleted: number;
  ratingAvg: number; // e.g. 4.90
  preferredVehicleMode?: string;
  isVerifiedTraveller: boolean;
  updatedAt: string;
}

export interface DbSenderProfile {
  userId: string;
  totalParcelsSent: number;
  ratingAvg: number;
  updatedAt: string;
}

export interface DbTrip {
  id: string;
  travellerId: string; // UUID -> DbUser.id
  originCity: string;
  originArea: string;
  destinationCity: string;
  destinationArea: string;
  departureAt: string;
  estimatedArrivalAt: string;
  travelMode: 'bus' | 'train' | 'car' | 'motorcycle' | 'other';
  vehicleModeBn: string;
  totalCapacityKg: number; // CHECK (totalCapacityKg > 0)
  remainingCapacityKg: number; // CHECK (remainingCapacityKg >= 0)
  pickupPreference: 'near_me' | 'specific_area' | 'along_route';
  pickupPreferenceBn: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface DbTripWaypoint {
  id: string;
  tripId: string; // UUID -> DbTrip.id
  city: string;
  areaName: string;
  sequenceOrder: number;
}

export interface DbParcel {
  id: string;
  senderId: string; // UUID -> DbUser.id
  originCity: string;
  originArea: string;
  destinationCity: string;
  destinationArea: string;
  category: 'documents' | 'books' | 'clothes' | 'other_permitted';
  categoryBn: string;
  weightKg: number; // CHECK (weightKg > 0)
  packageSize: 'small' | 'medium' | 'large';
  packageSizeBn: string;
  description: string;
  urgency: 'today' | 'tomorrow' | 'custom_time';
  urgencyBn: string;
  recipientName: string;
  recipientPhone: string;
  status: 'DRAFT' | 'SEARCHING' | 'MATCHED' | 'BOOKED' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface DbParcelItem {
  id: string;
  parcelId: string;
  description: string;
  isPermitted: boolean;
}

export interface DbMatch {
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
  compatibilityLevel: 'PERFECT' | 'COMPATIBLE_CORRIDOR' | 'NEARBY_DROPOFF' | 'NO_MATCH';
  status: 'CANDIDATE' | 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}

export interface DbBooking {
  id: string;
  parcelId: string;
  tripId: string;
  senderId: string;
  travellerId: string; // CONSTRAINT: senderId != travellerId
  status:
    | 'PENDING_TRAVELLER'
    | 'ACCEPTED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_HELD'
    | 'READY_FOR_PICKUP'
    | 'TRAVELLER_ARRIVED'
    | 'HANDOVER_PENDING'
    | 'HANDED_OVER'
    | 'IN_TRANSIT'
    | 'ARRIVED_DESTINATION'
    | 'DELIVERY_PENDING'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'DISPUTED';
  travellerFee: number;
  platformFee: number;
  trustGuarantee: number;
  totalAmount: number;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  disputeReason?: string;
}

export interface DbHandover {
  id: string;
  bookingId: string; // UNIQUE -> DbBooking.id
  packageInspected: boolean;
  noProhibitedItems: boolean;
  recipientPhoneConfirmed: boolean;
  weightWithinLimit: boolean;
  pickupVerifiedAt?: string;
  deliveryVerifiedAt?: string;
  travellerNotes?: string;
  status: 'PENDING' | 'HANDED_OVER' | 'DELIVERED';
}

export interface DbOtpChallenge {
  id: string;
  bookingId: string;
  purpose: 'HANDOVER' | 'DELIVERY';
  hashedCode: string; // SHA-256(code + salt)
  salt: string;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: string;
  verifiedAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DbPayment {
  id: string;
  bookingId: string; // UNIQUE -> DbBooking.id
  amount: number;
  method: 'bkash' | 'nagad' | 'card' | 'demo_escrow';
  status: 'UNPAID' | 'INITIATED' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FAILED';
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DbPaymentEvent {
  id: string;
  paymentId: string;
  eventType: 'INITIATE' | 'HOLD_ESCROW' | 'RELEASE_ESCROW' | 'REFUND';
  amount: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DbRating {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  role: 'sender' | 'traveller';
  score: number; // 1 to 5
  careScore?: number;
  speedScore?: number;
  communicationScore?: number;
  comment?: string;
  createdAt: string;
}

export interface DbDispute {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  category: 'parcel_damaged' | 'parcel_missing' | 'late_delivery' | 'no_show' | 'prohibited_items' | 'wrong_recipient' | 'other';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  type: string;
  titleBn: string;
  bodyBn: string;
  entityType?: 'booking' | 'trip' | 'parcel' | 'dispute';
  entityId?: string;
  readAt?: string;
  createdAt: string;
}

export interface DbAuditLog {
  id: string;
  actorUserId?: string;
  entityType: 'user' | 'booking' | 'trip' | 'parcel' | 'payment' | 'otp' | 'dispute';
  entityId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
