// BOHOK Phase 5.5 — Reusable Marketplace Selectors
// Clean query layer for components, views, and dashboards

import { MarketplaceStore } from './marketplaceStore';
import { Trip, Parcel, Booking, Match } from './marketplaceTypes';

// ==========================================
// 1. TRIP & ROUTE SELECTORS
// ==========================================

export function getActiveTrips(store: MarketplaceStore): Trip[] {
  return store
    .getAllTrips()
    .filter(
      (t) =>
        t.status === 'PUBLISHED' ||
        t.status === 'MATCHING' ||
        t.status === 'ACTIVE'
    );
}

export function getAvailableTrips(store: MarketplaceStore, minCapacityKg = 0): Trip[] {
  return getActiveTrips(store).filter(
    (t) => t.remainingCapacityKg >= minCapacityKg
  );
}

export function getTripsForCorridor(
  store: MarketplaceStore,
  originHubId: string,
  destinationHubId: string
): Trip[] {
  return getActiveTrips(store).filter(
    (t) =>
      t.origin.hubId === originHubId &&
      t.destination.hubId === destinationHubId &&
      t.remainingCapacityKg > 0
  );
}

// ==========================================
// 2. MATCH & BOOKING SELECTORS
// ==========================================

export function getParcelMatches(store: MarketplaceStore, parcelId: string): Match[] {
  // Return all matches associated with the parcel
  return Array.from(store['matches'].values()).filter(
    (m: Match) => m.parcelId === parcelId
  );
}

export function getPendingRequests(
  store: MarketplaceStore,
  travellerId?: string
): Booking[] {
  return store
    .getAllBookings()
    .filter(
      (b) =>
        b.status === 'PENDING_TRAVELLER' &&
        (!travellerId || b.travellerId === travellerId)
    );
}

export function getConfirmedBookings(
  store: MarketplaceStore,
  userId?: string
): Booking[] {
  return store
    .getAllBookings()
    .filter(
      (b) =>
        (b.status === 'CONFIRMED' || b.status === 'PICKUP_PENDING') &&
        (!userId || b.senderId === userId || b.travellerId === userId)
    );
}

export function getActiveBookings(
  store: MarketplaceStore,
  userId?: string
): Booking[] {
  return store
    .getAllBookings()
    .filter(
      (b) =>
        (b.status === 'IN_TRANSIT' || b.status === 'DELIVERY_PENDING') &&
        (!userId || b.senderId === userId || b.travellerId === userId)
    );
}

export function getCompletedBookings(
  store: MarketplaceStore,
  userId?: string
): Booking[] {
  return store
    .getAllBookings()
    .filter(
      (b) =>
        b.status === 'DELIVERED' &&
        (!userId || b.senderId === userId || b.travellerId === userId)
    );
}

// ==========================================
// 3. DASHBOARD SELECTORS
// ==========================================

export interface SenderDashboardData {
  allParcels: Parcel[];
  inTransitBookings: Booking[];
  completedBookings: Booking[];
  cancelledBookings: Booking[];
  totalSpent: number;
}

export function getSenderDashboardView(
  store: MarketplaceStore,
  senderId: string
): SenderDashboardData {
  const parcels = store
    .getAllParcels()
    .filter((p) => p.senderId === senderId);

  const bookings = store
    .getAllBookings()
    .filter((b) => b.senderId === senderId);

  const inTransit = bookings.filter(
    (b) => b.status === 'IN_TRANSIT' || b.status === 'DELIVERY_PENDING' || b.status === 'PICKUP_PENDING'
  );
  const completed = bookings.filter((b) => b.status === 'DELIVERED');
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

  const totalSpent = completed.reduce((sum, b) => sum + b.price, 0);

  return {
    allParcels: parcels,
    inTransitBookings: inTransit,
    completedBookings: completed,
    cancelledBookings: cancelled,
    totalSpent,
  };
}

export interface TravellerDashboardData {
  myTrips: Trip[];
  pendingRequests: Booking[];
  activeBookings: Booking[];
  completedBookings: Booking[];
  totalEarnings: number;
  totalParcelsCarried: number;
}

export function getTravellerDashboardView(
  store: MarketplaceStore,
  travellerId: string
): TravellerDashboardData {
  const trips = store
    .getAllTrips()
    .filter((t) => t.travellerId === travellerId);

  const bookings = store
    .getAllBookings()
    .filter((b) => b.travellerId === travellerId);

  const pending = bookings.filter((b) => b.status === 'PENDING_TRAVELLER');
  const active = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'PICKUP_PENDING' || b.status === 'IN_TRANSIT' || b.status === 'DELIVERY_PENDING'
  );
  const completed = bookings.filter((b) => b.status === 'DELIVERED');

  const totalEarnings = completed.reduce((sum, b) => sum + b.price, 0);

  return {
    myTrips: trips,
    pendingRequests: pending,
    activeBookings: active,
    completedBookings: completed,
    totalEarnings,
    totalParcelsCarried: completed.length,
  };
}
