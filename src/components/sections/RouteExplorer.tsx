'use client';

import React from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { NATIONWIDE_ROUTES } from '@/data/routes';
import { toBengaliNumerals } from '@/lib/utils';
import {
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface RouteExplorerProps {
  onSelectRouteOnMap?: (routeId: string) => void;
  onOpenSendModal?: () => void;
}

export function RouteExplorer({ onSelectRouteOnMap, onOpenSendModal }: RouteExplorerProps) {
  const handleViewOnMap = (routeId: string) => {
    if (onSelectRouteOnMap) {
      onSelectRouteOnMap(routeId);
    }
    const mapElement = document.getElementById('map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="route-explorer" className="py-20 sm:py-28 bg-white">
      <Container>
        <SectionHeading
          badgeText="সারাদেশের রুট নেটওয়ার্ক"
          title="রুট এক্সপ্লোরার"
          highlightText="প্রধান জাতীয় করিডোরসমূহ"
          subtitle="পাইলট রুট ঢাকা ↔ কুমিল্লা ছাড়াও দেশের প্রতিটি প্রধান আঞ্চলিক সংযোগ করিডোরে ছড়িয়ে পড়ছে বোহক ক্রাউডশিপিং নেটওয়ার্ক।"
        />

        {/* Demo Data Disclaimer */}
        <div className="mb-10 bg-[#FFF7F0] border border-[#FFE2CD] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#E85D04]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              বিজ্ঞপ্তি: ঢাকা ↔ কুমিল্লা ব্যতীত অন্যান্য রুটগুলোর পরিসংখ্যান প্রাথমিক সমীক্ষা ও ডেমো প্রিভিউ হিসেবে দেখানো হয়েছে।
            </span>
          </div>
          <Badge variant="demo" className="shrink-0">
            ডেমো ডেটা মডেল
          </Badge>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {NATIONWIDE_ROUTES.slice(0, 8).map((route) => {
            const isPilot = route.status === 'pilot_active';

            return (
              <Card
                key={route.id}
                interactive
                borderAccent={isPilot}
                className={`flex flex-col justify-between p-6 relative ${
                  isPilot
                    ? 'ring-2 ring-[#FF6B00]/25 bg-gradient-to-b from-white to-[#FFF7F0]/40'
                    : 'bg-white'
                }`}
                onClick={() => handleViewOnMap(route.id)}
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    {isPilot ? (
                      <Badge variant="verified" pulse>
                        পাইলট সক্রিয়
                      </Badge>
                    ) : (
                      <Badge variant="softOrange">
                        করিডোর প্রস্তুত
                      </Badge>
                    )}
                    <span className="text-xs font-semibold text-[#6B6B6B]">
                      ~{toBengaliNumerals(route.distanceKm)} কিমি
                    </span>
                  </div>

                  {/* Route Name */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-xl font-bold text-[#171717]">
                      <span>{route.fromBn}</span>
                      <span className="text-[#FF6B00]">→</span>
                      <span>{route.toBn}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>গড় সময়: {route.estimatedHours}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4 line-clamp-2">
                    {route.descriptionBn}
                  </p>

                  {/* Key Stops Preview */}
                  <div className="space-y-1.5 py-3 border-y border-[#F0ECE7] mb-4 text-xs">
                    <span className="text-[11px] font-bold text-[#171717] block">
                      প্রধান স্টপ বা হাব:
                    </span>
                    <ul className="space-y-1 text-[#6B6B6B]">
                      {route.waypoints.slice(0, 2).map((stop) => (
                        <li key={stop.id} className="flex items-center gap-1.5 text-[11px] truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                          <span className="truncate">{stop.nameBn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isPilot ? 'primary' : 'softOrange'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOnMap(route.id);
                    }}
                    className="w-full justify-center text-xs py-2"
                    rightIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    ম্যাপে রুটটি দেখুন
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
