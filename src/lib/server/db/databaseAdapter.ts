// BOHOK Phase 9 — Unified Database Repository Interface
// Provides abstraction over PostgreSQL / Supabase live database and in-memory development fallback

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

export interface DatabaseHealthStatus {
  connected: boolean;
  engine: 'POSTGRESQL_SUPABASE' | 'MEMORY_FALLBACK';
  statusText: string;
  statusTextBn: string;
  isProductionReady: boolean;
  connectionUrlMasked?: string;
}

export interface IDatabaseRepository {
  checkHealth(): Promise<DatabaseHealthStatus>;
  reset(): void;

  // Users & Profiles
  users: Map<string, DbUser>;
  userProfiles: Map<string, DbUserProfile>;
  userRoles: Map<string, DbUserRole[]>;
  travellerProfiles: Map<string, DbTravellerProfile>;
  senderProfiles: Map<string, DbSenderProfile>;
  insertUser(phone: string, name: string, role: 'SENDER' | 'TRAVELLER' | 'BOTH'): DbUser;
  getUserByPhone(phone: string): DbUser | null;

  // Trips
  trips: Map<string, DbTrip>;
  tripWaypoints: Map<string, DbTripWaypoint[]>;
  insertTrip(trip: Omit<DbTrip, 'id' | 'createdAt' | 'updatedAt' | 'remainingCapacityKg'>): DbTrip;

  // Parcels
  parcels: Map<string, DbParcel>;
  parcelItems: Map<string, DbParcelItem[]>;
  insertParcel(
    parcel: Omit<DbParcel, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'urgency' | 'urgencyBn'> & {
      urgency?: 'today' | 'tomorrow' | 'custom_time';
      urgencyBn?: string;
    }
  ): DbParcel;

  // Bookings & Transactions
  matches: Map<string, DbMatch>;
  bookings: Map<string, DbBooking>;
  handovers: Map<string, DbHandover>;
  otpChallenges: Map<string, DbOtpChallenge>;
  atomicAcceptBooking(params: {
    parcelId: string;
    tripId: string;
    travellerId: string;
  }): { booking: DbBooking; trip: DbTrip; parcel: DbParcel };

  // Payments & Escrow
  payments: Map<string, DbPayment>;
  paymentEvents: Map<string, DbPaymentEvent[]>;

  // Ratings & Disputes
  ratings: Map<string, DbRating>;
  disputes: Map<string, DbDispute>;

  // Notifications & Audit Logs
  notifications: Map<string, DbNotification>;
  auditLogs: DbAuditLog[];
}
