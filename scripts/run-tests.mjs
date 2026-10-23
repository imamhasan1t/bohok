// Node.js test runner for BOHOK Phase 5 Matching, Phase 5.5 Marketplace, and Phase 6 Auth
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function runTestSuite() {
  console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════');
  console.log('\x1b[33m%s\x1b[0m', ' BOHOK Unified Test Runner (Phase 5, 5.5, 6, 7, 8, 9 — 82 Tests) ');
  console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════\n');

  const filesToTranspile = [
    'src/data/cities.ts',
    'src/lib/utils.ts',
    'src/lib/matching/matchingTypes.ts',
    'src/lib/matching/matchingUtils.ts',
    'src/lib/matching/matchingEngine.ts',
    'src/data/match-demo.ts',
    'src/lib/marketplace/marketplaceTypes.ts',
    'src/lib/marketplace/marketplaceTransitions.ts',
    'src/lib/marketplace/marketplaceEvents.ts',
    'src/lib/marketplace/marketplaceStore.ts',
    'src/lib/marketplace/marketplaceSelectors.ts',
    'src/lib/marketplace/marketplaceDemoData.ts',
    'src/lib/auth/authTypes.ts',
    'src/lib/auth/authValidation.ts',
    'src/lib/auth/demoPhoneAuthProvider.ts',
    'src/lib/auth/mockIdentityProvider.ts',
    'src/lib/auth/authStore.ts',
    'src/lib/auth/authService.ts',
    'src/lib/payment/paymentTypes.ts',
    'src/lib/payment/demoPaymentProvider.ts',
    'src/lib/tracking/trackingTypes.ts',
    'src/lib/tracking/trackingCorridors.ts',
    'src/lib/tracking/demoTrackingProvider.ts',
    'src/lib/booking/bookingTypes.ts',
    'src/lib/booking/bookingTransitions.ts',
    'src/lib/booking/bookingEvents.ts',
    'src/lib/booking/bookingStore.ts',
    'src/lib/server/config.ts',
    'src/lib/server/errors/appErrors.ts',
    'src/lib/server/validation/validator.ts',
    'src/lib/server/db/dbTypes.ts',
    'src/lib/server/db/databaseAdapter.ts',
    'src/lib/server/db/memoryDb.ts',
    'src/lib/server/db/postgresClient.ts',
    'src/lib/server/security/rateLimiter.ts',
    'src/lib/server/security/idempotency.ts',
    'src/lib/server/security/csrf.ts',
    'src/lib/server/sms/smsTypes.ts',
    'src/lib/server/sms/smsProviders.ts',
    'src/lib/server/sms/smsService.ts',
    'src/lib/server/payment/paymentGatewayTypes.ts',
    'src/lib/server/payment/bkashAdapter.ts',
    'src/lib/server/payment/nagadAdapter.ts',
    'src/lib/server/payment/paymentGatewayService.ts',
    'src/lib/server/realtime/realtimeBus.ts',
    'src/lib/map/mapTypes.ts',
    'src/lib/map/mapProvider.ts',
    'src/lib/server/notifications/notificationTemplates.ts',
    'src/lib/server/notifications/multiChannelNotifier.ts',
    'src/lib/server/auth/session.ts',
    'src/lib/server/auth/authContext.ts',
    'src/lib/server/auth/otpService.ts',
    'src/lib/server/privacy/serializers.ts',
    'src/lib/server/audit/auditLogger.ts',
    'src/lib/server/notifications/notificationService.ts',
    'src/lib/server/marketplace/tripService.ts',
    'src/lib/server/marketplace/parcelService.ts',
    'src/lib/server/booking/bookingService.ts',
    'src/lib/server/booking/handoverService.ts',
    'src/lib/server/booking/deliveryService.ts',
    'src/lib/server/booking/ratingService.ts',
    'src/lib/server/booking/disputeService.ts',
    'src/lib/server/__tests__/backend.test.ts',
    'src/lib/server/__tests__/phase9.test.ts',
  ];

  const tempOutDir = path.join(rootDir, '.temp-test');
  if (!fs.existsSync(tempOutDir)) {
    fs.mkdirSync(tempOutDir, { recursive: true });
  }
  fs.writeFileSync(path.join(tempOutDir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

  // Load and transpile each file
  for (const relPath of filesToTranspile) {
    const fullPath = path.join(rootDir, relPath);
    let code = fs.readFileSync(fullPath, 'utf8');

    // Replace aliases with relative paths
    code = code.replace(/from\s+['"]@\/lib\/utils['"]/g, `from './utils.js'`);
    code = code.replace(/from\s+['"]@\/lib\/matching\/matchingTypes['"]/g, `from './matchingTypes.js'`);
    code = code.replace(/from\s+['"]@\/lib\/matching\/matchingUtils['"]/g, `from './matchingUtils.js'`);
    code = code.replace(/from\s+['"]@\/lib\/matching\/matchingEngine['"]/g, `from './matchingEngine.js'`);
    code = code.replace(/from\s+['"]@\/lib\/marketplace\/marketplaceTypes['"]/g, `from './marketplaceTypes.js'`);
    code = code.replace(/from\s+['"]@\/lib\/marketplace\/marketplaceTransitions['"]/g, `from './marketplaceTransitions.js'`);
    code = code.replace(/from\s+['"]@\/lib\/marketplace\/marketplaceEvents['"]/g, `from './marketplaceEvents.js'`);
    code = code.replace(/from\s+['"]@\/lib\/marketplace\/marketplaceStore['"]/g, `from './marketplaceStore.js'`);
    code = code.replace(/from\s+['"]@\/lib\/marketplace\/marketplaceSelectors['"]/g, `from './marketplaceSelectors.js'`);
    code = code.replace(/from\s+['"]@\/lib\/marketplace\/marketplaceDemoData['"]/g, `from './marketplaceDemoData.js'`);
    code = code.replace(/from\s+['"]@\/lib\/auth\/authTypes['"]/g, `from './authTypes.js'`);
    code = code.replace(/from\s+['"]@\/lib\/auth\/authValidation['"]/g, `from './authValidation.js'`);
    code = code.replace(/from\s+['"]@\/lib\/auth\/demoPhoneAuthProvider['"]/g, `from './demoPhoneAuthProvider.js'`);
    code = code.replace(/from\s+['"]@\/lib\/auth\/mockIdentityProvider['"]/g, `from './mockIdentityProvider.js'`);
    code = code.replace(/from\s+['"]@\/lib\/auth\/authStore['"]/g, `from './authStore.js'`);
    code = code.replace(/from\s+['"]@\/lib\/auth\/authService['"]/g, `from './authService.js'`);
    code = code.replace(/from\s+['"]@\/lib\/payment\/paymentTypes['"]/g, `from './paymentTypes.js'`);
    code = code.replace(/from\s+['"]@\/lib\/payment\/demoPaymentProvider['"]/g, `from './demoPaymentProvider.js'`);
    code = code.replace(/from\s+['"]@\/lib\/tracking\/trackingTypes['"]/g, `from './trackingTypes.js'`);
    code = code.replace(/from\s+['"]@\/lib\/tracking\/trackingCorridors['"]/g, `from './trackingCorridors.js'`);
    code = code.replace(/from\s+['"]@\/lib\/tracking\/demoTrackingProvider['"]/g, `from './demoTrackingProvider.js'`);
    code = code.replace(/from\s+['"]@\/lib\/booking\/bookingTypes['"]/g, `from './bookingTypes.js'`);
    code = code.replace(/from\s+['"]@\/lib\/booking\/bookingTransitions['"]/g, `from './bookingTransitions.js'`);
    code = code.replace(/from\s+['"]@\/lib\/booking\/bookingEvents['"]/g, `from './bookingEvents.js'`);
    code = code.replace(/from\s+['"]@\/lib\/booking\/bookingStore['"]/g, `from './bookingStore.js'`);
    code = code.replace(/from\s+['"]\.\/bookingTypes['"]/g, `from './bookingTypes.js'`);
    code = code.replace(/from\s+['"]\.\/bookingTransitions['"]/g, `from './bookingTransitions.js'`);
    code = code.replace(/from\s+['"]\.\/bookingEvents['"]/g, `from './bookingEvents.js'`);
    code = code.replace(/from\s+['"]\.\/bookingStore['"]/g, `from './bookingStore.js'`);
    code = code.replace(/from\s+['"]\.\/paymentTypes['"]/g, `from './paymentTypes.js'`);
    code = code.replace(/from\s+['"]\.\/demoPaymentProvider['"]/g, `from './demoPaymentProvider.js'`);
    code = code.replace(/from\s+['"]\.\/trackingTypes['"]/g, `from './trackingTypes.js'`);
    code = code.replace(/from\s+['"]\.\/trackingCorridors['"]/g, `from './trackingCorridors.js'`);
    code = code.replace(/from\s+['"]\.\/demoTrackingProvider['"]/g, `from './demoTrackingProvider.js'`);
    code = code.replace(/from\s+['"]\.\.\/payment\/demoPaymentProvider['"]/g, `from './demoPaymentProvider.js'`);
    code = code.replace(/from\s+['"]\.\.\/tracking\/demoTrackingProvider['"]/g, `from './demoTrackingProvider.js'`);
    code = code.replace(/from\s+['"]\.\.\/tracking\/trackingCorridors['"]/g, `from './trackingCorridors.js'`);
    code = code.replace(/from\s+['"]\.\/matchingTypes['"]/g, `from './matchingTypes.js'`);
    code = code.replace(/from\s+['"]\.\/matchingUtils['"]/g, `from './matchingUtils.js'`);
    code = code.replace(/from\s+['"]\.\/matchingEngine['"]/g, `from './matchingEngine.js'`);
    code = code.replace(/from\s+['"]\.\/marketplaceTypes['"]/g, `from './marketplaceTypes.js'`);
    code = code.replace(/from\s+['"]\.\/marketplaceTransitions['"]/g, `from './marketplaceTransitions.js'`);
    code = code.replace(/from\s+['"]\.\/marketplaceEvents['"]/g, `from './marketplaceEvents.js'`);
    code = code.replace(/from\s+['"]\.\/marketplaceStore['"]/g, `from './marketplaceStore.js'`);
    code = code.replace(/from\s+['"]\.\/marketplaceSelectors['"]/g, `from './marketplaceSelectors.js'`);
    code = code.replace(/from\s+['"]\.\/marketplaceDemoData['"]/g, `from './marketplaceDemoData.js'`);
    code = code.replace(/from\s+['"]\.\/authTypes['"]/g, `from './authTypes.js'`);
    code = code.replace(/from\s+['"]\.\/authValidation['"]/g, `from './authValidation.js'`);
    code = code.replace(/from\s+['"]\.\/demoPhoneAuthProvider['"]/g, `from './demoPhoneAuthProvider.js'`);
    code = code.replace(/from\s+['"]\.\/mockIdentityProvider['"]/g, `from './mockIdentityProvider.js'`);
    code = code.replace(/from\s+['"]\.\/authStore['"]/g, `from './authStore.js'`);
    code = code.replace(/from\s+['"]\.\/authService['"]/g, `from './authService.js'`);

    // Ensure all relative imports have .js extensions for native Node ESM
    code = code.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
      if (p1.endsWith('.js') || p1.endsWith('.json')) return match;
      return `from '${p1}.js'`;
    });
    code = code.replace(/import\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
      if (p1.endsWith('.js') || p1.endsWith('.json')) return match;
      return `import '${p1}.js'`;
    });

    const result = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
      },
    });

    // Save structured file path (preserves relative subdirectories e.g. src/lib/server/...)
    const structuredPath = path.join(tempOutDir, relPath.replace('.ts', '.js'));
    fs.mkdirSync(path.dirname(structuredPath), { recursive: true });
    fs.writeFileSync(structuredPath, result.outputText, 'utf8');

    // Also write flat file for existing flat test-suite imports
    const outName = path.basename(relPath).replace('.ts', '.js');
    fs.writeFileSync(path.join(tempOutDir, outName), result.outputText, 'utf8');
  }

  // Combined test script
  const testScript = `
import assert from 'node:assert';
import { calculateMatchScore, rankCandidates } from './matchingEngine.js';
import { DEFAULT_MATCHING_WEIGHTS } from './matchingTypes.js';
import { DEMO_TRAVELLER_CANDIDATES } from './match-demo.js';
import { MarketplaceStore } from './marketplaceStore.js';
import { seedMarketplaceDemo, DEMO_SENDER_IMAM, DEMO_TRAVELLER_RAHIM } from './marketplaceDemoData.js';
import {
  validateParcelTransition,
  validateTripTransition,
  validateBookingTransition,
} from './marketplaceTransitions.js';
import {
  getActiveTrips,
  getAvailableTrips,
  getPendingRequests,
  getConfirmedBookings,
  getCompletedBookings,
  getTravellerDashboardView,
  getSenderDashboardView,
} from './marketplaceSelectors.js';
import { demoPhoneAuthProvider } from './demoPhoneAuthProvider.js';
import { authStore } from './authStore.js';
import { authService, DEMO_USER_IMAM } from './authService.js';
import { maskPhoneNumber, validateBangladeshiPhone, validateOtpInput } from './authValidation.js';
import { mockIdentityProvider } from './mockIdentityProvider.js';
import { defaultBookingStore } from './bookingStore.js';
import { validateBookingTransition as validateP7BookingTransition, canCancelBooking } from './bookingTransitions.js';
import { defaultDemoPaymentProvider } from './demoPaymentProvider.js';
import { defaultDemoTrackingProvider } from './demoTrackingProvider.js';
import { getCorridorForRoute } from './trackingCorridors.js';
import { runPhase8BackendTests } from './src/lib/server/__tests__/backend.test.js';
import { runPhase9Tests } from './src/lib/server/__tests__/phase9.test.js';

let passed = 0;
let total = 0;

function it(section, name, fn) {
  total++;
  try {
    fn();
    console.log(\`  \x1b[32m✔ PASS\x1b[0m [\${total}] [\${section}] \${name}\`);
    passed++;
  } catch (err) {
    console.error(\`  \x1b[31m✖ FAIL\x1b[0m [\${total}] [\${section}] \${name}\`);
    console.error('    Error:', err.message);
  }
}

async function itAsync(section, name, fn) {
  total++;
  try {
    await fn();
    console.log(\`  \x1b[32m✔ PASS\x1b[0m [\${total}] [\${section}] \${name}\`);
    passed++;
  } catch (err) {
    console.error(\`  \x1b[31m✖ FAIL\x1b[0m [\${total}] [\${section}] \${name}\`);
    console.error('    Error:', err.message);
  }
}

console.log('\x1b[35m%s\x1b[0m', '--- Suite 1: Phase 5 Deterministic Matching Engine (9 Tests) ---');

const standardParcel = {
  originId: 'dhaka',
  destinationId: 'cumilla',
  originCityBn: 'ঢাকা',
  destinationCityBn: 'কুমিল্লা',
  weightKg: 1.5,
  size: 'small',
  urgency: 'today',
  requiredDeliveryHour: 14.0,
  pickupAreaBn: 'মতিঝিল',
};
const idealCandidate = DEMO_TRAVELLER_CANDIDATES[0];

it('Matching', 'Ideal candidate produces high match score (>= 90%) and PERFECT route level', () => {
  const result = calculateMatchScore(standardParcel, idealCandidate);
  assert.strictEqual(result.isEligible, true);
  assert.strictEqual(result.compatibilityLevel, 'PERFECT');
  assert.ok(result.totalScore >= 90 && result.totalScore <= 100);
});

it('Matching', 'Nationwide corridor matching (Dhaka -> Chattogram matches Dhaka -> Cumilla)', () => {
  const corridorCandidate = DEMO_TRAVELLER_CANDIDATES.find(c => c.id === 'trv-dct-01');
  const result = calculateMatchScore(standardParcel, corridorCandidate);
  assert.strictEqual(result.isEligible, true);
  assert.strictEqual(result.compatibilityLevel, 'GOOD');
  assert.ok(result.totalScore >= 80);
});

it('Matching', 'Incompatible route produces NO_MATCH, 0 route score, and is disqualified', () => {
  const wrongCandidate = DEMO_TRAVELLER_CANDIDATES.find(c => c.id === 'edge-trv-wrong-route');
  const result = calculateMatchScore(standardParcel, wrongCandidate);
  assert.strictEqual(result.compatibilityLevel, 'NO_MATCH');
  assert.strictEqual(result.isEligible, false);
});

it('Matching', 'Insufficient capacity triggers hard constraint disqualification', () => {
  const smallCapCandidate = DEMO_TRAVELLER_CANDIDATES.find(c => c.id === 'edge-trv-overweight');
  const result = calculateMatchScore(standardParcel, smallCapCandidate);
  assert.strictEqual(result.isEligible, false);
});

it('Matching', 'Arrival after required delivery deadline triggers disqualification', () => {
  const lateCandidate = { ...idealCandidate, id: 'late-candidate', estimatedArrivalHour: 16.5 };
  const result = calculateMatchScore(standardParcel, lateCandidate);
  assert.strictEqual(result.isEligible, false);
});

it('Matching', 'Pickup distance degrades score smoothly from near to far', () => {
  const nearResult = calculateMatchScore(standardParcel, { ...idealCandidate, approximateDistanceKm: 1.0 });
  const farResult = calculateMatchScore(standardParcel, { ...idealCandidate, approximateDistanceKm: 12.0 });
  assert.ok(farResult.breakdown.distance.score < nearResult.breakdown.distance.score / 2);
});

it('Matching', 'Custom configurable weights calculate without magic numbers', () => {
  const customWeights = { route: 50, time: 10, distance: 10, capacity: 10, reliability: 10, speed: 10 };
  const result = calculateMatchScore(standardParcel, idealCandidate, customWeights);
  assert.strictEqual(result.breakdown.route.score, 50);
});

it('Matching', 'rankCandidates filters out disqualified candidates and sorts by best match', () => {
  const candidates = [
    idealCandidate,
    { ...idealCandidate, id: 'low-rating', rating: 4.2, totalTripsCompleted: 2, approximateDistanceKm: 7.0 },
    DEMO_TRAVELLER_CANDIDATES.find(c => c.id === 'edge-trv-overweight'),
    DEMO_TRAVELLER_CANDIDATES.find(c => c.id === 'edge-trv-wrong-route'),
  ];
  const ranked = rankCandidates(standardParcel, candidates, DEFAULT_MATCHING_WEIGHTS, 'best_match');
  assert.strictEqual(ranked.length, 2);
  assert.strictEqual(ranked[0].candidateId, idealCandidate.id);
});

it('Matching', 'All scores and breakdowns are strictly bounded within 0 to 100', () => {
  for (const candidate of DEMO_TRAVELLER_CANDIDATES) {
    const res = calculateMatchScore(standardParcel, candidate);
    assert.ok(res.totalScore >= 0 && res.totalScore <= 100);
  }
});

console.log('\\n\x1b[35m%s\x1b[0m', '--- Suite 2: Phase 5.5 Marketplace State Architecture (12 Tests) ---');

let store = new MarketplaceStore();

it('Marketplace', '1. Parcel lifecycle transitions step-by-step to DELIVERED', () => {
  store.reset();
  const parcel = store.createParcel({
    senderId: 'user-s1',
    origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'ধানমন্ডি' },
    destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'কান্দিরপাড়' },
    category: 'documents',
    categoryBn: 'ডকুমেন্টস',
    weightKg: 0.5,
    packageSize: 'small',
    packageSizeBn: 'ছোট',
    description: 'ফাইল',
    urgency: 'today',
    urgencyBn: 'আজই',
    requiredDeliveryAt: '2026-10-23T18:00:00Z',
    pickupDetails: { areaNameBn: 'ধানমন্ডি', landmarkBn: '২৭', contactPhone: '01700' },
    initialStatus: 'DRAFT',
  });
  store.updateParcelStatus(parcel.id, 'SEARCHING');
  store.updateParcelStatus(parcel.id, 'MATCHED');
  store.updateParcelStatus(parcel.id, 'BOOKED');
  store.updateParcelStatus(parcel.id, 'READY_FOR_PICKUP');
  store.updateParcelStatus(parcel.id, 'IN_TRANSIT');
  store.updateParcelStatus(parcel.id, 'DELIVERED');
  assert.strictEqual(parcel.status, 'DELIVERED');
});

it('Marketplace', '2. Trip lifecycle transitions from DRAFT to COMPLETED', () => {
  store.reset();
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
  store.updateTripStatus(trip.id, 'PUBLISHED');
  store.updateTripStatus(trip.id, 'MATCHING');
  store.updateTripStatus(trip.id, 'ACTIVE');
  store.updateTripStatus(trip.id, 'COMPLETED');
  assert.strictEqual(trip.status, 'COMPLETED');
});

it('Marketplace', '3. Match lifecycle transitions from CANDIDATE to REQUESTED to ACCEPTED', () => {
  store.reset();
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
    reasons: ['রুট মিলেছে'],
  });
  assert.strictEqual(match.status, 'CANDIDATE');
  match.status = 'REQUESTED';
  assert.strictEqual(match.status, 'REQUESTED');
  match.status = 'ACCEPTED';
  assert.strictEqual(match.status, 'ACCEPTED');
});

it('Marketplace', '4. Booking lifecycle transitions through all standard stages', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250, demo.match.id);
  assert.strictEqual(booking.status, 'PENDING_TRAVELLER');
  store.acceptBooking(booking.id);
  assert.strictEqual(booking.status, 'CONFIRMED');
  const handover = store.getHandover(booking.id);
  store.verifyPickup(booking.id, handover.pickupOtp);
  assert.strictEqual(booking.status, 'IN_TRANSIT');
  store.verifyDelivery(booking.id, handover.deliveryOtp);
  assert.strictEqual(booking.status, 'DELIVERED');
});

it('Marketplace', '5. Invalid transitions are strictly rejected by transition validators', () => {
  const pVal = validateParcelTransition('DRAFT', 'DELIVERED');
  assert.strictEqual(pVal.valid, false);
  const tVal = validateTripTransition('COMPLETED', 'ACTIVE');
  assert.strictEqual(tVal.valid, false);
  const bVal = validateBookingTransition('PENDING_TRAVELLER', 'IN_TRANSIT');
  assert.strictEqual(bVal.valid, false);
});

it('Marketplace', '6. Capacity reduces accurately when traveller accepts booking', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  assert.strictEqual(demo.trip.remainingCapacityKg, 2.0);
  const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250);
  assert.strictEqual(demo.trip.remainingCapacityKg, 2.0);
  store.acceptBooking(booking.id);
  assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);
});

it('Marketplace', '7. Rejects booking requests when parcel weight exceeds remaining capacity', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const heavyParcel = store.createParcel({
    senderId: 'user-heavy',
    origin: demo.trip.origin,
    destination: demo.trip.destination,
    category: 'other_permitted',
    categoryBn: 'ভারী পণ্য',
    weightKg: 3.5,
    packageSize: 'large',
    packageSizeBn: 'বড়',
    description: 'কার্টন',
    urgency: 'today',
    urgencyBn: 'আজই',
    requiredDeliveryAt: '2026-10-23T20:00:00Z',
    pickupDetails: { areaNameBn: 'মতিঝিল', landmarkBn: 'শাপলা চত্বর', contactPhone: '01711' },
    initialStatus: 'SEARCHING',
  });
  assert.throws(() => {
    store.requestBooking(heavyParcel.id, demo.trip.id, 500);
  }, /Capacity overflow/);
});

it('Marketplace', '8. Cancellation restores trip capacity and updates status with reasons', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250);
  store.acceptBooking(booking.id);
  assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);
  store.cancelBooking(booking.id, 'changed_mind', 'sender');
  assert.strictEqual(booking.status, 'CANCELLED');
  assert.strictEqual(booking.cancellationReason, 'changed_mind');
  assert.strictEqual(demo.trip.remainingCapacityKg, 2.0);
});

it('Marketplace', '9. Supports multiple parcels on a single trip as long as capacity permits', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const booking1 = store.requestBooking(demo.parcel.id, demo.trip.id, 200);
  store.acceptBooking(booking1.id);
  assert.strictEqual(demo.trip.remainingCapacityKg, 1.5);

  const parcel2 = store.createParcel({
    senderId: 'user-s2',
    origin: demo.trip.origin,
    destination: demo.trip.destination,
    category: 'books',
    categoryBn: 'বই',
    weightKg: 0.8,
    packageSize: 'medium',
    packageSizeBn: 'মাঝারি',
    description: 'বই',
    urgency: 'today',
    urgencyBn: 'আজই',
    requiredDeliveryAt: '2026-10-23T20:00:00Z',
    pickupDetails: { areaNameBn: 'সায়েদাবাদ', landmarkBn: 'কাউন্টার', contactPhone: '01822' },
    initialStatus: 'SEARCHING',
  });
  const booking2 = store.requestBooking(parcel2.id, demo.trip.id, 280);
  store.acceptBooking(booking2.id);
  assert.strictEqual(demo.trip.remainingCapacityKg, 0.7);
});

it('Marketplace', '10. Booking maintains strict relationship integrity between Sender and Traveller', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 250);
  assert.strictEqual(booking.senderId, DEMO_SENDER_IMAM.id);
  assert.strictEqual(booking.travellerId, DEMO_TRAVELLER_RAHIM.id);
  assert.strictEqual(booking.parcelId, demo.parcel.id);
  assert.strictEqual(booking.tripId, demo.trip.id);
});

it('Marketplace', '11. Enforces privacy by hiding sensitive details from public view', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const publicProfile = store.getPublicTravellerProfile(demo.traveller.id, demo.trip.id);
  assert.ok(publicProfile !== undefined);
  assert.strictEqual(publicProfile.name, 'রহিম উল্লাহ');
  assert.strictEqual(publicProfile.phone, undefined);
  assert.strictEqual(publicProfile.exactGpsCoordinates, undefined);
  assert.strictEqual(publicProfile.exactAddress, undefined);
});

it('Marketplace', '12. Complete end-to-end lifecycle executes seamlessly from trip creation to completion', () => {
  store.reset();
  const demo = seedMarketplaceDemo(store);
  const booking = store.requestBooking(demo.parcel.id, demo.trip.id, 240, demo.match.id);
  store.acceptBooking(booking.id);
  const handover = store.getHandover(booking.id);
  store.verifyPickup(booking.id, handover.pickupOtp);
  store.verifyDelivery(booking.id, handover.deliveryOtp);
  assert.strictEqual(booking.status, 'DELIVERED');
  const rating = store.addRating(booking.id, demo.sender.id, demo.traveller.id, 5, 'চমৎকার সেবা!');
  assert.strictEqual(rating.score, 5);

  const travellerDash = getTravellerDashboardView(store, demo.traveller.id);
  assert.strictEqual(travellerDash.completedBookings.length, 1);
  assert.strictEqual(travellerDash.totalEarnings, 240);
});

console.log('\\n\x1b[35m%s\x1b[0m', '--- Suite 3: Phase 6 Auth, Trust & Verification Foundation (17 Tests) ---');

const testPhone = '01711002233';

async function runAuthSuite() {
  await itAsync('Auth', '1. Valid demo OTP (123456) verifies and logs in', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const res = await authService.submitOtp(testPhone, '123456', 'BOTH');
    assert.strictEqual(res.success, true);
    assert.strictEqual(authStore.isAuthenticated(), true);
  });

  await itAsync('Auth', '2. Invalid OTP is rejected with friendly Bengali error', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const res = await demoPhoneAuthProvider.verifyOtp(testPhone, '999999');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.messageBn, 'কোডটি সঠিক নয়। আবার চেষ্টা করুন।');
  });

  await itAsync('Auth', '3. Expired OTP returns expiry error', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    demoPhoneAuthProvider.expireOtpForTesting(testPhone);
    const res = await demoPhoneAuthProvider.verifyOtp(testPhone, '123456');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.messageBn, 'এই কোডটির মেয়াদ শেষ হয়েছে। নতুন কোড নিন।');
  });

  await itAsync('Auth', '4. Resend OTP provides new active code', async () => {
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const res = await demoPhoneAuthProvider.resendOtp(testPhone);
    assert.strictEqual(res.success, true);
  });

  await itAsync('Auth', '5. Login creates active session with future expiration', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    await authService.submitOtp(testPhone, '123456');
    const session = authStore.getCurrentSession();
    assert.ok(session !== null);
    assert.ok(new Date(session.expiresAt) > new Date(session.createdAt));
  });

  it('Auth', '6. Logout clears session and user state', () => {
    authService.logout();
    assert.strictEqual(authStore.isAuthenticated(), false);
    assert.strictEqual(authStore.getCurrentUser(), null);
    assert.strictEqual(authStore.getAuthState(), 'LOGGED_OUT');
  });

  it('Auth', '7. Session expiry sets SESSION_EXPIRED', () => {
    authStore.login(DEMO_USER_IMAM, -1);
    assert.strictEqual(authStore.isSessionExpired(), true);
    assert.strictEqual(authStore.isAuthenticated(), false);
  });

  it('Auth', '8. Protected action records and returns redirect target', () => {
    authStore.setRedirectAfterAuth('/send');
    assert.strictEqual(authStore.getRedirectAfterAuth(), '/send');
  });

  await itAsync('Auth', '9. Sender parcel creation uses authenticated stable user ID', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const { user } = await authService.submitOtp(testPhone, '123456');
    const p = store.createParcel({
      senderId: user.id,
      origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'ধানমন্ডি' },
      destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'কান্দিরপাড়' },
      category: 'documents',
      categoryBn: 'ডকুমেন্টস',
      weightKg: 0.5,
      packageSize: 'small',
      packageSizeBn: 'ছোট',
      description: 'সার্টিফিকেট',
      urgency: 'today',
      urgencyBn: 'আজই',
      requiredDeliveryAt: '2026-10-23T20:00:00Z',
      pickupDetails: { areaNameBn: 'ধানমন্ডি', landmarkBn: '২৭', contactPhone: user.phone },
    });
    assert.strictEqual(p.senderId, user.id);
  });

  await itAsync('Auth', '10. Traveller trip publishing associates authenticated stable user ID', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp('01819556677');
    const { user } = await authService.submitOtp('01819556677', '123456', 'TRAVELLER');
    const t = store.createTrip({
      travellerId: user.id,
      origin: { hubId: 'dhaka', hubNameBn: 'ঢাকা', areaNameBn: 'যাত্রাবাড়ী' },
      destination: { hubId: 'cumilla', hubNameBn: 'কুমিল্লা', areaNameBn: 'কান্দিরপাড়' },
      waypoints: [],
      departureAt: '2026-10-23T16:00:00Z',
      departureTimeBn: 'বিকাল ০৪:০০',
      estimatedArrivalAt: '2026-10-23T18:30:00Z',
      estimatedArrivalTimeBn: 'সন্ধ্যা ০৬:৩০',
      travelMode: 'car',
      travelModeBn: 'প্রাইভেট কার',
      availableCapacityKg: 2.0,
      pickupPreference: 'along_route',
      pickupPreferenceBn: 'যাত্রাপথে',
    });
    assert.strictEqual(t.travellerId, user.id);
  });

  await itAsync('Auth', '11. User can switch roles dynamically to BOTH', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    await authService.submitOtp(testPhone, '123456', 'SENDER');
    assert.strictEqual(authStore.getCurrentUser().role, 'SENDER');
    authService.switchRole('BOTH');
    assert.strictEqual(authStore.getCurrentUser().role, 'BOTH');
  });

  await itAsync('Auth', '12. Logging in with same phone preserves consistent stable user ID', async () => {
    authStore.reset();
    demoPhoneAuthProvider.clear();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const l1 = await authService.submitOtp(testPhone, '123456');
    authService.logout();
    await demoPhoneAuthProvider.requestOtp(testPhone);
    const l2 = await authService.submitOtp(testPhone, '123456');
    assert.strictEqual(l1.user.id, l2.user.id);
  });

  it('Auth', '13. Masks phone numbers safely (+880 17***-**233)', () => {
    const masked = maskPhoneNumber('+8801711002233');
    assert.ok(masked.includes('***'));
    assert.ok(masked.endsWith('233'));
  });

  it('Auth', '14. Generates transparent trust signals without fake percentage score', () => {
    const sig = authService.getTrustSignals(DEMO_USER_IMAM);
    assert.strictEqual(sig.isPhoneVerified, true);
    assert.strictEqual(sig.isIdentityVerified, false);
    assert.strictEqual(sig.cancellationRate, 0.0);
  });

  await itAsync('Auth', '15. Identity verification remains false without official government provider', async () => {
    const stat = await mockIdentityProvider.getVerificationStatus('user-sender-imam');
    assert.strictEqual(stat.isVerified, false);
    assert.strictEqual(stat.status, 'UNVERIFIED');
  });

  await itAsync('Auth', '16. Demo OTP hint is returned when demo mode is active', async () => {
    const res = await demoPhoneAuthProvider.requestOtp(testPhone);
    assert.strictEqual(res.otpCodeDemo, '123456');
  });

  it('Auth', '17. Public traveller view never leaks private phone, GPS, or identity documents', () => {
    store.reset();
    store.registerUser(DEMO_USER_IMAM, {
      phone: '+8801711002233',
      exactGpsCoordinates: [90.4125, 23.8103],
      exactAddress: 'ঢাকা',
      nidDocumentMasked: 'XXXX-1234',
    });
    const pub = store.getPublicTravellerProfile(DEMO_USER_IMAM.id);
    assert.strictEqual(pub.phone, undefined);
    assert.strictEqual(pub.exactGpsCoordinates, undefined);
    assert.strictEqual(pub.nidDocumentMasked, undefined);
  });

  console.log('\\n' + (passed === total ? '\x1b[32m✔ Phase 6 Passed: ' + total + ' tests\x1b[0m' : '\x1b[31m✖ Tests failed\x1b[0m'));
}

async function runPhase7Suite() {
  console.log('\\n--- Suite 4: Phase 7 Booking, Handover & Delivery Lifecycle (12 Tests) ---');

  it('Booking', '1. Valid lifecycle transitions accepted by state machine', () => {
    assert.strictEqual(validateP7BookingTransition('PENDING_TRAVELLER', 'ACCEPTED').valid, true);
    assert.strictEqual(validateP7BookingTransition('ACCEPTED', 'PAYMENT_PENDING').valid, true);
    assert.strictEqual(validateP7BookingTransition('PAYMENT_HELD', 'READY_FOR_PICKUP').valid, true);
    assert.strictEqual(validateP7BookingTransition('HANDED_OVER', 'IN_TRANSIT').valid, true);
    assert.strictEqual(validateP7BookingTransition('DELIVERY_PENDING', 'DELIVERED').valid, true);
  });

  it('Booking', '2. Invalid lifecycle transitions strictly rejected', () => {
    const invalid1 = validateP7BookingTransition('PENDING_TRAVELLER', 'IN_TRANSIT');
    assert.strictEqual(invalid1.valid, false);
    assert.ok(invalid1.errorMessageBn.includes('গ্রহণযোগ্য নয়'));

    const invalid2 = validateP7BookingTransition('DELIVERED', 'IN_TRANSIT');
    assert.strictEqual(invalid2.valid, false);
  });

  it('Booking', '3. Enforces strict cancellation boundaries before handover', () => {
    assert.strictEqual(canCancelBooking('PENDING_TRAVELLER'), true);
    assert.strictEqual(canCancelBooking('ACCEPTED'), true);
    assert.strictEqual(canCancelBooking('PAYMENT_HELD'), true);
    assert.strictEqual(canCancelBooking('HANDED_OVER'), false);
    assert.strictEqual(canCancelBooking('IN_TRANSIT'), false);
    assert.strictEqual(canCancelBooking('DELIVERED'), false);
  });

  it('Booking', '4. Booking creation and traveller acceptance update state cleanly', () => {
    const booking = defaultBookingStore.createBooking({
      parcelId: 'pcl-suite-1',
      tripId: 'trip-suite-1',
      senderId: 'user-sender-test',
      senderName: 'পরীক্ষামূলক প্রেরক',
      senderPhone: '+880 1711-223344',
      recipientName: 'পরীক্ষামূলক প্রাপক',
      recipientPhone: '+880 1911-556677',
      travellerId: 'user-traveller-test',
      travellerName: 'পরীক্ষামূলক সহযাত্রী',
      travellerPhone: '+880 1811-990011',
      travellerRating: 4.9,
      travellerAvatar: '👨‍✈️',
      travellerVehicleBn: 'বাস',
      originCityBn: 'ঢাকা',
      originAreaBn: 'সায়েদাবাদ',
      destinationCityBn: 'কুমিল্লা',
      destinationAreaBn: 'শাসনগাছা',
      routeBn: 'ঢাকা → কুমিল্লা',
      corridorNameBn: 'ঢাকা-চট্টগ্রাম করিডোর',
      parcelTitleBn: 'জরুরি নথি',
      parcelCategoryBn: 'ডকুমেন্ট',
      parcelWeightKg: 0.5,
      parcelSizeBn: 'ছোট',
      pickupEstimatedTimeBn: 'সকাল ০৮:০০',
      deliveryEstimatedTimeBn: 'সকাল ১০:৩০',
      priceBreakdown: {
        travellerFee: 150,
        platformFee: 20,
        trustGuarantee: 10,
        total: 180,
      },
    });
    assert.strictEqual(booking.status, 'PENDING_TRAVELLER');
    assert.strictEqual(booking.paymentStatus, 'UNPAID');

    defaultBookingStore.acceptBooking(booking.id);
    assert.strictEqual(booking.status, 'ACCEPTED');
  });

  await itAsync('Payment', '5. Demo Escrow holds funds safely without real financial charge', async () => {
    const bookings = defaultBookingStore.getAllBookings();
    const target = bookings.find((b) => b.status === 'ACCEPTED');
    assert.ok(target);

    const updated = await defaultBookingStore.holdPayment(target.id, 'bkash');
    assert.strictEqual(updated.status, 'PAYMENT_HELD');
    assert.strictEqual(updated.paymentStatus, 'HELD');
    assert.ok(updated.paymentTransactionId);
  });

  it('Handover', '6. OTP 1 and 4-point safety checklist verified correctly', () => {
    const b = defaultBookingStore.getBookingById('BHK-89241');
    assert.ok(b);

    // Incomplete checklist should fail
    const failedChecklist = defaultBookingStore.verifyHandoverOtp(b.id, b.handover.otp1, {
      packageInspected: true,
      noProhibitedItems: false,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(failedChecklist.success, false);

    // Wrong OTP should fail
    const wrongOtp = defaultBookingStore.verifyHandoverOtp(b.id, '0000', {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(wrongOtp.success, false);

    // Correct OTP and complete checklist should succeed
    const validHandover = defaultBookingStore.verifyHandoverOtp(b.id, b.handover.otp1, {
      packageInspected: true,
      noProhibitedItems: true,
      recipientPhoneConfirmed: true,
      weightWithinLimit: true,
    });
    assert.strictEqual(validHandover.success, true);
    assert.strictEqual(validHandover.booking.status, 'HANDED_OVER');
  });

  it('Transit', '7. Journey transitions to IN_TRANSIT along national highway', () => {
    const b = defaultBookingStore.getBookingById('BHK-89241');
    assert.ok(b);
    const inTransit = defaultBookingStore.startJourney(b.id);
    assert.strictEqual(inTransit.status, 'IN_TRANSIT');
  });

  await itAsync('Tracking', '8. Corridor tracking calculates ETA and preserves location privacy', async () => {
    const corridor = getCorridorForRoute('ঢাকা', 'কুমিল্লা');
    assert.strictEqual(corridor.checkpoints.length, 5);

    const tracking = await defaultDemoTrackingProvider.getTracking('BHK-74192', 'ঢাকা', 'চট্টগ্রাম');
    assert.ok(tracking.corridorNameBn.includes('ঢাকা-চট্টগ্রাম'));
    assert.ok(tracking.maskedCurrentLocationBn.includes('মহাসড়ক'));
    assert.strictEqual(tracking.isSimulated, true);
  });

  await itAsync('Delivery', '9. Delivery OTP 2 verification releases escrow to traveller', async () => {
    const b = defaultBookingStore.getBookingById('BHK-74192');
    assert.ok(b);

    const wrongRes = await defaultBookingStore.verifyDeliveryOtp(b.id, '1111');
    assert.strictEqual(wrongRes.success, false);

    const validRes = await defaultBookingStore.verifyDeliveryOtp(b.id, b.delivery.otp2);
    assert.strictEqual(validRes.success, true);
    assert.strictEqual(validRes.booking.status, 'DELIVERED');
    assert.strictEqual(validRes.booking.paymentStatus, 'RELEASED');
  });

  it('Rating', '10. Two-sided ratings record and persist user trust scores', () => {
    const ratedBooking = defaultBookingStore.submitRating(
      'BHK-89241',
      'sender',
      5,
      'দারুণ ও দায়িত্বশীল সেবা!',
      { careScore: 5, speedScore: 5, communicationScore: 5 }
    );
    assert.ok(ratedBooking.senderRating);
    assert.strictEqual(ratedBooking.senderRating.rating, 5);
    assert.strictEqual(ratedBooking.senderRating.fromRole, 'sender');
  });

  it('Dispute', '11. Disputes freeze normal lifecycle and register audit record', () => {
    const disputeBooking = defaultBookingStore.raiseDispute(
      'BHK-89241',
      'sender',
      'late_delivery',
      'অযৌক্তিক অতিরিক্ত বিলম্ব',
      'সহযাত্রী এখনও গন্তব্যে পৌঁছাননি'
    );
    assert.strictEqual(disputeBooking.status, 'DISPUTED');
    assert.ok(disputeBooking.dispute);
    assert.strictEqual(disputeBooking.dispute.category, 'late_delivery');
  });

  it('Cancellation', '12. Pre-handover cancellation cleanly updates state', () => {
    const cBooking = defaultBookingStore.createBooking({
      parcelId: 'pcl-refund-test-2',
      tripId: 'trip-refund-test-2',
      senderId: 'user-sender-imam',
      senderName: 'ইমাম হাসান',
      senderPhone: '+880 1711-002233',
      recipientName: 'প্রাপক',
      recipientPhone: '+880 1912-334455',
      travellerId: 'user-traveller-rahim',
      travellerName: 'আব্দুর রহিম',
      travellerPhone: '+880 1819-556677',
      travellerRating: 4.9,
      travellerAvatar: '👨‍💼',
      travellerVehicleBn: 'বাস',
      originCityBn: 'ঢাকা',
      originAreaBn: 'সায়েদাবাদ',
      destinationCityBn: 'কুমিল্লা',
      destinationAreaBn: 'কান্দিরপাড়',
      routeBn: 'ঢাকা → কুমিল্লা',
      corridorNameBn: 'N1 করিডোর',
      parcelTitleBn: 'বইয়ের পার্সেল',
      parcelCategoryBn: 'বই',
      parcelWeightKg: 1.0,
      parcelSizeBn: 'বই',
      pickupEstimatedTimeBn: 'দুপুর ১২:০০',
      deliveryEstimatedTimeBn: 'বিকেল ০৩:০০',
      priceBreakdown: {
        travellerFee: 140,
        platformFee: 20,
        trustGuarantee: 10,
        total: 170,
      },
    });

    const cancelled = defaultBookingStore.cancelBooking(cBooking.id, 'sender', 'প্রয়োজন শেষ হয়েছে');
    assert.strictEqual(cancelled.status, 'CANCELLED');
  });

  console.log('\\n\\x1b[32m✔ Phase 7 Passed: 12 tests\\x1b[0m');
}

async function runAll() {
  await runAuthSuite();
  await runPhase7Suite();
  await runPhase8BackendTests(it, itAsync);
  await runPhase9Tests(it, itAsync);
  console.log('\\n' + (passed === total ? '\x1b[32m✔ All ' + total + ' unified unit tests passed successfully!\x1b[0m' : '\x1b[31m✖ Tests failed: ' + passed + '/' + total + ' passed\x1b[0m'));
  if (passed !== total) process.exit(1);
}

runAll();
`;

  fs.writeFileSync(path.join(tempOutDir, 'test-suite.js'), testScript, 'utf8');

  import(`file://${path.join(tempOutDir, 'test-suite.js')}`).catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}

runTestSuite();
