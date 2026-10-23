// BOHOK Phase 5.5 — Marketplace Architecture Unit Tests
// Tests all 12 core areas: state machines, capacity rules, cancellation, multi-parcel trips, and privacy

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MarketplaceStore } from '../marketplaceStore';
import { seedMarketplaceDemo, DEMO_SENDER_IMAM, DEMO_TRAVELLER_RAHIM } from '../marketplaceDemoData';
import {
  validateParcelTransition,
  validateTripTransition,
  validateBookingTransition,
} from '../marketplaceTransitions';
import {
  getActiveTrips,
  getAvailableTrips,
  getPendingRequests,
  getConfirmedBookings,
  getCompletedBookings,
  getTravellerDashboardView,
  getSenderDashboardView,
} from '../marketplaceSelectors';

describe('BOHOK Phase 5.5 Marketplace State Architecture', () => {
  let store: MarketplaceStore;

  beforeEach(() => {
    store = new MarketplaceStore();
  });

  // ----------------------------------------------------
  // TEST 1: Parcel Lifecycle Transitions
  // ----------------------------------------------------
  it('1. Parcel lifecycle transitions step-by-step to DELIVERED', () => {
    const parcel = store.createParcel({
      senderId: 'user-sender-1',
      origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'ধানমন্ডি' },
      destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'কান্দিরপাড়' },
      category: 'documents',
      categoryBn: 'ডকুমেন্টস',
      weightKg: 0.5,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'অফিস ফাইল',
      urgency: 'today',
      urgencyBn: 'আজই',
      requiredDeliveryAt: '2026-10-23T18:00:00Z',
      pickupDetails: { areaNameBn: 'ধানমন্ডি', landmarkBn: '২৭ নম্বর রোড', contactPhone: '01700000000' },
      initialStatus: 'DRAFT',
    });

    assert.strictEqual(parcel.status, 'DRAFT');
    store.updateParcelStatus(parcel.id, 'SEARCHING');
    assert.strictEqual(parcel.status, 'SEARCHING');
    store.updateParcelStatus(parcel.id, 'MATCHED');
    assert.strictEqual(parcel.status, 'MATCHED');
    store.updateParcelStatus(parcel.id, 'BOOKED');
    assert.strictEqual(parcel.status, 'BOOKED');
    store.updateParcelStatus(parcel.id, 'READY_FOR_PICKUP');
    assert.strictEqual(parcel.status, 'READY_FOR_PICKUP');
    store.updateParcelStatus(parcel.id, 'IN_TRANSIT');
    assert.strictEqual(parcel.status, 'IN_TRANSIT');
    store.updateParcelStatus(parcel.id, 'DELIVERED');
    assert.strictEqual(parcel.status, 'DELIVERED');
  });

  // ----------------------------------------------------
  // TEST 2: Trip Lifecycle Transitions
  // ----------------------------------------------------
  it('2. Trip lifecycle transitions from DRAFT to COMPLETED', () => {
    const trip = store.createTrip({
      travellerId: 'trv-1',
      origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'যাত্রাবাড়ী' },
      destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'শাসনগাছা' },
      waypoints: [],
      departureAt: '2026-10-23T15:00:00Z',
      departureTimeBn: 'বিকাল ০৩:০০',
      estimatedArrivalAt: '2026-10-23T17:30:00Z',
      estimatedArrivalTimeBn: 'বিকাল ০৫:৩০',
      travelMode: 'car',
      travelModeBn: 'প্রাইভেট কার',
      availableCapacityKg: 4.0,
      pickupPreference: 'along_route',
      pickupPreferenceBn: 'যাত্রাপথে',
      initialStatus: 'DRAFT',
    });

    assert.strictEqual(trip.status, 'DRAFT');
    assert.strictEqual(trip.remainingCapacityKg, 4.0);

    store.updateTripStatus(trip.id, 'PUBLISHED');
    assert.strictEqual(trip.status, 'PUBLISHED');

    store.updateTripStatus(trip.id, 'MATCHING');
    assert.strictEqual(trip.status, 'MATCHING');

    store.updateTripStatus(trip.id, 'ACTIVE');
    assert.strictEqual(trip.status, 'ACTIVE');

    store.updateTripStatus(trip.id, 'COMPLETED');
    assert.strictEqual(trip.status, 'COMPLETED');
  });

  // ----------------------------------------------------
  // TEST 3: Match Lifecycle Transitions
  // ----------------------------------------------------
  it('3. Match lifecycle transitions from CANDIDATE to REQUESTED to ACCEPTED', () => {
    const match = store.createMatch({
      parcelId: 'pcl-1',
      tripId: 'trip-1',
      score: 95,
      routeScore: 35,
      timeScore: 20,
      distanceScore: 15,
      capacityScore: 15,
      reliabilityScore: 8,
      speedScore: 2,
      compatibilityLevel: 'PERFECT',
      reasons: ['সরাসরি রুট', 'পর্যাপ্ত স্পেস'],
    });

    assert.strictEqual(match.status, 'CANDIDATE');
    match.status = 'REQUESTED';
    assert.strictEqual(match.status, 'REQUESTED');
    match.status = 'ACCEPTED';
    assert.strictEqual(match.status, 'ACCEPTED');
  });

  // ----------------------------------------------------
  // TEST 4: Booking Lifecycle Transitions
  // ----------------------------------------------------
  it('4. Booking lifecycle transitions through all standard stages', () => {
    const demo = seedMarketplaceDemo(store);
    const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250, demo.match.id);

    assert.strictEqual(booking.status, 'PENDING_TRAVELLER');
    store.acceptBooking(booking.id);
    assert.strictEqual(booking.status, 'CONFIRMED');

    const handover = store.getHandover(booking.id);
    assert.ok(handover !== undefined);
    assert.strictEqual(handover.status, 'PICKUP_PENDING');

    store.verifyPickup(booking.id, handover.pickupOtp);
    assert.strictEqual(booking.status, 'IN_TRANSIT');

    store.verifyDelivery(booking.id, handover.deliveryOtp);
    assert.strictEqual(booking.status, 'DELIVERED');
  });

  // ----------------------------------------------------
  // TEST 5: Invalid Transitions Rejection
  // ----------------------------------------------------
  it('5. Invalid transitions are strictly rejected by transition validators', () => {
    // Cannot jump from DRAFT straight to DELIVERED
    const parcelVal = validateParcelTransition('DRAFT', 'DELIVERED');
    assert.strictEqual(parcelVal.valid, false);
    assert.ok(parcelVal.errorMessage?.includes('Invalid Parcel transition'));

    // Cannot transition from COMPLETED to ACTIVE
    const tripVal = validateTripTransition('COMPLETED', 'ACTIVE');
    assert.strictEqual(tripVal.valid, false);

    // Cannot jump from PENDING_TRAVELLER straight to IN_TRANSIT without confirmation
    const bookingVal = validateBookingTransition('PENDING_TRAVELLER', 'IN_TRANSIT');
    assert.strictEqual(bookingVal.valid, false);
  });

  // ----------------------------------------------------
  // TEST 6: Capacity Reduction on Booking Confirmation
  // ----------------------------------------------------
  it('6. Capacity reduces accurately when traveller accepts booking', () => {
    const demo = seedMarketplaceDemo(store);
    assert.strictEqual(demo.trip.remainingCapacityKg, 2.0);

    const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250);
    // Before acceptance, remaining capacity is untouched
    assert.strictEqual(demo.trip.remainingCapacityKg, 2.0);

    // Acceptance locks capacity
    store.acceptBooking(booking.id);
    // 2.0 kg - 0.5 kg = 1.5 kg
    assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);
  });

  // ----------------------------------------------------
  // TEST 7: Capacity Overflow Rejection
  // ----------------------------------------------------
  it('7. Rejects booking requests when parcel weight exceeds remaining capacity', () => {
    const demo = seedMarketplaceDemo(store); // Trip has 2.0 kg
    const heavyParcel = store.createParcel({
      senderId: 'user-heavy',
      origin: demo.trip.origin,
      destination: demo.trip.destination,
      category: 'other_permitted',
      categoryBn: 'ভারী পণ্য',
      weightKg: 3.5, // 3.5 kg > 2.0 kg remaining!
      packageSize: 'large',
      packageSizeBn: 'বড়',
      description: 'ইলেকট্রনিক্স কার্টন',
      urgency: 'today',
      urgencyBn: 'আজই',
      requiredDeliveryAt: '2026-10-23T20:00:00Z',
      pickupDetails: { areaNameBn: 'মতিঝিল', landmarkBn: 'শাপলা চত্বর', contactPhone: '01711' },
      initialStatus: 'SEARCHING',
    });

    assert.throws(
      () => {
        store.requestBooking(heavyParcel.id, demo.trip.id, 500);
      },
      /Capacity overflow/
    );
  });

  // ----------------------------------------------------
  // TEST 8: Cancellation & Capacity Restoration
  // ----------------------------------------------------
  it('8. Cancellation restores trip capacity and updates status with reasons', () => {
    const demo = seedMarketplaceDemo(store);
    const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250);
    store.acceptBooking(booking.id);

    assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);

    // Cancel booking by sender
    store.cancelBooking(booking.id, 'changed_mind', 'sender');

    assert.strictEqual(booking.status, 'CANCELLED');
    assert.strictEqual(booking.cancellationReason, 'changed_mind');
    // Capacity restored back to 2.0 kg!
    assert.strictEqual(demo.trip.remainingCapacityKg, 2.0);

    const payment = store.getPayment(booking.id);
    assert.strictEqual(payment?.status, 'REFUNDED');
  });

  // ----------------------------------------------------
  // TEST 9: Multiple Parcels on One Trip
  // ----------------------------------------------------
  it('9. Supports multiple parcels on a single trip as long as capacity permits', () => {
    const demo = seedMarketplaceDemo(store); // 2.0 kg available

    // Parcel 1: 0.5 kg
    const booking1 = store.requestBooking(demo.parcel.id, demo.trip.id, 200);
    store.acceptBooking(booking1.id);
    assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);

    // Parcel 2: 0.8 kg
    const parcel2 = store.createParcel({
      senderId: 'user-sender-2',
      origin: demo.trip.origin,
      destination: demo.trip.destination,
      category: 'books',
      categoryBn: 'বই',
      weightKg: 0.8,
      packageSize: 'medium',
      packageSizeBn: 'মাঝারি',
      description: '২টি পাঠ্যবই',
      urgency: 'today',
      urgencyBn: 'আজই',
      requiredDeliveryAt: '2026-10-23T20:00:00Z',
      pickupDetails: { areaNameBn: 'সায়েদাবাদ', landmarkBn: 'কাউন্টার সংলগ্ন', contactPhone: '01822' },
      initialStatus: 'SEARCHING',
    });

    const booking2 = store.requestBooking(parcel2.id, demo.trip.id, 280);
    store.acceptBooking(booking2.id);

    // Remaining capacity: 1.5 - 0.8 = 0.7 kg
    assert.strictEqual(demo.trip.remainingCapacityKg, 0.7);

    // Parcel 3: 1.0 kg (fails because 1.0 > 0.7 kg)
    const parcel3 = store.createParcel({
      senderId: 'user-sender-3',
      origin: demo.trip.origin,
      destination: demo.trip.destination,
      category: 'clothes',
      categoryBn: 'পোশাক',
      weightKg: 1.0,
      packageSize: 'medium',
      packageSizeBn: 'মাঝারি',
      description: 'পোশাক',
      urgency: 'today',
      urgencyBn: 'আজই',
      requiredDeliveryAt: '2026-10-23T20:00:00Z',
      pickupDetails: { areaNameBn: 'মতিঝিল', landmarkBn: 'গেট', contactPhone: '01933' },
    });

    assert.throws(() => {
      store.requestBooking(parcel3.id, demo.trip.id, 300);
    }, /Capacity overflow/);
  });

  // ----------------------------------------------------
  // TEST 10: Sender / Traveller Relationship Integrity
  // ----------------------------------------------------
  it('10. Booking maintains strict relationship integrity between Sender and Traveller', () => {
    const demo = seedMarketplaceDemo(store);
    const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250);

    assert.strictEqual(booking.senderId, DEMO_SENDER_IMAM.id);
    assert.strictEqual(booking.travellerId, DEMO_TRAVELLER_RAHIM.id);
    assert.strictEqual(booking.parcelId, demo.parcel.id);
    assert.strictEqual(booking.tripId, demo.trip.id);
  });

  // ----------------------------------------------------
  // TEST 11: Public vs Private Traveller Data Masking
  // ----------------------------------------------------
  it('11. Enforces privacy by hiding sensitive details from public view', () => {
    const demo = seedMarketplaceDemo(store);
    const publicProfile = store.getPublicTravellerProfile(demo.traveller.id, demo.trip.id);

    assert.ok(publicProfile !== undefined);
    assert.strictEqual(publicProfile.name, 'রহিম উল্লাহ');
    assert.strictEqual(publicProfile.rating, 4.9);
    assert.strictEqual(publicProfile.totalTripsCompleted, 38);

    // Sensitive properties must NOT exist on public profile
    assert.strictEqual((publicProfile as any).phone, undefined);
    assert.strictEqual((publicProfile as any).exactGpsCoordinates, undefined);
    assert.strictEqual((publicProfile as any).exactAddress, undefined);
    assert.strictEqual((publicProfile as any).nidDocumentMasked, undefined);
  });

  // ----------------------------------------------------
  // TEST 12: Complete End-to-End Demo Lifecycle
  // ----------------------------------------------------
  it('12. Complete end-to-end lifecycle executes seamlessly from trip creation to completion', () => {
    // 1. Create Trip & Publish
    const demo = seedMarketplaceDemo(store);
    assert.strictEqual(demo.trip.status, 'PUBLISHED');

    // 2. Sender requests booking
    const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 240, demo.match.id);
    assert.strictEqual(booking.status, 'PENDING_TRAVELLER');
    assert.strictEqual(getPendingRequests(store, demo.traveller.id).length, 1);

    // 3. Traveller accepts booking
    store.acceptBooking(booking.id);
    assert.strictEqual(booking.status, 'CONFIRMED');
    assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);

    const payment = store.getPayment(booking.id);
    assert.strictEqual(payment?.status, 'HELD');

    // 4. Pickup Handover with OTP
    const handover = store.getHandover(booking.id);
    assert.ok(handover !== undefined);
    store.verifyPickup(booking.id, handover.pickupOtp);

    assert.strictEqual(booking.status, 'IN_TRANSIT');
    assert.strictEqual(demo.parcel.status, 'IN_TRANSIT');

    // 5. Delivery Handover with OTP
    store.verifyDelivery(booking.id, handover.deliveryOtp);

    assert.strictEqual(booking.status, 'DELIVERED');
    assert.strictEqual(demo.parcel.status, 'DELIVERED');
    assert.strictEqual(payment?.status, 'RELEASED');
    assert.ok(payment?.releasedAt !== undefined);

    // 6. Rating
    const rating = store.addRating(booking.id, demo.sender.id, demo.traveller.id, 5, 'অত্যন্ত দ্রুত ও যত্নশীল!');
    assert.strictEqual(rating.score, 5);

    // 7. Dashboard Selectors Verification
    const travellerDash = getTravellerDashboardView(store, demo.traveller.id);
    assert.strictEqual(travellerDash.completedBookings.length, 1);
    assert.strictEqual(travellerDash.totalEarnings, 240);

    const senderDash = getSenderDashboardView(store, demo.sender.id);
    assert.strictEqual(senderDash.completedBookings.length, 1);
    assert.strictEqual(senderDash.totalSpent, 240);
  });
});
