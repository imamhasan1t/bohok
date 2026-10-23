'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SenderStep,
  SenderFormData,
  MatchingResult,
  BookingConfirmationData,
} from '@/types/sender';
import { CITY_HUBS } from '@/data/cities';
import { findRouteByEndpoints, NATIONWIDE_ROUTES } from '@/data/routes';
import { DEMO_TRAVELLERS } from '@/data/travellers';
import { DEMO_TRAVELLER_CANDIDATES } from '@/data/match-demo';
import { rankCandidates } from '@/lib/matching/matchingEngine';
import { DEFAULT_MATCHING_WEIGHTS, ParcelMatchRequirement, TravellerTripMatchCandidate } from '@/lib/matching/matchingTypes';
import { marketplaceStore } from '@/lib/marketplace/marketplaceStore';
import { defaultBookingStore } from '@/lib/booking/bookingStore';
import { useAuth } from '@/lib/auth/useAuth';
import { StepIndicator } from './StepIndicator';
import { Step1Route } from './steps/Step1Route';
import { Step2ParcelDetails } from './steps/Step2ParcelDetails';
import { Step3Urgency } from './steps/Step3Urgency';
import { Step4Pickup } from './steps/Step4Pickup';
import { Step5Matching } from './steps/Step5Matching';
import { Step6Selection } from './steps/Step6Selection';
import { Step7Confirmation } from './steps/Step7Confirmation';

interface SenderFlowWizardProps {
  initialOriginId?: string;
  initialDestinationId?: string;
}

export function SenderFlowWizard({
  initialOriginId = 'dhaka',
  initialDestinationId = 'cumilla',
}: SenderFlowWizardProps) {
  const [currentStep, setCurrentStep] = useState<SenderStep>(1);

  // Form State
  const [formData, setFormData] = useState<SenderFormData>({
    originId: initialOriginId,
    destinationId: initialDestinationId,
    originCityBn: 'ঢাকা',
    destinationCityBn: 'কুমিল্লা',
    parcel: {
      category: 'documents',
      categoryLabelBn: 'ডকুমেন্ট',
      weightKg: 1.5,
      size: 'medium',
      sizeLabelBn: 'মাঝারি (বক্স / প্যাকেট)',
      description: '',
    },
    urgency: 'today',
    urgencyLabelBn: 'আজই (একই দিনে ডেলিভারি)',
    targetTimeNoteBn: '',
    pickup: {
      areaName: 'ধানমন্ডি ২৭',
      landmark: 'রাপা প্লাজার সামনে',
      contactPhone: '০১৭১২-৩৪৫৬৭৮',
      approximateDistanceNoteBn: 'আনুমানিক ১.২ কিমি দূরে',
    },
  });

  // Selected Traveller for Step 6 & 7
  const [selectedTraveller, setSelectedTraveller] = useState<MatchingResult | null>(null);

  // Booking Confirmation Data for Step 7
  const [confirmationData, setConfirmationData] = useState<BookingConfirmationData | null>(null);

  // Current active route object
  const currentRoute = useMemo(() => {
    return (
      findRouteByEndpoints(formData.originId, formData.destinationId) ||
      NATIONWIDE_ROUTES.find((r) => r.originId === formData.originId) ||
      NATIONWIDE_ROUTES[0]
    );
  }, [formData.originId, formData.destinationId]);

  // BOHOK Phase 5: Dynamic Intelligent Matching Engine
  const matchedTravellers: MatchingResult[] = useMemo(() => {
    const originHub = CITY_HUBS.find((c) => c.id === currentRoute.originId) || CITY_HUBS[0];
    const destHub = CITY_HUBS.find((c) => c.id === currentRoute.destinationId) || CITY_HUBS[1];
    const basePrice = Math.round(currentRoute.distanceKm * 2.2 + formData.parcel.weightKg * 60);

    // 1. Prepare candidate pool from Phase 5 DEMO candidates + mapped route travellers
    const candidateMap = new Map<string, TravellerTripMatchCandidate>();

    // Add Phase 5 dedicated candidates
    DEMO_TRAVELLER_CANDIDATES.forEach((c) => {
      candidateMap.set(c.id, c);
    });

    // Also include travellers from DEMO_TRAVELLERS mapped to match format
    DEMO_TRAVELLERS.forEach((t) => {
      if (!candidateMap.has(t.id)) {
        const parts = t.routeId.split('-');
        const orig = parts[0] || 'dhaka';
        const dest = parts[1] || 'cumilla';
        const mode = t.vehicleModeBn.includes('কার')
          ? 'car'
          : t.vehicleModeBn.includes('ট্রেন')
          ? 'train'
          : t.vehicleModeBn.includes('বাইক')
          ? 'motorcycle'
          : 'bus';

        candidateMap.set(t.id, {
          id: t.id,
          travellerId: t.id,
          name: t.name,
          avatarInitials: t.avatarInitials,
          isVerified: t.isVerified,
          verificationBadgeText: t.verificationBadgeText,
          rating: t.rating,
          totalTripsCompleted: t.totalTripsCompleted,
          originId: orig,
          destinationId: dest,
          originAreaBn: t.originAreaBn,
          destinationAreaBn: t.destinationAreaBn,
          departureDate: t.departureDate,
          departureTime: t.departureTime,
          estimatedArrival: t.estimatedArrival,
          availableCapacityKg: t.availableCapacityKg,
          travelMode: mode as any,
          vehicleModeBn: t.vehicleModeBn,
          approximateDistanceKm: t.approximateDistanceKm,
          estimatedPrice: basePrice,
          allowedParcelTypes: t.allowedParcelTypes,
        });
      }
    });

    const allCandidates = Array.from(candidateMap.values());

    // 2. Formulate parcel requirement
    const requirement: ParcelMatchRequirement = {
      originId: formData.originId,
      destinationId: formData.destinationId,
      originCityBn: formData.originCityBn,
      destinationCityBn: formData.destinationCityBn,
      weightKg: formData.parcel.weightKg,
      size: formData.parcel.size,
      urgency: formData.urgency,
      pickupAreaBn: formData.pickup.areaName,
    };

    // 3. Execute matching algorithm
    const rankedResults = rankCandidates(
      requirement,
      allCandidates,
      DEFAULT_MATCHING_WEIGHTS,
      'best_match'
    );

    // 4. Map ranked results to MatchingResult
    return rankedResults.map((match, idx) => ({
      travellerId: match.traveller.id,
      name: match.traveller.name,
      avatarInitials: match.traveller.avatarInitials,
      isVerified: match.traveller.isVerified,
      verificationBadgeText: match.traveller.verificationBadgeText,
      rating: match.traveller.rating,
      totalTripsCompleted: match.traveller.totalTripsCompleted,
      routeTitleBn: `${match.traveller.originCityBn || originHub.nameBn} → ${match.traveller.destinationCityBn || destHub.nameBn}`,
      departureTime: match.traveller.departureTime,
      departureDate: match.traveller.departureDate,
      approximateDistanceKm: match.traveller.approximateDistanceKm,
      availableCapacityKg: match.traveller.availableCapacityKg,
      estimatedDeliveryTime: match.traveller.estimatedArrival,
      estimatedPrice: match.traveller.estimatedPrice || (basePrice + idx * 20),
      vehicleModeBn: match.traveller.vehicleModeBn,
      originAreaBn: match.traveller.originAreaBn,
      destinationAreaBn: match.traveller.destinationAreaBn,
      allowedParcelTypes: match.traveller.allowedParcelTypes,
      // Matching Intelligence
      matchScore: match.totalScore,
      compatibilityLevel: match.compatibilityLevel,
      breakdown: match.breakdown,
      reasons: match.reasons,
      reasonsSummaryBn: match.reasonsSummaryBn,
      isTopMatch: match.isTopMatch,
      disqualificationReasonBn: match.disqualificationReasonBn,
    }));
  }, [currentRoute, formData.originId, formData.destinationId, formData.parcel.weightKg, formData.urgency, formData.pickup.areaName]);

  // Handlers
  const handleOriginChange = (id: string) => {
    const city = CITY_HUBS.find((c) => c.id === id);
    setFormData((prev) => ({
      ...prev,
      originId: id,
      originCityBn: city?.nameBn || id,
    }));
  };

  const handleDestinationChange = (id: string) => {
    const city = CITY_HUBS.find((c) => c.id === id);
    setFormData((prev) => ({
      ...prev,
      destinationId: id,
      destinationCityBn: city?.nameBn || id,
    }));
  };

  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      originId: prev.destinationId,
      destinationId: prev.originId,
      originCityBn: prev.destinationCityBn,
      destinationCityBn: prev.originCityBn,
    }));
  };

  const handleSelectTraveller = (traveller: MatchingResult) => {
    setSelectedTraveller(traveller);
    setCurrentStep(6);
  };

  const { user } = useAuth();

  const handleConfirmBooking = () => {
    if (!selectedTraveller) return;

    // Connect to Phase 5.5 Marketplace State Architecture
    // 1. Ensure trip exists in marketplace store
    let trip = marketplaceStore.getTrip(selectedTraveller.travellerId);
    if (!trip) {
      trip = marketplaceStore.createTrip({
        id: selectedTraveller.travellerId,
        travellerId: `usr-${selectedTraveller.travellerId}`,
        origin: {
          hubId: formData.originId,
          hubNameBn: formData.originCityBn,
          areaNameBn: selectedTraveller.originAreaBn,
        },
        destination: {
          hubId: formData.destinationId,
          hubNameBn: formData.destinationCityBn,
          areaNameBn: selectedTraveller.destinationAreaBn,
        },
        waypoints: [],
        departureAt: new Date().toISOString(),
        departureTimeBn: selectedTraveller.departureTime,
        estimatedArrivalAt: new Date(Date.now() + 3 * 3600000).toISOString(),
        estimatedArrivalTimeBn: selectedTraveller.estimatedDeliveryTime,
        travelMode: 'car',
        travelModeBn: selectedTraveller.vehicleModeBn,
        availableCapacityKg: Math.max(selectedTraveller.availableCapacityKg, formData.parcel.weightKg),
        pickupPreference: 'along_route',
        pickupPreferenceBn: 'যাত্রাপথে',
        initialStatus: 'PUBLISHED',
      });
    }

    // 2. Create parcel in marketplace store using authenticated stable user ID
    const senderUserId = user?.id || 'user-sender-imam';
    const parcel = marketplaceStore.createParcel({
      senderId: senderUserId,
      origin: {
        hubId: formData.originId,
        hubNameBn: formData.originCityBn,
        areaNameBn: formData.pickup.areaName || 'পিকআপ পয়েন্ট',
      },
      destination: {
        hubId: formData.destinationId,
        hubNameBn: formData.destinationCityBn,
        areaNameBn: selectedTraveller.destinationAreaBn,
      },
      category: formData.parcel.category,
      categoryBn: formData.parcel.categoryLabelBn,
      weightKg: formData.parcel.weightKg,
      packageSize: formData.parcel.size,
      packageSizeBn: formData.parcel.sizeLabelBn,
      description: formData.parcel.description || 'ব্যক্তিগত পার্সেল',
      urgency: formData.urgency,
      urgencyBn: formData.urgencyLabelBn,
      requiredDeliveryAt: new Date(Date.now() + 6 * 3600000).toISOString(),
      pickupDetails: {
        areaNameBn: formData.pickup.areaName,
        landmarkBn: formData.pickup.landmark,
        contactPhone: formData.pickup.contactPhone,
      },
      initialStatus: 'SEARCHING',
    });

    // 3. Request & Accept Booking in marketplace store (locking capacity & dual OTPs)
    const booking = marketplaceStore.requestBooking(
      parcel.id,
      trip.id,
      selectedTraveller.estimatedPrice
    );
    marketplaceStore.acceptBooking(booking.id);
    const handover = marketplaceStore.getHandover(booking.id);

    // Register into Phase 7 Booking Domain Store
    const phase7Booking = defaultBookingStore.createBooking({
      parcelId: parcel.id,
      tripId: trip.id,
      senderId: user?.id || 'user-sender-imam',
      senderName: user?.name || 'ইমাম হাসান',
      senderPhone: user?.phone || '+880 1711-002233',
      recipientName: 'তানজিলা হক',
      recipientPhone: formData.pickup.contactPhone || '+880 1912-334455',
      travellerId: selectedTraveller.travellerId,
      travellerName: selectedTraveller.name,
      travellerPhone: '+880 1819-556677',
      travellerRating: selectedTraveller.rating,
      travellerAvatar: '👨‍💼',
      travellerVehicleBn: selectedTraveller.vehicleModeBn,
      originCityBn: formData.originCityBn,
      originAreaBn: formData.pickup.areaName,
      destinationCityBn: formData.destinationCityBn,
      destinationAreaBn: formData.destinationCityBn,
      routeBn: `${formData.originCityBn} → ${formData.destinationCityBn}`,
      corridorNameBn: `${formData.originCityBn} ↔ ${formData.destinationCityBn} করিডোর`,
      parcelTitleBn: `${formData.parcel.categoryLabelBn} (${formData.parcel.weightKg} কেজি)`,
      parcelCategoryBn: formData.parcel.categoryLabelBn,
      parcelWeightKg: formData.parcel.weightKg,
      parcelSizeBn: formData.parcel.sizeLabelBn,
      pickupEstimatedTimeBn: selectedTraveller.departureTime,
      deliveryEstimatedTimeBn: selectedTraveller.estimatedDeliveryTime,
      priceBreakdown: {
        travellerFee: selectedTraveller.estimatedPrice - 30,
        platformFee: 20,
        trustGuarantee: 10,
        total: selectedTraveller.estimatedPrice,
      },
    });

    const bookingId = phase7Booking.id;
    const randomOtp1 = phase7Booking.handover.otp1.split('').join(' ');
    const randomOtp2 = phase7Booking.delivery.otp2.split('').join(' ');

    const confirmation: BookingConfirmationData = {
      bookingId,
      routeBn: `${formData.originCityBn} ↔ ${formData.destinationCityBn}`,
      travellerName: selectedTraveller.name,
      travellerRating: selectedTraveller.rating,
      travellerVehicle: selectedTraveller.vehicleModeBn,
      parcelCategoryBn: formData.parcel.categoryLabelBn,
      weightKg: formData.parcel.weightKg,
      pickupArea: formData.pickup.areaName,
      pickupTimeEstimate: selectedTraveller.departureTime,
      deliveryTimeEstimate: selectedTraveller.estimatedDeliveryTime,
      price: selectedTraveller.estimatedPrice,
      pickupOtpCode: randomOtp1,
      dropoffOtpCode: randomOtp2,
      paymentStatus: 'demo_escrow_secured',
      createdAtBn: 'আজকে',
    };

    setConfirmationData(confirmation);
    setCurrentStep(7);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedTraveller(null);
    setConfirmationData(null);
  };

  // Animation variants for step transitions
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Step Indicator (Steps 1 to 6) */}
      {currentStep < 7 && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#FFE2CD] shadow-xs">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>
      )}

      {/* Dynamic Step View with Smooth Transitions */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#FFE2CD] shadow-xl">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step1Route
                originId={formData.originId}
                destinationId={formData.destinationId}
                onOriginChange={handleOriginChange}
                onDestinationChange={handleDestinationChange}
                onSwap={handleSwap}
                onNext={() => setCurrentStep(2)}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step2ParcelDetails
                parcel={formData.parcel}
                onChange={(updated) =>
                  setFormData((prev) => ({
                    ...prev,
                    parcel: { ...prev.parcel, ...updated },
                  }))
                }
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step3Urgency
                urgency={formData.urgency}
                targetTimeNote={formData.targetTimeNoteBn}
                onChangeUrgency={(urgency, label) =>
                  setFormData((prev) => ({
                    ...prev,
                    urgency,
                    urgencyLabelBn: label,
                  }))
                }
                onChangeNote={(note) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetTimeNoteBn: note,
                  }))
                }
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step4Pickup
                originId={formData.originId}
                destinationId={formData.destinationId}
                pickup={formData.pickup}
                onChange={(updated) =>
                  setFormData((prev) => ({
                    ...prev,
                    pickup: { ...prev.pickup, ...updated },
                  }))
                }
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step-5"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step5Matching
                originId={formData.originId}
                destinationId={formData.destinationId}
                matchedTravellers={matchedTravellers}
                onSelectTraveller={handleSelectTraveller}
                onBack={() => setCurrentStep(4)}
              />
            </motion.div>
          )}

          {currentStep === 6 && selectedTraveller && (
            <motion.div
              key="step-6"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step6Selection
                formData={formData}
                traveller={selectedTraveller}
                onConfirm={handleConfirmBooking}
                onBack={() => setCurrentStep(5)}
              />
            </motion.div>
          )}

          {currentStep === 7 && confirmationData && (
            <motion.div
              key="step-7"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step7Confirmation
                confirmation={confirmationData}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
