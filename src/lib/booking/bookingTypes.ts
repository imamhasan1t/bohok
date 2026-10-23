// BOHOK Phase 7 — Complete Booking, Handover & Delivery Lifecycle Types
// Strongly typed domain models for peer-to-peer parcel lifecycle in Bangladesh

export type BookingLifecycleStatus =
  | 'PENDING_TRAVELLER'    // Sender requested booking, waiting for traveller acceptance
  | 'ACCEPTED'              // Traveller accepted request
  | 'PAYMENT_PENDING'       // Waiting for sender escrow payment
  | 'PAYMENT_HELD'          // Payment secured in demo escrow
  | 'READY_FOR_PICKUP'      // Sender ready at pickup spot
  | 'TRAVELLER_ARRIVED'     // Traveller reached pickup location
  | 'HANDOVER_PENDING'      // Safety check & OTP 1 in progress
  | 'HANDED_OVER'           // OTP 1 verified, parcel in traveller possession
  | 'IN_TRANSIT'            // Traveller on the highway/corridor
  | 'ARRIVED_DESTINATION'   // Traveller reached destination city
  | 'DELIVERY_PENDING'      // Meeting recipient at dropoff point
  | 'DELIVERED'             // OTP 2 verified, delivery confirmed
  | 'CANCELLED'             // Booking cancelled before handover
  | 'DISPUTED';             // Dispute registered

export interface HandoverSafetyChecklist {
  packageInspected: boolean;       // Parcel packaging inspected visually
  noProhibitedItems: boolean;      // Verified not illegal/hazardous/flammable
  recipientPhoneConfirmed: boolean;// Recipient phone confirmed
  weightWithinLimit: boolean;      // Matches declared weight
}

export interface HandoverRecord {
  otp1: string;                     // 4-digit code generated for Sender
  otp1Verified: boolean;
  verifiedAt?: string;
  checklist: HandoverSafetyChecklist;
  travellerNotes?: string;
}

export interface DeliveryRecord {
  otp2: string;                     // 4-digit code generated for Recipient
  otp2Verified: boolean;
  verifiedAt?: string;
  recipientNotes?: string;
  recipientConfirmedName?: string;
}

export interface BookingPriceBreakdown {
  travellerFee: number;     // e.g. ৳150
  platformFee: number;      // e.g. ৳20
  trustGuarantee: number;   // e.g. ৳10
  total: number;            // e.g. ৳180
}

export interface BookingRating {
  id: string;
  bookingId: string;
  fromRole: 'sender' | 'traveller';
  fromUserId: string;
  toUserId: string;
  rating: number;           // 1 to 5
  punctualityScore?: number;
  careScore?: number;
  communicationScore?: number;
  speedScore?: number;
  comment?: string;
  createdAt: string;
}

export type DisputeCategory =
  | 'parcel_damaged'
  | 'parcel_missing'
  | 'late_delivery'
  | 'no_show'
  | 'prohibited_items'
  | 'wrong_recipient'
  | 'other';

export interface BookingDispute {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  raisedByRole: 'sender' | 'traveller';
  category: DisputeCategory;
  categoryBn: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BookingTimelineEvent {
  id: string;
  status: BookingLifecycleStatus;
  titleBn: string;
  descriptionBn: string;
  timestamp: string;
  actorRole: 'sender' | 'traveller' | 'system';
}

export interface DetailedBooking {
  id: string;
  parcelId: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderPhoneMasked: string;
  recipientName: string;
  recipientPhone: string;
  recipientPhoneMasked: string;
  travellerId: string;
  travellerName: string;
  travellerPhone: string;
  travellerPhoneMasked: string;
  travellerRating: number;
  travellerAvatar: string;
  travellerVehicleBn: string;
  
  // Route
  originCityBn: string;
  originAreaBn: string;
  destinationCityBn: string;
  destinationAreaBn: string;
  routeBn: string;
  corridorNameBn: string;
  
  // Parcel Details
  parcelTitleBn: string;
  parcelCategoryBn: string;
  parcelWeightKg: number;
  parcelSizeBn: string;
  
  // Timing
  pickupEstimatedTimeBn: string;
  deliveryEstimatedTimeBn: string;
  
  // Lifecycle & Financials
  status: BookingLifecycleStatus;
  priceBreakdown: BookingPriceBreakdown;
  paymentTransactionId?: string;
  paymentStatus: 'UNPAID' | 'INITIATED' | 'HELD' | 'RELEASED' | 'REFUNDED';
  
  // Operational state
  handover: HandoverRecord;
  delivery: DeliveryRecord;
  timeline: BookingTimelineEvent[];
  
  // Follow-ups
  senderRating?: BookingRating;
  travellerReview?: BookingRating;
  dispute?: BookingDispute;
  cancellationReason?: string;
  
  createdAt: string;
  updatedAt: string;
}
