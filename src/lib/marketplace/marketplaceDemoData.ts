// BOHOK Phase 5.5 — Demo Marketplace Data & Canonical Lifecycle
// Models the primary Imam (Sender) ↔ Rahim (Traveller) scenario on Dhaka ↔ Cumilla

import { MarketplaceStore } from './marketplaceStore';
import { User, Trip, Parcel, Match, PrivateTravellerDetails } from './marketplaceTypes';

export const DEMO_SENDER_IMAM: User = {
  id: 'user-sender-imam',
  name: 'ইমাম হোসেন',
  phone: '+8801711002233',
  avatar: '/avatars/imam.png',
  avatarInitials: 'ইহ',
  verificationStatus: 'verified',
  verificationBadgeBn: 'এনআইডি যাচাইকৃত',
  rating: 4.95,
  completedTrips: 12,
  createdAt: '2026-09-10T10:00:00Z',
};

export const DEMO_TRAVELLER_RAHIM: User = {
  id: 'user-traveller-rahim',
  name: 'রহিম উল্লাহ',
  phone: '+8801819556677',
  avatar: '/avatars/rahim.png',
  avatarInitials: 'রু',
  verificationStatus: 'verified',
  verificationBadgeBn: 'সুপার ট্রাভেলার',
  rating: 4.9,
  completedTrips: 38,
  createdAt: '2026-08-15T09:00:00Z',
};

export const DEMO_TRAVELLER_RAHIM_PRIVATE: PrivateTravellerDetails = {
  phone: '+8801819556677',
  exactGpsCoordinates: [90.4372, 23.7081],
  exactAddress: 'বাড়ি #১২, রোড #৪, যাত্রাবাড়ী, ঢাকা',
  nidDocumentMasked: 'XXXXXXXX-1294',
};

/**
 * Seeds the canonical demo state for the BOHOK prototype
 */
export function seedMarketplaceDemo(store: MarketplaceStore): {
  sender: User;
  traveller: User;
  trip: Trip;
  parcel: Parcel;
  match: Match;
} {
  // 1. Register Users
  store.registerUser(DEMO_SENDER_IMAM);
  store.registerUser(DEMO_TRAVELLER_RAHIM, DEMO_TRAVELLER_RAHIM_PRIVATE);

  // 2. Create Traveller Trip: Dhaka -> Cumilla, 4:30 PM, Capacity: 2.0 kg
  const trip = store.createTrip({
    id: 'trip-rahim-dc-01',
    travellerId: DEMO_TRAVELLER_RAHIM.id,
    origin: {
      hubId: 'dhaka',
      hubNameBn: 'ঢাকা',
      areaNameBn: 'যাত্রাবাড়ী মোড়',
      landmarkBn: 'মেয়র হানিফ ফ্লাইওভার মুখ',
      approximateDistanceKm: 1.2,
    },
    destination: {
      hubId: 'cumilla',
      hubNameBn: 'কুমিল্লা',
      areaNameBn: 'কান্দিরপাড়',
      landmarkBn: 'পূবালী চত্বর',
    },
    waypoints: [
      { id: 'wp-1', hubId: 'kanchpur', nameBn: 'কাঁচপুর সেতু', order: 1, isStopPoint: true },
      { id: 'wp-2', hubId: 'daudkandi', nameBn: 'দাউদকান্দি মেঘনা ঘাট', order: 2, isStopPoint: true },
    ],
    departureAt: '2026-10-23T16:30:00+06:00',
    departureTimeBn: 'আজ বিকাল ০৪:৩০',
    estimatedArrivalAt: '2026-10-23T19:15:00+06:00',
    estimatedArrivalTimeBn: 'আজ সন্ধ্যা ০৭:১৫',
    travelMode: 'car',
    travelModeBn: 'প্রাইভেট কার (Sedan)',
    availableCapacityKg: 2.0, // 2.0 kg maximum capacity
    pickupPreference: 'along_route',
    pickupPreferenceBn: 'যাত্রাপথে সুবিধাজনক স্থানে',
    initialStatus: 'PUBLISHED',
  });

  // 3. Create Sender Parcel: Document, 0.5 kg, Dhaka -> Cumilla
  const parcel = store.createParcel({
    id: 'pcl-imam-doc-01',
    senderId: DEMO_SENDER_IMAM.id,
    origin: {
      hubId: 'dhaka',
      hubNameBn: 'ঢাকা',
      areaNameBn: 'মতিঝিল শাপলা চত্বর',
      landmarkBn: 'বাংলাদেশ ব্যাংক সংলগ্ন',
      approximateDistanceKm: 1.2,
    },
    destination: {
      hubId: 'cumilla',
      hubNameBn: 'কুমিল্লা',
      areaNameBn: 'শাসনগাছা টার্মিনাল',
      landmarkBn: 'রেলওয়ে ওভারপাস',
    },
    category: 'documents',
    categoryBn: 'জরুরি ডকুমেন্টস',
    weightKg: 0.5,
    packageSize: 'small',
    packageSizeBn: 'ছোট (খাম)',
    description: 'বিশ্ববিদ্যালয় সার্টিফিকেট ও সত্যায়িত মার্কশিটের মূল কপি',
    urgency: 'today',
    urgencyBn: 'আজই জরুরি',
    requiredDeliveryAt: '2026-10-23T20:00:00+06:00',
    pickupDetails: {
      areaNameBn: 'মতিঝিল',
      landmarkBn: 'শাপলা চত্বর সোনালী ব্যাংক গেট',
      contactPhone: '+8801711002233',
    },
    initialStatus: 'SEARCHING',
  });

  // 4. Generate Match: 96% match
  const match = store.createMatch({
    id: 'mtc-imam-rahim-01',
    parcelId: parcel.id,
    tripId: trip.id,
    score: 96,
    routeScore: 35,
    timeScore: 20,
    distanceScore: 15,
    capacityScore: 15,
    reliabilityScore: 8,
    speedScore: 3,
    compatibilityLevel: 'PERFECT',
    reasons: [
      'সরাসরি রুট সম্পূর্ণ মিলে গেছে (ঢাকা → কুমিল্লা সরাসরি)',
      'আপনার পিকআপ পয়েন্টের মাত্র ১.২ কিমি কাছে',
      'আজ সন্ধ্যা ৭:১৫-এর মধ্যেই পৌঁছানোর সম্ভাবনা',
      '০.৫ কেজি পার্সেল বহনের জন্য পর্যাপ্ত স্পেস রয়েছে (২.০ কেজি খালি)',
    ],
  });

  return {
    sender: DEMO_SENDER_IMAM,
    traveller: DEMO_TRAVELLER_RAHIM,
    trip,
    parcel,
    match,
  };
}
