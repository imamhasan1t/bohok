// BOHOK Phase 8 — In-Memory Relational Database Repository
// Enforces PostgreSQL constraints, foreign key integrity, and atomic transactions in development/testing

import {
  DbUser,
  DbUserProfile,
  DbUserRole,
  DbTravellerProfile,
  DbSenderProfile,
  DbTrip,
  DbTripWaypoint,
  DbParcel,
  DbParcelItem,
  DbMatch,
  DbBooking,
  DbHandover,
  DbOtpChallenge,
  DbPayment,
  DbPaymentEvent,
  DbRating,
  DbDispute,
  DbNotification,
  DbAuditLog,
} from './dbTypes';
import { IDatabaseRepository, DatabaseHealthStatus } from './databaseAdapter';
import { AppErrors } from '../errors/appErrors';

export class MemoryDatabase implements IDatabaseRepository {
  public users = new Map<string, DbUser>();
  public userProfiles = new Map<string, DbUserProfile>();
  public userRoles = new Map<string, DbUserRole[]>();
  public travellerProfiles = new Map<string, DbTravellerProfile>();
  public senderProfiles = new Map<string, DbSenderProfile>();

  public trips = new Map<string, DbTrip>();
  public tripWaypoints = new Map<string, DbTripWaypoint[]>();

  public parcels = new Map<string, DbParcel>();
  public parcelItems = new Map<string, DbParcelItem[]>();

  public matches = new Map<string, DbMatch>();
  public bookings = new Map<string, DbBooking>();
  public handovers = new Map<string, DbHandover>(); // bookingId -> DbHandover
  public otpChallenges = new Map<string, DbOtpChallenge>(); // challengeId -> DbOtpChallenge

  public payments = new Map<string, DbPayment>(); // bookingId -> DbPayment
  public paymentEvents = new Map<string, DbPaymentEvent[]>();

  public ratings = new Map<string, DbRating>();
  public disputes = new Map<string, DbDispute>();

  public notifications = new Map<string, DbNotification>();
  public auditLogs: DbAuditLog[] = [];

  constructor() {
    this.seedDefaultData();
  }

  public async checkHealth(): Promise<DatabaseHealthStatus> {
    return {
      connected: true,
      engine: 'MEMORY_FALLBACK',
      statusText: 'PRODUCTION INTEGRATION READY — CREDENTIAL REQUIRED (Using in-memory development database)',
      statusTextBn: 'প্রোডাকশন ইন্টিগ্রেশন প্রস্তুত — লাইভ ক্রেডেনশিয়াল প্রয়োজন (মেমোরি ডাটাবেজ সক্রিয়)',
      isProductionReady: false,
    };
  }

  public reset(): void {
    this.users.clear();
    this.userProfiles.clear();
    this.userRoles.clear();
    this.travellerProfiles.clear();
    this.senderProfiles.clear();
    this.trips.clear();
    this.tripWaypoints.clear();
    this.parcels.clear();
    this.parcelItems.clear();
    this.matches.clear();
    this.bookings.clear();
    this.handovers.clear();
    this.otpChallenges.clear();
    this.payments.clear();
    this.paymentEvents.clear();
    this.ratings.clear();
    this.disputes.clear();
    this.notifications.clear();
    this.auditLogs = [];
    this.seedDefaultData();
  }

  // ----------------------------------------------------------------------------
  // USERS
  // ----------------------------------------------------------------------------

  public insertUser(phone: string, name: string, role: 'SENDER' | 'TRAVELLER'): DbUser {
    // Check unique phone
    for (const u of this.users.values()) {
      if (u.phone === phone) {
        return u; // Idempotent user get
      }
    }

    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const user: DbUser = { id, phone, createdAt: now, updatedAt: now };
    this.users.set(id, user);

    const profile: DbUserProfile = {
      userId: id,
      name,
      avatarInitials: name.trim().slice(0, 2),
      verificationStatus: 'PHONE_VERIFIED',
      isPhoneVerified: true,
      isIdentityVerified: false,
      updatedAt: now,
    };
    this.userProfiles.set(id, profile);

    const userRole: DbUserRole = {
      id: `rol-${Date.now()}`,
      userId: id,
      role,
      createdAt: now,
    };
    this.userRoles.set(id, [userRole]);

    if (role === 'TRAVELLER') {
      this.travellerProfiles.set(id, {
        userId: id,
        totalTripsCompleted: 0,
        ratingAvg: 5.0,
        isVerifiedTraveller: false,
        updatedAt: now,
      });
    } else {
      this.senderProfiles.set(id, {
        userId: id,
        totalParcelsSent: 0,
        ratingAvg: 5.0,
        updatedAt: now,
      });
    }

    return user;
  }

  public getUserByPhone(phone: string): DbUser | null {
    for (const u of this.users.values()) {
      if (u.phone === phone) return u;
    }
    return null;
  }

  // ----------------------------------------------------------------------------
  // TRIPS & CAPACITY
  // ----------------------------------------------------------------------------

  public insertTrip(trip: Omit<DbTrip, 'id' | 'createdAt' | 'updatedAt' | 'remainingCapacityKg'>): DbTrip {
    if (!this.users.has(trip.travellerId)) {
      throw AppErrors.notFound('Traveller user', 'সহযাত্রীর অ্যাকাউন্ট পাওয়া যায়নি।');
    }
    if (trip.totalCapacityKg <= 0) {
      throw AppErrors.validationError('totalCapacityKg', 'Capacity must be > 0', 'সক্ষমতা অবশ্যই ০-এর বেশি হতে হবে।');
    }

    const id = `trp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newTrip: DbTrip = {
      ...trip,
      id,
      remainingCapacityKg: trip.totalCapacityKg,
      createdAt: now,
      updatedAt: now,
    };

    this.trips.set(id, newTrip);
    return newTrip;
  }

  // ----------------------------------------------------------------------------
  // PARCELS
  // ----------------------------------------------------------------------------

  public insertParcel(
    parcel: Omit<DbParcel, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'urgency' | 'urgencyBn'> & {
      urgency?: 'today' | 'tomorrow' | 'custom_time';
      urgencyBn?: string;
    }
  ): DbParcel {
    if (!this.users.has(parcel.senderId)) {
      throw AppErrors.notFound('Sender user', 'প্রেরকের অ্যাকাউন্ট পাওয়া যায়নি।');
    }
    if (parcel.weightKg <= 0) {
      throw AppErrors.validationError('weightKg', 'Weight must be > 0', 'পার্সেলের ওজন অবশ্যই ০-এর বেশি হতে হবে।');
    }

    const id = `pcl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newParcel: DbParcel = {
      ...parcel,
      urgency: parcel.urgency ?? 'today',
      urgencyBn: parcel.urgencyBn ?? 'আজই',
      id,
      status: 'SEARCHING',
      createdAt: now,
      updatedAt: now,
    };

    this.parcels.set(id, newParcel);
    return newParcel;
  }

  // ----------------------------------------------------------------------------
  // ATOMIC BOOKING ACCEPTANCE TRANSACTION
  // ----------------------------------------------------------------------------

  /**
   * Accepts a booking atomically:
   * 1. Checks trip exists & traveller owns it
   * 2. Checks parcel exists and status is available
   * 3. Checks remaining capacity >= parcel weight
   * 4. Enforces sender != traveller constraint
   * 5. Decrements trip capacity atomically
   * 6. Creates booking, payment record, and handover record
   * 7. If any step fails, rollbacks without mutation
   */
  public atomicAcceptBooking(params: {
    parcelId: string;
    tripId: string;
    travellerId: string;
  }): { booking: DbBooking; trip: DbTrip; parcel: DbParcel } {
    const trip = this.trips.get(params.tripId);
    if (!trip) {
      throw AppErrors.notFound('Trip', 'যাত্রা পাওয়া যায়নি।');
    }
    if (trip.travellerId !== params.travellerId) {
      throw AppErrors.forbidden('Not the trip owner', 'আপনি এই যাত্রার সহযাত্রী নন।');
    }

    const parcel = this.parcels.get(params.parcelId);
    if (!parcel) {
      throw AppErrors.notFound('Parcel', 'পার্সেল পাওয়া যায়নি।');
    }

    // Constraint: Sender cannot equal Traveller
    if (parcel.senderId === params.travellerId) {
      throw AppErrors.forbidden('Sender cannot be traveller', 'নিজের পার্সেল নিজে বহন করার বুকিং গ্রহণযোগ্য নয়।');
    }

    // Check duplicate active booking for this parcel
    for (const b of this.bookings.values()) {
      if (b.parcelId === parcel.id && !['CANCELLED', 'DISPUTED'].includes(b.status)) {
        throw AppErrors.bookingConflict('Parcel already has an active booking', 'এই পার্সেলটির জন্য ইতিমধ্যে সক্রিয় বুকিং রয়েছে।');
      }
    }

    // Capacity Constraint: remaining >= weight
    if (trip.remainingCapacityKg < parcel.weightKg) {
      throw AppErrors.capacityExceeded(parcel.weightKg, trip.remainingCapacityKg);
    }

    // --- ATOMIC EXECUTION ---
    const previousTripCapacity = trip.remainingCapacityKg;
    const previousParcelStatus = parcel.status;

    try {
      // 1. Decrement capacity
      trip.remainingCapacityKg = Math.round((trip.remainingCapacityKg - parcel.weightKg) * 100) / 100;
      trip.updatedAt = new Date().toISOString();

      // 2. Mark parcel booked
      parcel.status = 'BOOKED';
      parcel.updatedAt = trip.updatedAt;

      // 3. Create booking
      const bookingId = `bhk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const travellerFee = 150.0;
      const platformFee = 20.0;
      const trustGuarantee = 10.0;
      const totalAmount = travellerFee + platformFee + trustGuarantee;

      const booking: DbBooking = {
        id: bookingId,
        parcelId: parcel.id,
        tripId: trip.id,
        senderId: parcel.senderId,
        travellerId: params.travellerId,
        status: 'ACCEPTED',
        travellerFee,
        platformFee,
        trustGuarantee,
        totalAmount,
        createdAt: trip.updatedAt,
        confirmedAt: trip.updatedAt,
      };
      this.bookings.set(bookingId, booking);

      // 4. Create Handover record
      this.handovers.set(bookingId, {
        id: `hnd-${Date.now()}`,
        bookingId,
        packageInspected: false,
        noProhibitedItems: false,
        recipientPhoneConfirmed: false,
        weightWithinLimit: false,
        status: 'PENDING',
      });

      // 5. Create Payment record
      this.payments.set(bookingId, {
        id: `pay-${Date.now()}`,
        bookingId,
        amount: totalAmount,
        method: 'demo_escrow',
        status: 'UNPAID',
        createdAt: trip.updatedAt,
      });

      return { booking, trip, parcel };
    } catch (err) {
      // Rollback on any failure
      trip.remainingCapacityKg = previousTripCapacity;
      parcel.status = previousParcelStatus;
      throw err;
    }
  }

  // ----------------------------------------------------------------------------
  // ATOMIC CANCELLATION TRANSACTION (Restores Capacity)
  // ----------------------------------------------------------------------------

  public atomicCancelBooking(bookingId: string, actorUserId: string, reasonBn: string): DbBooking {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw AppErrors.notFound('Booking', 'বুকিং পাওয়া যায়নি।');
    }

    // Only sender, traveller or admin can cancel
    if (booking.senderId !== actorUserId && booking.travellerId !== actorUserId) {
      throw AppErrors.forbidden('Not authorized to cancel', 'আপনার এই বুকিংটি বাতিল করার অনুমতি নেই।');
    }

    // Strictly blocked if already handed over or in transit
    const nonCancellable = ['HANDED_OVER', 'IN_TRANSIT', 'ARRIVED_DESTINATION', 'DELIVERY_PENDING', 'DELIVERED', 'CANCELLED'];
    if (nonCancellable.includes(booking.status)) {
      throw AppErrors.invalidState(
        booking.status,
        'CANCELLED',
        'পার্সেল সহযাত্রীর জিম্মায় হস্তান্তরের পর সরাসরি বাতিল করা অসম্ভব। বিরোধ (Dispute) ফাইল করুন।'
      );
    }

    // Restore trip capacity
    const trip = this.trips.get(booking.tripId);
    const parcel = this.parcels.get(booking.parcelId);
    if (trip && parcel) {
      trip.remainingCapacityKg = Math.min(
        trip.totalCapacityKg,
        Math.round((trip.remainingCapacityKg + parcel.weightKg) * 100) / 100
      );
      trip.updatedAt = new Date().toISOString();
      parcel.status = 'SEARCHING';
      parcel.updatedAt = trip.updatedAt;
    }

    // Refund escrow if held
    const payment = this.payments.get(bookingId);
    if (payment && payment.status === 'HELD') {
      payment.status = 'REFUNDED';
      payment.refundedAt = new Date().toISOString();
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reasonBn;
    booking.cancelledAt = new Date().toISOString();

    return booking;
  }

  // ----------------------------------------------------------------------------
  // SEED DEFAULT DEMO DATA
  // ----------------------------------------------------------------------------

  private seedDefaultData(): void {
    const now = new Date().toISOString();

    // 1. Imam (Sender)
    const imamId = '11111111-1111-1111-1111-111111111111';
    this.users.set(imamId, {
      id: imamId,
      phone: '+8801711002233',
      createdAt: now,
      updatedAt: now,
    });
    this.userProfiles.set(imamId, {
      userId: imamId,
      name: 'ইমাম হাসান (Demo Sender)',
      avatarInitials: 'ইহ',
      verificationStatus: 'PHONE_VERIFIED',
      isPhoneVerified: true,
      isIdentityVerified: false,
      updatedAt: now,
    });
    this.userRoles.set(imamId, [{ id: 'rol-1', userId: imamId, role: 'SENDER', createdAt: now }]);
    this.senderProfiles.set(imamId, {
      userId: imamId,
      totalParcelsSent: 5,
      ratingAvg: 5.0,
      updatedAt: now,
    });

    // 2. Rahim (Traveller)
    const rahimId = '22222222-2222-2222-2222-222222222222';
    this.users.set(rahimId, {
      id: rahimId,
      phone: '+8801819556677',
      createdAt: now,
      updatedAt: now,
    });
    this.userProfiles.set(rahimId, {
      userId: rahimId,
      name: 'মোঃ আব্দুর রহিম (Demo Traveller)',
      avatarInitials: 'আর',
      verificationStatus: 'TRUSTED_TRAVELLER',
      isPhoneVerified: true,
      isIdentityVerified: false,
      updatedAt: now,
    });
    this.userRoles.set(rahimId, [{ id: 'rol-2', userId: rahimId, role: 'TRAVELLER', createdAt: now }]);
    this.travellerProfiles.set(rahimId, {
      userId: rahimId,
      totalTripsCompleted: 14,
      ratingAvg: 4.9,
      preferredVehicleMode: 'গ্রিন লাইন এসি বাস',
      isVerifiedTraveller: true,
      updatedAt: now,
    });

    // 3. Demo Trip: Dhaka -> Cumilla
    const tripId = '33333333-3333-3333-3333-333333333333';
    this.trips.set(tripId, {
      id: tripId,
      travellerId: rahimId,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ বাস টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা / পদুয়ার বাজার',
      departureAt: new Date(Date.now() + 2 * 3600000).toISOString(),
      estimatedArrivalAt: new Date(Date.now() + 5 * 3600000).toISOString(),
      travelMode: 'bus',
      vehicleModeBn: 'গ্রিন লাইন এসি বাস',
      totalCapacityKg: 5.0,
      remainingCapacityKg: 4.2,
      pickupPreference: 'near_me',
      pickupPreferenceBn: 'সায়েদাবাদ বাস কাউন্টার সংলগ্ন',
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    });

    // 4. Demo Parcel
    const parcelId = '44444444-4444-4444-4444-444444444444';
    this.parcels.set(parcelId, {
      id: parcelId,
      senderId: imamId,
      originCity: 'ঢাকা',
      originArea: 'সায়েদাবাদ বাস টার্মিনাল',
      destinationCity: 'কুমিল্লা',
      destinationArea: 'শাসনগাছা / পদুয়ার বাজার',
      category: 'documents',
      categoryBn: 'জরুরি আইনি ডকুমেন্টস ও সার্টিফিকেট',
      weightKg: 0.8,
      packageSize: 'small',
      packageSizeBn: 'ছোট প্যাকেট',
      description: 'কোর্ট ও জমির দলিলপত্রাদি',
      urgency: 'today',
      urgencyBn: 'আজকে ডেলিভারি',
      recipientName: 'তানজিলা হক',
      recipientPhone: '+8801912334455',
      status: 'BOOKED',
      createdAt: now,
      updatedAt: now,
    });

    // 5. Demo Booking: BHK-89241
    const bookingId = '55555555-5555-5555-5555-555555555555';
    this.bookings.set(bookingId, {
      id: bookingId,
      parcelId,
      tripId,
      senderId: imamId,
      travellerId: rahimId,
      status: 'PAYMENT_HELD',
      travellerFee: 150.0,
      platformFee: 20.0,
      trustGuarantee: 10.0,
      totalAmount: 180.0,
      createdAt: now,
      confirmedAt: now,
    });

    this.payments.set(bookingId, {
      id: '66666666-6666-6666-6666-666666666666',
      bookingId,
      amount: 180.0,
      method: 'bkash',
      status: 'HELD',
      heldAt: now,
      createdAt: now,
    });

    this.handovers.set(bookingId, {
      id: '77777777-7777-7777-7777-777777777777',
      bookingId,
      packageInspected: false,
      noProhibitedItems: false,
      recipientPhoneConfirmed: false,
      weightWithinLimit: false,
      status: 'PENDING',
    });
  }
}

export const serverDb = new MemoryDatabase();
