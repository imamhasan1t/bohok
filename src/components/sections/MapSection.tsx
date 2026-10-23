'use client';

import React from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { Traveller } from '@/types';

interface MapSectionProps {
  onSelectBooking?: (traveller: Traveller) => void;
  selectedRouteId?: string;
}

export function MapSection({ onSelectBooking, selectedRouteId = 'dhaka-cumilla' }: MapSectionProps) {
  return (
    <section id="map-section" className="py-16 sm:py-24 bg-[#FFF7F0]/40 border-y border-[#FFE2CD]/50 relative">
      <Container>
        <SectionHeading
          badgeText="সিগনেচার ইন্টারঅ্যাক্টিভ ম্যাপ"
          badgePulse
          title="সারাদেশে লাইভ সহযাত্রী ও"
          highlightText="পার্সেল প্রবাহ এক্সপ্লোরার"
          subtitle="ঢাকা ↔ কুমিল্লা পাইলট রুট ছাড়াও চট্টগ্রাম, ফেনী, নোয়াখালী, সিলেট, রাজশাহী ও খুলনার মতো প্রধান করিডোরে আপনার নিকটবর্তী যাচাইকৃত সহযাত্রীদের সাথে মুহূর্তেই সংযুক্ত হোন।"
        />

        <InteractiveMap
          onSelectBooking={onSelectBooking}
          initialRouteId={selectedRouteId}
        />
      </Container>
    </section>
  );
}
