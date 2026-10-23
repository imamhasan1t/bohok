'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { MapSection } from '@/components/sections/MapSection';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { TrustSafety } from '@/components/sections/TrustSafety';
import { TravellerSection } from '@/components/sections/TravellerSection';
import { SenderSection } from '@/components/sections/SenderSection';
import { RouteExplorer } from '@/components/sections/RouteExplorer';
import { FAQSection } from '@/components/sections/FAQSection';
import { SendParcelModal } from '@/components/modals/SendParcelModal';
import { PostTripModal } from '@/components/modals/PostTripModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { Traveller } from '@/types';

export default function HomePage() {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('dhaka-cumilla');
  const [selectedTravellerForBooking, setSelectedTravellerForBooking] = useState<Traveller | null>(null);

  const handleSelectTravellerFromMap = (traveller: Traveller) => {
    setSelectedTravellerForBooking(traveller);
    setIsSendModalOpen(true);
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Navbar */}
      <Navbar
        onOpenSendModal={() => setIsSendModalOpen(true)}
        onOpenTripModal={() => setIsTripModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          onOpenSendModal={() => setIsSendModalOpen(true)}
          onOpenTripModal={() => setIsTripModalOpen(true)}
          onSelectRoutePreview={handleSelectRoute}
        />

        {/* 3. Signature Interactive Map Section */}
        <MapSection
          onSelectBooking={handleSelectTravellerFromMap}
          selectedRouteId={selectedRouteId}
        />

        {/* 4. How It Works */}
        <HowItWorks />

        {/* 5. Trust & Safety */}
        <TrustSafety />

        {/* 6. Traveller Section ("যাত্রার সাথে আয় করুন") */}
        <TravellerSection onOpenTripModal={() => setIsTripModalOpen(true)} />

        {/* 7. Sender Section ("জরুরি পার্সেল দ্রুত পাঠান") */}
        <SenderSection onOpenSendModal={() => setIsSendModalOpen(true)} />

        {/* 8. Route Explorer */}
        <RouteExplorer
          onSelectRouteOnMap={handleSelectRoute}
          onOpenSendModal={() => setIsSendModalOpen(true)}
        />

        {/* 9. FAQ Section */}
        <FAQSection />
      </main>

      {/* 10. Footer */}
      <Footer />

      {/* Interactive Prototype Modals */}
      <SendParcelModal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setSelectedTravellerForBooking(null);
        }}
      />

      <PostTripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
