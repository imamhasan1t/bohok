'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TravellerStep,
  TravellerTripData,
  TravelMode,
  PickupPreference,
  ParcelRequestItem,
} from '@/types/traveller';
import { CITY_HUBS } from '@/data/cities';
import { findRouteByEndpoints, NATIONWIDE_ROUTES } from '@/data/routes';
import { getParcelRequestsForRoute } from '@/data/parcel-requests';
import { marketplaceStore } from '@/lib/marketplace/marketplaceStore';
import { useAuth } from '@/lib/auth/useAuth';
import { TravellerStepIndicator } from './TravellerStepIndicator';
import { Step1Route } from './steps/Step1Route';
import { Step2Time } from './steps/Step2Time';
import { Step3Mode } from './steps/Step3Mode';
import { Step4Capacity } from './steps/Step4Capacity';
import { Step5PickupPreference } from './steps/Step5PickupPreference';
import { Step6Review } from './steps/Step6Review';
import { Step7Publish } from './steps/Step7Publish';

interface TravellerFlowWizardProps {
  initialOriginId?: string;
  initialDestinationId?: string;
}

export function TravellerFlowWizard({
  initialOriginId = 'dhaka',
  initialDestinationId = 'cumilla',
}: TravellerFlowWizardProps) {
  const [currentStep, setCurrentStep] = useState<TravellerStep>(1);

  // Active Route & Estimated Earning Computation
  const currentRoute = useMemo(() => {
    return (
      findRouteByEndpoints(initialOriginId, initialDestinationId) ||
      NATIONWIDE_ROUTES.find((r) => r.originId === initialOriginId) ||
      NATIONWIDE_ROUTES[0]
    );
  }, [initialOriginId, initialDestinationId]);

  // Trip Form State
  const [tripData, setTripData] = useState<TravellerTripData>({
    id: `trip-${Date.now()}`,
    originId: initialOriginId,
    destinationId: initialDestinationId,
    originCityBn: 'ঢাকা',
    destinationCityBn: 'কুমিল্লা',
    departureDate: 'আজকে',
    departureTime: 'বিকেল ৪:৩০ - ৫:৩০',
    estimatedArrival: 'রাত ৭:৩০ - ৮:৩০',
    travelMode: 'bus',
    travelModeLabelBn: 'বাস',
    vehicleNameOptional: 'পদ্মা এক্সপ্রেস এসি',
    capacityKg: 2.0,
    capacitySize: 'medium',
    capacitySizeLabelBn: 'মাঝারি (বক্স / প্যাকেট)',
    pickupPreference: 'along_route',
    pickupPreferenceLabelBn: 'যাত্রাপথের কাছাকাছি',
    preferredPickupAreaName: 'সায়েদাবাদ বাস টার্মিনাল এলাকা',
    status: 'draft',
    potentialEarningsEstimate: 360,
    acceptedParcels: [],
    createdAtBn: 'আজকে',
  });

  // Dynamic Matching Parcel Requests for Current Route
  const [availableRequests, setAvailableRequests] = useState<ParcelRequestItem[]>([]);

  // Calculate dynamic potential earnings based on distance and capacity
  const computedEarnings = useMemo(() => {
    const route = findRouteByEndpoints(tripData.originId, tripData.destinationId) || currentRoute;
    return Math.round(route.distanceKm * 1.8 + tripData.capacityKg * 70);
  }, [tripData.originId, tripData.destinationId, tripData.capacityKg, currentRoute]);

  // Update potential earnings in state
  React.useEffect(() => {
    setTripData((prev) => ({
      ...prev,
      potentialEarningsEstimate: computedEarnings,
    }));
  }, [computedEarnings]);

  // Handlers for Step 1
  const handleOriginChange = (id: string) => {
    const city = CITY_HUBS.find((c) => c.id === id);
    setTripData((prev) => ({
      ...prev,
      originId: id,
      originCityBn: city?.nameBn || id,
    }));
  };

  const handleDestinationChange = (id: string) => {
    const city = CITY_HUBS.find((c) => c.id === id);
    setTripData((prev) => ({
      ...prev,
      destinationId: id,
      destinationCityBn: city?.nameBn || id,
    }));
  };

  const handleSwap = () => {
    setTripData((prev) => ({
      ...prev,
      originId: prev.destinationId,
      destinationId: prev.originId,
      originCityBn: prev.destinationCityBn,
      destinationCityBn: prev.originCityBn,
    }));
  };

  // Handlers for Step 2
  const handleDateChange = (date: string) => {
    setTripData((prev) => ({ ...prev, departureDate: date }));
  };

  const handleTimeChange = (time: string, arrival: string) => {
    setTripData((prev) => ({
      ...prev,
      departureTime: time,
      estimatedArrival: arrival,
    }));
  };

  // Handlers for Step 3
  const handleModeChange = (mode: TravelMode, labelBn: string) => {
    setTripData((prev) => ({
      ...prev,
      travelMode: mode,
      travelModeLabelBn: labelBn,
    }));
  };

  // Handlers for Step 4
  const handleKgChange = (kg: number) => {
    setTripData((prev) => ({ ...prev, capacityKg: kg }));
  };

  const handleSizeChange = (size: 'small' | 'medium' | 'large', labelBn: string) => {
    setTripData((prev) => ({
      ...prev,
      capacitySize: size,
      capacitySizeLabelBn: labelBn,
    }));
  };

  // Handlers for Step 5
  const handlePreferenceChange = (pref: PickupPreference, labelBn: string) => {
    setTripData((prev) => ({
      ...prev,
      pickupPreference: pref,
      pickupPreferenceLabelBn: labelBn,
    }));
  };

  const handleAreaNameChange = (name: string) => {
    setTripData((prev) => ({
      ...prev,
      preferredPickupAreaName: name,
    }));
  };

  const { user } = useAuth();

  // Publishing Journey (Step 6 -> Step 7)
  const handlePublishJourney = () => {
    const route = findRouteByEndpoints(tripData.originId, tripData.destinationId) || currentRoute;
    const requests = getParcelRequestsForRoute(route.id);

    // Synchronize published trip with Phase 5.5 Marketplace State Store using stable auth ID
    const travellerUserId = user?.id || 'user-traveller-rahim';
    const registeredTrip = marketplaceStore.createTrip({
      id: tripData.id || `trip-trv-${Date.now()}`,
      travellerId: travellerUserId,
      origin: {
        hubId: tripData.originId,
        hubNameBn: tripData.originCityBn,
        areaNameBn: tripData.preferredPickupAreaName || 'শহর কেন্দ্র',
      },
      destination: {
        hubId: tripData.destinationId,
        hubNameBn: tripData.destinationCityBn,
        areaNameBn: 'গন্তব্য বাস টার্মিনাল',
      },
      waypoints: [],
      departureAt: new Date().toISOString(),
      departureTimeBn: tripData.departureTime,
      estimatedArrivalAt: new Date(Date.now() + 3.5 * 3600000).toISOString(),
      estimatedArrivalTimeBn: tripData.estimatedArrival,
      travelMode: tripData.travelMode,
      travelModeBn: tripData.travelModeLabelBn,
      availableCapacityKg: tripData.capacityKg,
      pickupPreference: tripData.pickupPreference,
      pickupPreferenceBn: tripData.pickupPreferenceLabelBn,
      initialStatus: 'PUBLISHED',
    });

    setAvailableRequests(requests);
    setTripData((prev) => ({
      ...prev,
      id: registeredTrip.id,
      status: 'active',
    }));
    setCurrentStep(7);
  };

  // Marketplace Handlers in Step 7
  const handleAcceptParcelRequest = (req: ParcelRequestItem) => {
    // 1. Create or register parcel in marketplace store
    let parcel = marketplaceStore.getParcel(req.id);
    if (!parcel) {
      parcel = marketplaceStore.createParcel({
        id: req.id,
        senderId: `user-sender-${req.id}`,
        origin: {
          hubId: req.originId,
          hubNameBn: tripData.originCityBn,
          areaNameBn: req.pickupAreaBn,
        },
        destination: {
          hubId: req.destinationId,
          hubNameBn: tripData.destinationCityBn,
          areaNameBn: req.destinationAreaBn,
        },
        category: 'other_permitted',
        categoryBn: req.categoryBn,
        weightKg: req.weightKg,
        packageSize: 'medium',
        packageSizeBn: req.sizeLabelBn,
        description: req.itemDescriptionBn,
        urgency: 'today',
        urgencyBn: req.urgencyLabelBn,
        requiredDeliveryAt: new Date(Date.now() + 6 * 3600000).toISOString(),
        pickupDetails: {
          areaNameBn: req.pickupAreaBn,
          landmarkBn: 'নির্ধারিত পিকআপ হাব',
          contactPhone: '০১৭০০০০০০০০',
        },
        initialStatus: 'SEARCHING',
      });
    }

    // 2. Request and accept booking in state store (decrements trip remaining capacity)
    try {
      const booking = marketplaceStore.requestBooking(
        parcel.id,
        tripData.id,
        req.estimatedEarning
      );
      marketplaceStore.acceptBooking(booking.id);
    } catch (err) {
      console.warn('Booking acceptance in marketplace store:', err);
    }

    setTripData((prev) => ({
      ...prev,
      acceptedParcels: [...prev.acceptedParcels, req],
    }));

    setAvailableRequests((prev) =>
      prev.map((item) => (item.id === req.id ? { ...item, status: 'accepted' } : item))
    );
  };

  const handleDeclineParcelRequest = (requestId: string) => {
    setAvailableRequests((prev) => prev.filter((item) => item.id !== requestId));
  };

  const handleResetTrip = () => {
    setCurrentStep(1);
    setTripData((prev) => ({
      ...prev,
      status: 'draft',
      acceptedParcels: [],
    }));
  };

  // Step transition animation variants
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
          <TravellerStepIndicator
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
                originId={tripData.originId}
                destinationId={tripData.destinationId}
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
              <Step2Time
                departureDate={tripData.departureDate}
                departureTime={tripData.departureTime}
                estimatedArrival={tripData.estimatedArrival}
                onChangeDate={handleDateChange}
                onChangeTime={handleTimeChange}
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
              <Step3Mode
                travelMode={tripData.travelMode}
                vehicleName={tripData.vehicleNameOptional || ''}
                onChangeMode={handleModeChange}
                onChangeVehicleName={(name) =>
                  setTripData((prev) => ({ ...prev, vehicleNameOptional: name }))
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
              <Step4Capacity
                capacityKg={tripData.capacityKg}
                capacitySize={tripData.capacitySize}
                onChangeKg={handleKgChange}
                onChangeSize={handleSizeChange}
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
              <Step5PickupPreference
                originId={tripData.originId}
                destinationId={tripData.destinationId}
                pickupPreference={tripData.pickupPreference}
                preferredPickupAreaName={tripData.preferredPickupAreaName}
                onChangePreference={handlePreferenceChange}
                onChangeAreaName={handleAreaNameChange}
                onNext={() => setCurrentStep(6)}
                onBack={() => setCurrentStep(4)}
              />
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step-6"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step6Review
                tripData={tripData}
                onPublish={handlePublishJourney}
                onBack={() => setCurrentStep(5)}
              />
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div
              key="step-7"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Step7Publish
                tripData={tripData}
                availableRequests={availableRequests}
                onAcceptRequest={handleAcceptParcelRequest}
                onDeclineRequest={handleDeclineParcelRequest}
                onResetTrip={handleResetTrip}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
