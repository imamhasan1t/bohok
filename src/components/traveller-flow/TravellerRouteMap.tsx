'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CITY_HUBS } from '@/data/cities';
import { findRouteByEndpoints, NATIONWIDE_ROUTES } from '@/data/routes';
import { ParcelRequestItem } from '@/types/traveller';
import { MapPin, Navigation, Compass, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils';

interface TravellerRouteMapProps {
  originId: string;
  destinationId: string;
  preferredPickupArea?: string;
  parcelRequests?: ParcelRequestItem[];
  selectedParcelId?: string;
  onSelectParcel?: (parcelId: string) => void;
  className?: string;
}

export function TravellerRouteMap({
  originId,
  destinationId,
  preferredPickupArea = 'আমার কাছাকাছি এলাকা',
  parcelRequests = [],
  selectedParcelId,
  onSelectParcel,
  className = '',
}: TravellerRouteMapProps) {
  // Find current route
  const currentRoute =
    findRouteByEndpoints(originId, destinationId) ||
    NATIONWIDE_ROUTES.find((r) => r.originId === originId) ||
    NATIONWIDE_ROUTES[0];

  const originHub = CITY_HUBS.find((c) => c.id === currentRoute.originId) || CITY_HUBS[0];
  const destHub = CITY_HUBS.find((c) => c.id === currentRoute.destinationId) || CITY_HUBS[1];

  const selectedParcel = parcelRequests.find((p) => p.id === selectedParcelId);

  // Traveller's approximate departure point
  const travellerStartPos = {
    x: originHub.mapPosition.x,
    y: originHub.mapPosition.y,
  };

  return (
    <div className={`relative bg-[#FAFAF9] border border-[#FFE2CD] rounded-3xl overflow-hidden shadow-inner select-none ${className}`}>
      {/* Top Floating Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#FFE2CD] shadow-xs text-xs font-bold text-[#171717]">
        <Compass className="w-3.5 h-3.5 text-[#FF6B00]" />
        <span>
          আপনার যাত্রাপথ: {originHub.nameBn} → {destHub.nameBn} (~{toBengaliNumerals(currentRoute.distanceKm)} কিমি)
        </span>
      </div>

      {/* Selected Match Indicator Badge */}
      {selectedParcel && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-[#FFF7F0] px-3 py-1.5 rounded-xl border border-[#FF6B00] shadow-sm text-xs font-bold text-[#E85D04]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
          <span>পারফেক্ট ম্যাচ: {selectedParcel.titleBn.slice(0, 15)}...</span>
        </motion.div>
      )}

      {/* SVG Vector Canvas */}
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-full object-cover min-h-[260px] sm:min-h-[340px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="travellerRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E85D04" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.9" />
          </linearGradient>

          <filter id="travellerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft Background Grid Dots */}
        <pattern id="dotPatternTraveller" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#171717" fillOpacity="0.05" />
        </pattern>
        <rect width="1000" height="700" fill="url(#dotPatternTraveller)" />

        {/* Highway Base Line */}
        <path
          d={currentRoute.svgPath}
          fill="none"
          stroke="#FFE2CD"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Glowing Animated Active Highway Route */}
        <motion.path
          d={currentRoute.svgPath}
          fill="none"
          stroke="url(#travellerRouteGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="8 6"
          className="animate-route-flow"
          filter="url(#travellerGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Destination City Hub Marker */}
        <g transform={`translate(${destHub.mapPosition.x}, ${destHub.mapPosition.y})`}>
          <circle r="18" fill="#FF6B00" fillOpacity="0.12" />
          <circle r="9" fill="#FF6B00" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="-42" y="14" width="84" height="22" rx="6" fill="#171717" />
          <text x="0" y="29" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            {destHub.nameBn} গন্তব্য
          </text>
        </g>

        {/* Traveller Departure Hub & Safety Zone */}
        <g transform={`translate(${travellerStartPos.x}, ${travellerStartPos.y})`}>
          <circle r="36" fill="#FF6B00" fillOpacity="0.08" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle r="16" fill="#171717" fillOpacity="0.15" />
          <circle r="8" fill="#171717" stroke="#FFFFFF" strokeWidth="2.5" />
          <rect x="-45" y="-30" width="90" height="22" rx="6" fill="#171717" />
          <text x="0" y="-15" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            {originHub.nameBn} আপনার যাত্রা
          </text>
        </g>

        {/* Matching Parcel Request Markers Along Route */}
        {parcelRequests.map((req, idx) => {
          const isSelected = req.id === selectedParcelId;
          const isAccepted = req.status === 'accepted';
          const offset = req.pickupCoordinatesOffset || { x: (idx + 1) * 12, y: (idx + 1) * 8 };
          const markerX = originHub.mapPosition.x + offset.x;
          const markerY = originHub.mapPosition.y + offset.y;

          return (
            <motion.g
              key={req.id}
              transform={`translate(${markerX}, ${markerY})`}
              className="cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isSelected ? 1.25 : 1, opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => onSelectParcel && onSelectParcel(req.id)}
            >
              {/* Highlight Halo when selected */}
              {isSelected && (
                <circle r="22" fill="#FF6B00" fillOpacity="0.3" className="animate-ping" />
              )}

              {/* Marker Circle */}
              <circle
                r={isSelected ? '12' : '9.5'}
                fill={isAccepted ? '#16A34A' : isSelected ? '#FF6B00' : '#FFFFFF'}
                stroke={isAccepted ? '#FFFFFF' : isSelected ? '#FFFFFF' : '#FF6B00'}
                strokeWidth={isSelected ? '3' : '2'}
              />

              {/* Icon / Symbol */}
              <text
                x="0"
                y="3.5"
                fill={isAccepted ? '#FFFFFF' : isSelected ? '#FFFFFF' : '#FF6B00'}
                fontSize={isSelected ? '9' : '8'}
                fontWeight="bold"
                textAnchor="middle"
              >
                {isAccepted ? '✓' : '📦'}
              </text>

              {/* Tag / Label */}
              <g transform="translate(0, 18)">
                <rect
                  x="-36"
                  y="-8"
                  width="72"
                  height="16"
                  rx="4"
                  fill={isAccepted ? '#16A34A' : isSelected ? '#171717' : '#FFFFFF'}
                  stroke={isAccepted ? '#16A34A' : isSelected ? '#171717' : '#FFE2CD'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3"
                  fill={isAccepted || isSelected ? '#FFFFFF' : '#171717'}
                  fontSize="8.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {isAccepted ? 'যুক্ত হয়েছে' : `+৳${req.estimatedEarning}`}
                </text>
              </g>
            </motion.g>
          );
        })}
      </svg>

      {/* Bottom Privacy Notice */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#FFE2CD] text-[10px] text-[#6B6B6B]">
        <Shield className="w-3 h-3 text-[#16A34A]" />
        <span>প্রাইভেসি নিরাপত্তা: সম্ভাব্য পিকআপ এলাকা আনুমানিকভাবে প্রদর্শিত</span>
      </div>
    </div>
  );
}
