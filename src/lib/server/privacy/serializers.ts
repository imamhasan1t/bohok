// BOHOK Phase 8 — Privacy Serializers & Sensitive Data Redaction
// Protects citizen privacy, NID, residential GPS, and unmasked phone numbers

import { DbUser, DbUserProfile, DbTravellerProfile, DbTrip, DbBooking, DbParcel, DbPayment } from '../db/dbTypes';

export interface PublicTravellerView {
  userId: string;
  name: string;
  avatarInitials: string;
  verificationBadgeBn: string;
  ratingAvg: number;
  totalTripsCompleted: number;
  preferredVehicleMode?: string;
  approximateAreaBn: string;
}

export interface PrivateBookingView {
  id: string;
  status: DbBooking['status'];
  routeBn: string;
  parcelTitle: string;
  parcelCategoryBn: string;
  weightKg: number;
  pickupEstimatedTimeBn?: string;
  deliveryEstimatedTimeBn?: string;
  priceBreakdown: {
    travellerFee: number;
    platformFee: number;
    trustGuarantee: number;
    totalAmount: number;
  };
  paymentStatus: DbPayment['status'];
  counterparty: {
    name: string;
    role: 'sender' | 'traveller';
    phoneMasked: string; // NEVER unmasked to public
    approximateLocationBn: string;
  };
  otp1HeldBySender?: string; // Revealed ONLY to sender!
  otp2HeldByRecipient?: string; // Revealed ONLY to recipient/sender!
}

export const PrivacySerializer = {
  maskPhone(phone: string): string {
    const clean = phone.replace(/[\s-]/g, '');
    if (clean.length < 10) return phone;
    const prefix = clean.slice(0, 6);
    const suffix = clean.slice(-3);
    return `${prefix}***${suffix}`;
  },

  /**
   * Public Traveller Profile View: Strips phone, exact GPS, address, NID
   */
  serializePublicTraveller(
    user: DbUser,
    profile: DbUserProfile,
    travellerProfile?: DbTravellerProfile,
    trip?: DbTrip
  ): PublicTravellerView {
    return {
      userId: user.id,
      name: profile.name.split(' ')[0] + ' ' + (profile.name.split(' ')[1]?.[0] || '') + '.',
      avatarInitials: profile.avatarInitials,
      verificationBadgeBn: profile.isIdentityVerified
        ? 'এনআইডি যাচাইকৃত'
        : profile.isPhoneVerified
        ? 'ফোন যাচাইকৃত'
        : 'নতুন সদস্য',
      ratingAvg: travellerProfile?.ratingAvg || 5.0,
      totalTripsCompleted: travellerProfile?.totalTripsCompleted || 0,
      preferredVehicleMode: travellerProfile?.preferredVehicleMode,
      approximateAreaBn: trip ? `${trip.originCity} — ${trip.originArea}` : 'ঢাকা অঞ্চল',
    };
  },

  /**
   * Private Booking View: Exposes minimal participant contact details
   * Enforces dual-OTP privacy: Traveller NEVER sees OTP 1 or OTP 2 in this response!
   */
  serializePrivateBooking(
    booking: DbBooking,
    parcel: DbParcel,
    trip: DbTrip,
    senderUser: DbUser,
    senderProfile: DbUserProfile,
    travellerUser: DbUser,
    travellerProfile: DbUserProfile,
    callerUserId: string,
    plainOtp1ForSender?: string,
    plainOtp2ForRecipient?: string
  ): PrivateBookingView {
    const isCallerSender = callerUserId === booking.senderId;

    const counterparty = isCallerSender
      ? {
          name: travellerProfile.name,
          role: 'traveller' as const,
          phoneMasked: PrivacySerializer.maskPhone(travellerUser.phone),
          approximateLocationBn: `${trip.originArea} (পিকআপ মিটিং পয়েন্ট)`,
        }
      : {
          name: senderProfile.name,
          role: 'sender' as const,
          phoneMasked: PrivacySerializer.maskPhone(senderUser.phone),
          approximateLocationBn: `${parcel.originArea} (প্রেরক এলাকা)`,
        };

    return {
      id: booking.id,
      status: booking.status,
      routeBn: `${trip.originCity} → ${trip.destinationCity}`,
      parcelTitle: parcel.description,
      parcelCategoryBn: parcel.categoryBn,
      weightKg: parcel.weightKg,
      priceBreakdown: {
        travellerFee: booking.travellerFee,
        platformFee: booking.platformFee,
        trustGuarantee: booking.trustGuarantee,
        totalAmount: booking.totalAmount,
      },
      paymentStatus: 'HELD',
      counterparty,
      // DUAL OTP PRIVACY: Only sender receives OTP codes; Traveller receives undefined
      otp1HeldBySender: isCallerSender ? plainOtp1ForSender : undefined,
      otp2HeldByRecipient: isCallerSender ? plainOtp2ForRecipient : undefined,
    };
  },
};
