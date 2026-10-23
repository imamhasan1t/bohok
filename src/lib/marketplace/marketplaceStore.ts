// BOHOK Phase 5.5 — In-Memory Marketplace Store
// Pure, strongly-typed state management for crowdshipping operations

import {
  User,
  Trip,
  Parcel,
  Match,
  Booking,
  Handover,
  Payment,
  Rating,
  PublicTravellerProfile,
  PrivateTravellerDetails,
  SenderCancellationReason,
  TravellerCancellationReason,
  DisputeReason,
} from './marketplaceTypes';
import {
  validateTripTransition,
  validateParcelTransition,
  validateMatchTransition,
  validateBookingTransition,
  validateHandoverTransition,
  validatePaymentTransition,
} from './marketplaceTransitions';
import { marketplaceEvents } from './marketplaceEvents';

export class MarketplaceStore {
  private users: Map<string, User> = new Map();
  private privateTravellerDetails: Map<string, PrivateTravellerDetails> = new Map();
  private trips: Map<string, Trip> = new Map();
  private parcels: Map<string, Parcel> = new Map();
  private matches: Map<string, Match> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private handovers: Map<string, Handover> = new Map();
  private payments: Map<string, Payment> = new Map();
  private ratings: Map<string, Rating> = new Map();

  // ==========================================
  // USER & PRIVACY METHODS
  // ==========================================

  public registerUser(user: User, privateDetails?: PrivateTravellerDetails): User {
    this.users.set(user.id, user);
    if (privateDetails) {
      this.privateTravellerDetails.set(user.id, privateDetails);
    }
    return user;
  }

  public getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Enforces privacy rule: Returns only sanitized public traveller info.
   * Private phone, exact GPS, and national identity documents are excluded.
   */
  public getPublicTravellerProfile(userId: string, tripId?: string): PublicTravellerProfile | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const trip = tripId ? this.trips.get(tripId) : undefined;

    return {
      name: user.name,
      avatar: user.avatar,
      avatarInitials: user.avatarInitials,
      rating: user.rating,
      verificationBadgeBn: user.verificationBadgeBn,
      approximateAreaBn: trip?.origin.areaNameBn || 'যাত্রাবাড়ী সংলগ্ন',
      routeBn: trip ? `${trip.origin.hubNameBn} → ${trip.destination.hubNameBn}` : 'ঢাকা ↔ কুমিল্লা',
      departureTimeBn: trip?.departureTimeBn || 'আজ বিকাল ০৪:৩০',
      vehicleModeBn: trip?.travelModeBn || 'প্রাইভেট কার',
      totalTripsCompleted: user.completedTrips,
    };
  }

  // ==========================================
  // TRIP LIFECYCLE
  // ==========================================

  public createTrip(
    tripData: Omit<Trip, 'id' | 'remainingCapacityKg' | 'status' | 'createdAt'> & {
      id?: string;
      initialStatus?: Trip['status'];
    }
  ): Trip {
    const tripId = tripData.id || `trip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const status = tripData.initialStatus || 'PUBLISHED';

    const trip: Trip = {
      ...tripData,
      id: tripId,
      remainingCapacityKg: tripData.availableCapacityKg, // Capacity initially equals maximum
      status,
      createdAt: new Date().toISOString(),
    };

    this.trips.set(tripId, trip);
    marketplaceEvents.emit(
      'TRIP_PUBLISHED',
      tripId,
      `নতুন ভ্রমণ প্রকাশিত হয়েছে: ${trip.origin.hubNameBn} → ${trip.destination.hubNameBn}`,
      { travellerId: trip.travellerId, capacityKg: trip.availableCapacityKg }
    );
    return trip;
  }

  public getTrip(tripId: string): Trip | undefined {
    return this.trips.get(tripId);
  }

  public getAllTrips(): Trip[] {
    return Array.from(this.trips.values());
  }

  public updateTripStatus(tripId: string, targetStatus: Trip['status']): Trip {
    const trip = this.trips.get(tripId);
    if (!trip) throw new Error(`Trip '${tripId}' not found.`);

    const validation = validateTripTransition(trip.status, targetStatus);
    if (!validation.valid) {
      throw new Error(validation.errorMessage);
    }

    trip.status = targetStatus;
    this.trips.set(tripId, trip);
    return trip;
  }

  // ==========================================
  // PARCEL LIFECYCLE
  // ==========================================

  public createParcel(
    parcelData: Omit<Parcel, 'id' | 'status' | 'createdAt'> & {
      id?: string;
      initialStatus?: Parcel['status'];
    }
  ): Parcel {
    const parcelId = parcelData.id || `pcl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const status = parcelData.initialStatus || 'SEARCHING';

    const parcel: Parcel = {
      ...parcelData,
      id: parcelId,
      status,
      createdAt: new Date().toISOString(),
    };

    this.parcels.set(parcelId, parcel);
    marketplaceEvents.emit(
      'PARCEL_CREATED',
      parcelId,
      `নতুন পার্সেল রিকোয়েস্ট তৈরি করা হয়েছে (${parcel.categoryBn}, ${parcel.weightKg} কেজি)`,
      { senderId: parcel.senderId, weightKg: parcel.weightKg }
    );
    return parcel;
  }

  public getParcel(parcelId: string): Parcel | undefined {
    return this.parcels.get(parcelId);
  }

  public getAllParcels(): Parcel[] {
    return Array.from(this.parcels.values());
  }

  public updateParcelStatus(parcelId: string, targetStatus: Parcel['status']): Parcel {
    const parcel = this.parcels.get(parcelId);
    if (!parcel) throw new Error(`Parcel '${parcelId}' not found.`);

    const validation = validateParcelTransition(parcel.status, targetStatus);
    if (!validation.valid) {
      throw new Error(validation.errorMessage);
    }

    parcel.status = targetStatus;
    this.parcels.set(parcelId, parcel);
    return parcel;
  }

  // ==========================================
  // MATCH LIFECYCLE
  // ==========================================

  public createMatch(
    matchData: Omit<Match, 'id' | 'status' | 'createdAt'> & { id?: string }
  ): Match {
    const matchId = matchData.id || `mtc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const match: Match = {
      ...matchData,
      id: matchId,
      status: 'CANDIDATE',
      createdAt: new Date().toISOString(),
    };

    this.matches.set(matchId, match);

    // Transition parcel status to MATCHED when match is discovered
    const parcel = this.parcels.get(matchData.parcelId);
    if (parcel && parcel.status === 'SEARCHING') {
      parcel.status = 'MATCHED';
    }

    marketplaceEvents.emit(
      'MATCH_FOUND',
      matchId,
      `পার্সেল ও সহযাত্রীর মধ্যে সফল ম্যাচ পাওয়া গেছে (স্কোর: ${match.score}%)`,
      { parcelId: match.parcelId, tripId: match.tripId, score: match.score }
    );
    return match;
  }

  public getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  // ==========================================
  // BOOKING LIFECYCLE (CORE MARKETPLACE LOGIC)
  // ==========================================

  /**
   * RULE: A match is NOT automatically a booking.
   * Sender explicitly sends a booking request to a traveller candidate.
   */
  public requestBooking(
    parcelId: string,
    tripId: string,
    price: number,
    matchId?: string
  ): Booking {
    const parcel = this.parcels.get(parcelId);
    if (!parcel) throw new Error(`Parcel '${parcelId}' not found.`);

    const trip = this.trips.get(tripId);
    if (!trip) throw new Error(`Trip '${tripId}' not found.`);

    // Check remaining capacity sufficiency before allowing request
    if (parcel.weightKg > trip.remainingCapacityKg) {
      throw new Error(
        `Capacity overflow: Parcel weight (${parcel.weightKg} kg) exceeds trip's remaining capacity (${trip.remainingCapacityKg} kg).`
      );
    }

    // Update match status to REQUESTED if match exists
    let resolvedMatchId = matchId;
    if (resolvedMatchId) {
      const match = this.matches.get(resolvedMatchId);
      if (match) {
        const val = validateMatchTransition(match.status, 'REQUESTED');
        if (!val.valid) throw new Error(val.errorMessage);
        match.status = 'REQUESTED';
      }
    } else {
      resolvedMatchId = `mtc-${Date.now()}`;
    }

    // Update parcel status from SEARCHING/MATCHED to BOOKED (pending acceptance)
    this.updateParcelStatus(parcelId, 'BOOKED');

    const bookingId = `bkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const booking: Booking = {
      id: bookingId,
      matchId: resolvedMatchId,
      senderId: parcel.senderId,
      travellerId: trip.travellerId,
      parcelId,
      tripId,
      status: 'PENDING_TRAVELLER',
      price,
      createdAt: new Date().toISOString(),
    };

    this.bookings.set(bookingId, booking);
    marketplaceEvents.emit(
      'BOOKING_REQUESTED',
      bookingId,
      `যাত্রীর অনুমোদনের জন্য বুকিং অনুরোধ পাঠানো হয়েছে (ভাড়া: ৳${price})`,
      { bookingId, senderId: parcel.senderId, travellerId: trip.travellerId }
    );

    return booking;
  }

  /**
   * Traveller accepts booking:
   * 1. Validates status is PENDING_TRAVELLER
   * 2. Re-verifies capacity: parcel.weightKg <= trip.remainingCapacityKg
   * 3. Decrements trip.remainingCapacityKg by parcel.weightKg
   * 4. Updates booking to CONFIRMED
   * 5. Sets parcel to READY_FOR_PICKUP
   * 6. Generates Handover (pickup OTP, delivery OTP)
   * 7. Places Payment in HELD status
   */
  public acceptBooking(bookingId: string): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error(`Booking '${bookingId}' not found.`);

    const trip = this.trips.get(booking.tripId);
    if (!trip) throw new Error(`Trip '${booking.tripId}' not found.`);

    const parcel = this.parcels.get(booking.parcelId);
    if (!parcel) throw new Error(`Parcel '${booking.parcelId}' not found.`);

    // Strict validation of transition
    const valBooking = validateBookingTransition(booking.status, 'CONFIRMED');
    if (!valBooking.valid) throw new Error(valBooking.errorMessage);

    // Capacity verification
    if (parcel.weightKg > trip.remainingCapacityKg) {
      throw new Error(
        `Capacity exceeded: Trip only has ${trip.remainingCapacityKg} kg remaining, but parcel requires ${parcel.weightKg} kg.`
      );
    }

    // Decrement capacity
    trip.remainingCapacityKg = Math.round((trip.remainingCapacityKg - parcel.weightKg) * 100) / 100;

    // Update statuses
    booking.status = 'CONFIRMED';
    booking.confirmedAt = new Date().toISOString();

    if (booking.matchId) {
      const match = this.matches.get(booking.matchId);
      if (match && match.status === 'REQUESTED') {
        match.status = 'ACCEPTED';
      }
    }

    this.updateParcelStatus(parcel.id, 'READY_FOR_PICKUP');

    // Create Handover entity with secure dual OTPs
    const handoverId = `hnd-${Date.now()}`;
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    this.handovers.set(bookingId, {
      id: handoverId,
      bookingId,
      pickupOtp,
      deliveryOtp,
      status: 'PICKUP_PENDING',
    });

    // Create Payment in escrow (HELD)
    const paymentId = `pay-${Date.now()}`;
    this.payments.set(bookingId, {
      id: paymentId,
      bookingId,
      amount: booking.price,
      status: 'HELD',
      createdAt: new Date().toISOString(),
    });

    marketplaceEvents.emit(
      'BOOKING_ACCEPTED',
      bookingId,
      `সহযাত্রী পার্সেল অনুরোধ গ্রহণ করেছেন। বুকিং নিশ্চিত হয়েছে।`,
      { bookingId, remainingCapacityKg: trip.remainingCapacityKg }
    );

    return booking;
  }

  /**
   * Traveller declines booking:
   * Sets booking CANCELLED, match DECLINED, parcel back to SEARCHING
   */
  public declineBooking(bookingId: string): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error(`Booking '${bookingId}' not found.`);

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();

    if (booking.matchId) {
      const match = this.matches.get(booking.matchId);
      if (match) match.status = 'DECLINED';
    }

    // Release parcel back to SEARCHING so sender can choose another traveller
    const parcel = this.parcels.get(booking.parcelId);
    if (parcel && parcel.status === 'BOOKED') {
      parcel.status = 'SEARCHING';
    }

    marketplaceEvents.emit(
      'BOOKING_DECLINED',
      bookingId,
      `সহযাত্রী পার্সেল অনুরোধ গ্রহণ করতে অপরাগতা প্রকাশ করেছেন।`,
      { bookingId }
    );

    return booking;
  }

  /**
   * Handover Step 1: Pickup Verification via OTP
   */
  public verifyPickup(bookingId: string, otpCode: string): Handover {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error(`Booking '${bookingId}' not found.`);

    const handover = this.handovers.get(bookingId);
    if (!handover) throw new Error(`Handover not found for booking '${bookingId}'.`);

    if (handover.pickupOtp !== otpCode) {
      throw new Error('Invalid Pickup OTP. Handover rejected.');
    }

    const valHandover = validateHandoverTransition(handover.status, 'PICKUP_VERIFIED');
    if (!valHandover.valid) throw new Error(valHandover.errorMessage);

    handover.status = 'PICKUP_VERIFIED';
    handover.pickupVerifiedAt = new Date().toISOString();

    // Advance to IN_TRANSIT
    booking.status = 'IN_TRANSIT';
    this.updateParcelStatus(booking.parcelId, 'IN_TRANSIT');

    // Update trip to ACTIVE
    const trip = this.trips.get(booking.tripId);
    if (trip && trip.status === 'PUBLISHED') {
      trip.status = 'ACTIVE';
    }

    // Handover transitions to awaiting delivery
    handover.status = 'DELIVERY_PENDING';

    marketplaceEvents.emit(
      'PICKUP_VERIFIED',
      bookingId,
      `পিকআপ ওটিপি সফলভাবে যাচাইকৃত। পার্সেল এখন ট্রানজিটে রয়েছে।`,
      { bookingId, pickupVerifiedAt: handover.pickupVerifiedAt }
    );

    return handover;
  }

  /**
   * Handover Step 2: Delivery Verification via OTP & Payment Release
   */
  public verifyDelivery(bookingId: string, otpCode: string): Handover {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error(`Booking '${bookingId}' not found.`);

    const handover = this.handovers.get(bookingId);
    if (!handover) throw new Error(`Handover not found for booking '${bookingId}'.`);

    if (handover.deliveryOtp !== otpCode) {
      throw new Error('Invalid Delivery OTP. Delivery verification rejected.');
    }

    handover.status = 'DELIVERY_VERIFIED';
    handover.deliveryVerifiedAt = new Date().toISOString();

    booking.status = 'DELIVERED';
    booking.completedAt = new Date().toISOString();
    this.updateParcelStatus(booking.parcelId, 'DELIVERED');

    // Release Payment
    const payment = this.payments.get(bookingId);
    if (payment && payment.status === 'HELD') {
      payment.status = 'RELEASED';
      payment.releasedAt = new Date().toISOString();
    }

    marketplaceEvents.emit(
      'DELIVERY_VERIFIED',
      bookingId,
      `ডেলিভারি ওটিপি সফলভাবে যাচাইকৃত। পার্সেল প্রাপকের নিকট হস্তান্তর সম্পন্ন।`,
      { bookingId, deliveryVerifiedAt: handover.deliveryVerifiedAt }
    );
    marketplaceEvents.emit(
      'BOOKING_COMPLETED',
      bookingId,
      `বুকিং সফলভাবে সম্পন্ন হয়েছে ও ভাড়া রিলিজ করা হয়েছে।`,
      { bookingId, amount: payment?.amount }
    );

    return handover;
  }

  /**
   * Cancellation: Restores trip capacity if booking was confirmed
   */
  public cancelBooking(
    bookingId: string,
    reason: SenderCancellationReason | TravellerCancellationReason,
    cancelledBy: 'sender' | 'traveller'
  ): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error(`Booking '${bookingId}' not found.`);

    const val = validateBookingTransition(booking.status, 'CANCELLED');
    if (!val.valid) throw new Error(val.errorMessage);

    const wasConfirmed =
      booking.status === 'CONFIRMED' || booking.status === 'PICKUP_PENDING';

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date().toISOString();

    // Capacity Restoration Rule: If booking was confirmed, restore capacity
    if (wasConfirmed) {
      const trip = this.trips.get(booking.tripId);
      const parcel = this.parcels.get(booking.parcelId);
      if (trip && parcel) {
        trip.remainingCapacityKg = Math.min(
          trip.availableCapacityKg,
          Math.round((trip.remainingCapacityKg + parcel.weightKg) * 100) / 100
        );
      }
    }

    // Cancel parcel and refund payment if held
    const parcel = this.parcels.get(booking.parcelId);
    if (parcel) {
      parcel.status = 'CANCELLED';
    }

    const payment = this.payments.get(bookingId);
    if (payment && payment.status === 'HELD') {
      payment.status = 'REFUNDED';
    }

    marketplaceEvents.emit(
      'BOOKING_CANCELLED',
      bookingId,
      `বুকিং বাতিল করা হয়েছে (${cancelledBy === 'sender' ? 'প্রেরক' : 'সহযাত্রী'} কর্তৃক)`,
      { bookingId, reason, cancelledBy }
    );

    return booking;
  }

  /**
   * Dispute registration
   */
  public raiseDispute(bookingId: string, reason: DisputeReason, comment?: string): Booking {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error(`Booking '${bookingId}' not found.`);

    const val = validateBookingTransition(booking.status, 'DISPUTED');
    if (!val.valid) throw new Error(val.errorMessage);

    booking.status = 'DISPUTED';
    booking.disputeReason = reason;

    const payment = this.payments.get(bookingId);
    if (payment && payment.status === 'HELD') {
      payment.status = 'DISPUTED';
    }

    marketplaceEvents.emit(
      'DISPUTE_RAISED',
      bookingId,
      `বুকিংয়ে বিরোধ উত্থাপন করা হয়েছে: ${reason}`,
      { bookingId, reason, comment }
    );

    return booking;
  }

  public getBooking(bookingId: string): Booking | undefined {
    return this.bookings.get(bookingId);
  }

  public getHandover(bookingId: string): Handover | undefined {
    return this.handovers.get(bookingId);
  }

  public getPayment(bookingId: string): Payment | undefined {
    return this.payments.get(bookingId);
  }

  public getAllBookings(): Booking[] {
    return Array.from(this.bookings.values());
  }

  // ==========================================
  // RATINGS
  // ==========================================

  public addRating(
    bookingId: string,
    fromUserId: string,
    toUserId: string,
    score: number,
    comment?: string
  ): Rating {
    const ratingId = `rtg-${Date.now()}`;
    const rating: Rating = {
      id: ratingId,
      bookingId,
      fromUserId,
      toUserId,
      score,
      comment,
      createdAt: new Date().toISOString(),
    };
    this.ratings.set(ratingId, rating);
    return rating;
  }

  // ==========================================
  // RESET METHOD (FOR TESTS & DEMOS)
  // ==========================================

  public reset(): void {
    this.users.clear();
    this.privateTravellerDetails.clear();
    this.trips.clear();
    this.parcels.clear();
    this.matches.clear();
    this.bookings.clear();
    this.handovers.clear();
    this.payments.clear();
    this.ratings.clear();
    marketplaceEvents.clear();
  }
}

// Global singleton instance for prototype lifecycle
export const marketplaceStore = new MarketplaceStore();
