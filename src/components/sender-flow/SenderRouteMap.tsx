'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CITY_HUBS } from '@/data/cities';
import { findRouteByEndpoints, NATIONWIDE_ROUTES } from '@/data/routes';
import { MatchingResult } from '@/types/sender';
import { MapPin, Navigation, Shield, Compass } from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils';

interface SenderRouteMapProps {
  originId: string;
  destinationId: string;
  pickupAreaName?: string;
  matchedTravellers?: MatchingResult[];
  selectedTravellerId?: string;
  onSelectTraveller?: (id: string) => void;
  showPickupMarker?: boolean;
  className?: string;
}

export function SenderRouteMap({
  originId,
  destinationId,
  pickupAreaName = 'আপনার পিকআপ এলাকা',
  matchedTravellers = [],
  selectedTravellerId,
  onSelectTraveller,
  showPickupMarker = true,
  className = '',
}: SenderRouteMapProps) {
  // Find current route
  const currentRoute =
    findRouteByEndpoints(originId, destinationId) ||
    NATIONWIDE_ROUTES.find((r) => r.originId === originId) ||
    NATIONWIDE_ROUTES[0];

  const originHub = CITY_HUBS.find((c) => c.id === currentRoute.originId) || CITY_HUBS[0];
  const destHub = CITY_HUBS.find((c) => c.id === currentRoute.destinationId) || CITY_HUBS[1];

  // Selected traveller object
  const selectedTraveller = matchedTravellers.find((t) => t.travellerId === selectedTravellerId);

  // Approximate pickup point position near origin hub
  const pickupPos = {
    x: originHub.mapPosition.x - 12,
    y: originHub.mapPosition.y + 16,
  };

  return (
    <div
      className={`relative bg-[#FAFAF9] border border-[#FFE2CD] rounded-3xl overflow-hidden shadow-inner select-none ${className}`}
    >
      {/* Top Floating Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#FFE2CD] shadow-xs text-xs font-bold text-[#171717]">
        <Compass className="w-3.5 h-3.5 text-[#FF6B00]" />
        <span>
          রুট: {originHub.nameBn} → {destHub.nameBn} ({toBengaliNumerals(currentRoute.distanceKm)} কিমি)
        </span>
      </div>

      {/* Privacy Notice Badge */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#FFE2CD] text-[10px] text-[#6B6B6B]">
        <Shield className="w-3 h-3 text-[#16A34A]" />
        <span>প্রাইভেসি সুরক্ষিত: আনুমানিক এলাকা প্রদর্শিত</span>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-full object-cover min-h-[260px] sm:min-h-[320px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="senderRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#E85D04" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.9" />
          </linearGradient>

          <filter id="senderBeamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft Background Grid Dots */}
        <pattern id="dotPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#171717" fillOpacity="0.05" />
        </pattern>
        <rect width="1000" height="700" fill="url(#dotPattern)" />

        {/* Highway Base Line */}
        <path
          d={currentRoute.svgPath}
          fill="none"
          stroke="#FFE2CD"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Glowing Animated Active Corridor */}
        <motion.path
          d={currentRoute.svgPath}
          fill="none"
          stroke="url(#senderRouteGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="8 6"
          className="animate-route-flow"
          filter="url(#senderBeamGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Destination Hub Marker */}
        <g transform={`translate(${destHub.mapPosition.x}, ${destHub.mapPosition.y})`}>
          <circle r="18" fill="#FF6B00" fillOpacity="0.12" />
          <circle r="10" fill="#FF6B00" fillOpacity="0.25" />
          <circle r="6" fill="#FF6B00" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="-42" y="14" width="84" height="22" rx="6" fill="#171717" />
          <text x="0" y="29" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            {destHub.nameBn} গন্তব্য
          </text>
        </g>

        {/* Origin Hub Marker */}
        <g transform={`translate(${originHub.mapPosition.x}, ${originHub.mapPosition.y})`}>
          <circle r="16" fill="#171717" fillOpacity="0.1" />
          <circle r="6" fill="#171717" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="-38" y="-30" width="76" height="22" rx="6" fill="#171717" />
          <text x="0" y="-15" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            {originHub.nameBn} হাব
          </text>
        </g>

        {/* Pickup Approximate Location Marker & Privacy Boundary */}
        {showPickupMarker && (
          <g transform={`translate(${pickupPos.x}, ${pickupPos.y})`}>
            {/* Dashed approximate area circle */}
            <circle
              r="34"
              fill="#FF6B00"
              fillOpacity="0.08"
              stroke="#FF6B00"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Marker pin */}
            <circle r="8" fill="#FF6B00" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle r="3" fill="#FFFFFF" />

            {/* Label */}
            <g transform="translate(0, 20)">
              <rect x="-45" y="-9" width="90" height="18" rx="5" fill="#FF6B00" />
              <text x="0" y="4" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                পিকআপ: {pickupAreaName.slice(0, 10)}
              </text>
            </g>
          </g>
        )}

        {/* Matched Traveller Markers */}
        {matchedTravellers.map((trv, idx) => {
          const isSelected = trv.travellerId === selectedTravellerId;
          // Stagger mock traveller positions around origin/highway entry
          const offsetAngle = (idx * 65 * Math.PI) / 180;
          const trvX = originHub.mapPosition.x + Math.cos(offsetAngle) * (28 + idx * 7);
          const trvY = originHub.mapPosition.y + Math.sin(offsetAngle) * (24 + idx * 6);

          return (
            <motion.g
              key={trv.travellerId}
              transform={`translate(${trvX}, ${trvY})`}
              className="cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isSelected ? 1.25 : 1, opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => onSelectTraveller && onSelectTraveller(trv.travellerId)}
            >
              {/* Radar pulse for selected or first */}
              {isSelected && (
                <circle r="22" fill="#FF6B00" fillOpacity="0.3" className="animate-ping" />
              )}

              {/* Marker pin */}
              <circle
                r={isSelected ? '12' : '9'}
                fill={isSelected ? '#FF6B00' : '#FFFFFF'}
                stroke={isSelected ? '#FFFFFF' : '#FF6B00'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              <text
                x="0"
                y="3.5"
                fill={isSelected ? '#FFFFFF' : '#E85D04'}
                fontSize={isSelected ? '9' : '8'}
                fontWeight="bold"
                textAnchor="middle"
              >
                {trv.avatarInitials}
              </text>

              {/* Name Tag */}
              <g transform="translate(0, 18)">
                <rect
                  x="-32"
                  y="-8"
                  width="64"
                  height="16"
                  rx="4"
                  fill={isSelected ? '#171717' : '#FFFFFF'}
                  stroke={isSelected ? '#171717' : '#FFE2CD'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3"
                  fill={isSelected ? '#FFFFFF' : '#171717'}
                  fontSize="8.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {trv.name.split(' ')[0]}
                </text>
              </g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
