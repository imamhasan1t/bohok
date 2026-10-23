'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NATIONWIDE_ROUTES, findRouteByEndpoints } from '@/data/routes';
import { CITY_HUBS } from '@/data/cities';
import { DEMO_TRAVELLERS, getTravellersForRoute } from '@/data/travellers';
import { NationwideRoute, Traveller } from '@/types';
import { TravellerCard } from './TravellerCard';
import { RouteSearchPanel } from './RouteSearchPanel';
import { ParcelJourneyFlow } from './ParcelJourneyFlow';
import { Badge } from '@/components/common/Badge';
import { toBengaliNumerals } from '@/lib/utils';
import {
  Navigation,
  MapPin,
  Shield,
  Layers,
  RotateCcw,
  Sparkles,
  Info,
  Radio,
  Eye,
  CheckCircle,
  Users,
  Compass,
  ArrowRight,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface InteractiveMapProps {
  onSelectBooking?: (traveller: Traveller) => void;
  initialRouteId?: string;
}

export function InteractiveMap({ onSelectBooking, initialRouteId = 'dhaka-cumilla' }: InteractiveMapProps) {
  // Active route state
  const [activeRouteId, setActiveRouteId] = useState<string>(initialRouteId);
  const currentRoute = useMemo(() => {
    return NATIONWIDE_ROUTES.find((r) => r.id === activeRouteId) || NATIONWIDE_ROUTES[0];
  }, [activeRouteId]);

  // Origin & Destination endpoints for search
  const [originId, setOriginId] = useState<string>(currentRoute.originId);
  const [destinationId, setDestinationId] = useState<string>(currentRoute.destinationId);
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');

  // Travellers for current route & filter
  const routeTravellers = useMemo(() => {
    const list = getTravellersForRoute(currentRoute.id);
    if (timeFilter === 'all') return list;
    return list.filter((t) => t.departurePeriod === timeFilter);
  }, [currentRoute.id, timeFilter]);

  // Selected traveller
  const [selectedTravellerId, setSelectedTravellerId] = useState<string>(
    routeTravellers[0]?.id || 'trv-1'
  );

  // Sync selected traveller when route changes
  useEffect(() => {
    if (routeTravellers.length > 0) {
      // Pick featured or first
      const featured = routeTravellers.find((t) => t.isFeatured) || routeTravellers[0];
      setSelectedTravellerId(featured.id);
    }
  }, [routeTravellers]);

  const selectedTraveller = useMemo(() => {
    return (
      routeTravellers.find((t) => t.id === selectedTravellerId) ||
      DEMO_TRAVELLERS.find((t) => t.id === selectedTravellerId) ||
      routeTravellers[0] ||
      DEMO_TRAVELLERS[0]
    );
  }, [routeTravellers, selectedTravellerId]);

  // Parcel Animation along the highway route
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<boolean>(true);
  const [journeyProgress, setJourneyProgress] = useState<number>(15);

  useEffect(() => {
    if (!isAnimationPlaying) return;
    const interval = setInterval(() => {
      setJourneyProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1.25;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isAnimationPlaying]);

  // Determine which of the 5 journey steps is active based on progress (0-100%)
  const currentJourneyStageIndex = useMemo(() => {
    if (journeyProgress < 15) return 0; // Sender
    if (journeyProgress < 35) return 1; // Pickup
    if (journeyProgress < 75) return 2; // Traveller en-route
    if (journeyProgress < 90) return 3; // Destination arrival
    return 4; // Recipient handover
  }, [journeyProgress]);

  // Smooth ViewBox camera interpolation
  const defaultViewBox = { x: 440, y: 280, width: 280, height: 200 };
  const targetViewBox = currentRoute.cameraViewBox || defaultViewBox;

  // Handle route endpoint swap
  const handleSwapEndpoints = () => {
    const newOrigin = destinationId;
    const newDest = originId;
    setOriginId(newOrigin);
    setDestinationId(newDest);

    const swappedRoute = findRouteByEndpoints(newOrigin, newDest);
    if (swappedRoute) {
      setActiveRouteId(swappedRoute.id);
    }
  };

  // Handle endpoint selection change
  const handleOriginChange = (newOrigin: string) => {
    setOriginId(newOrigin);
    const match = findRouteByEndpoints(newOrigin, destinationId);
    if (match) {
      setActiveRouteId(match.id);
    } else {
      // Find any route with this origin
      const anyRoute = NATIONWIDE_ROUTES.find((r) => r.originId === newOrigin);
      if (anyRoute) {
        setDestinationId(anyRoute.destinationId);
        setActiveRouteId(anyRoute.id);
      }
    }
  };

  const handleDestinationChange = (newDest: string) => {
    setDestinationId(newDest);
    const match = findRouteByEndpoints(originId, newDest);
    if (match) {
      setActiveRouteId(match.id);
    } else {
      // Find any route with this destination
      const anyRoute = NATIONWIDE_ROUTES.find((r) => r.destinationId === newDest);
      if (anyRoute) {
        setOriginId(anyRoute.originId);
        setActiveRouteId(anyRoute.id);
      }
    }
  };

  const handleSearchSubmit = () => {
    const match = findRouteByEndpoints(originId, destinationId);
    if (match) {
      setActiveRouteId(match.id);
    }
  };

  // Helper to approximate parcel position along SVG path
  // Coordinate calculations based on origin to destination interpolation
  const originHub = CITY_HUBS.find((c) => c.id === currentRoute.originId) || CITY_HUBS[0];
  const destHub = CITY_HUBS.find((c) => c.id === currentRoute.destinationId) || CITY_HUBS[1];

  const t = journeyProgress / 100;
  // Non-linear ease for natural highway acceleration and deceleration
  const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const currentParcelX = originHub.mapPosition.x + (destHub.mapPosition.x - originHub.mapPosition.x) * easedT;
  const currentParcelY = originHub.mapPosition.y + (destHub.mapPosition.y - originHub.mapPosition.y) * easedT;

  // Selected traveller position for privacy mask
  const selectedPos = selectedTraveller?.mapPosition || originHub.mapPosition;

  // Active City Hubs on map
  const routeWaypoints = currentRoute.waypoints || [];

  return (
    <div className="w-full">
      {/* 1. Route Search Panel */}
      <RouteSearchPanel
        originId={originId}
        destinationId={destinationId}
        timeFilter={timeFilter}
        onOriginChange={handleOriginChange}
        onDestinationChange={handleDestinationChange}
        onTimeFilterChange={setTimeFilter}
        onSwapEndpoints={handleSwapEndpoints}
        onSearchSubmit={handleSearchSubmit}
        isPilotActive={currentRoute.status === 'pilot_active'}
      />

      {/* 2. Map Stage Container */}
      <div className="relative bg-[#FAFAF9] border border-[#FFE2CD] rounded-3xl overflow-hidden shadow-2xl min-h-[620px] lg:min-h-[680px] flex flex-col">
        {/* Floating Top UI Stats Cards (Prompt Section 5) */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          {/* Card 1: আপনার কাছাকাছি */}
          <motion.div
            key={`stat-1-${currentRoute.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-[#FFE2CD] shadow-sm flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
                আপনার কাছাকাছি
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-[#171717] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>
                  {toBengaliNumerals(currentRoute.stats.nearbyTravellersCount)} জন যাচ্ছেন এই পথে
                </span>
              </p>
            </div>
          </motion.div>

          {/* Card 2: সবচেয়ে কাছের যাত্রী */}
          <motion.div
            key={`stat-2-${currentRoute.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-[#FFE2CD] shadow-sm flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
                সবচেয়ে কাছের যাত্রী
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-[#171717]">
                প্রায় {toBengaliNumerals(currentRoute.stats.nearestDistanceKm)} কিমি দূরে
              </p>
            </div>
          </motion.div>

          {/* Card 3: আজকের সম্ভাব্য ম্যাচ */}
          <motion.div
            key={`stat-3-${currentRoute.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="pointer-events-auto hidden sm:flex bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-[#FFE2CD] shadow-sm items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FFF7F0] flex items-center justify-center text-[#E85D04]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block">
                আজকের সম্ভাব্য ম্যাচ
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-[#171717]">
                {toBengaliNumerals(currentRoute.stats.todayPotentialMatches)}টি ট্রিপ প্রস্তুত
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Vector SVG Mobility Stage */}
        <div className="relative w-full flex-1 min-h-[460px] sm:min-h-[520px] lg:min-h-[640px] overflow-hidden select-none">
          {/* Subtle mobility grid dots */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#171717 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Smooth Animating SVG Canvas */}
          <motion.svg
            viewBox="0 0 1000 700"
            className="w-full h-full object-cover min-w-[700px] lg:min-w-full"
            preserveAspectRatio="xMidYMid meet"
            animate={{
              // Gentle camera panning toward active corridor
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <defs>
              {/* Route Glow & Gradients */}
              <linearGradient id="routeGradientBohok" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#E85D04" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.9" />
              </linearGradient>

              <filter id="routeBeamGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF6B00" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Major Bangladeshi River Channels (Clean Soft Blue) */}
            <g className="opacity-45">
              {/* Mighty Padma River Corridor */}
              <path
                d="M 280 320 Q 380 350, 480 410 T 580 450 T 680 520"
                fill="none"
                stroke="#CCE4F7"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <text x="360" y="380" fill="#60A5FA" fontSize="11" fontWeight="600" fontStyle="italic">
                পদ্মা নদী (মাওয়া সেতু)
              </text>

              {/* Jamuna River Channel */}
              <path
                d="M 380 120 Q 375 220, 380 275 T 395 340"
                fill="none"
                stroke="#BFDBFE"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <text x="310" y="220" fill="#60A5FA" fontSize="11" fontWeight="600" fontStyle="italic">
                যমুনা নদী (বঙ্গবন্ধু সেতু)
              </text>

              {/* Meghna River Corridor */}
              <path
                d="M 590 180 Q 595 280, 595 378 T 630 490 T 670 560"
                fill="none"
                stroke="#BFDBFE"
                strokeWidth="26"
                strokeLinecap="round"
              />
              <text x="615" y="310" fill="#60A5FA" fontSize="11" fontWeight="600" fontStyle="italic">
                মেঘনা নদী (দাউদকান্দি ও ভৈরব)
              </text>

              {/* Surma River near Sylhet */}
              <path
                d="M 720 150 Q 760 165, 810 160"
                fill="none"
                stroke="#DBEAFE"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Karnaphuli River near Chattogram */}
              <path
                d="M 760 520 Q 790 530, 830 550"
                fill="none"
                stroke="#DBEAFE"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </g>

            {/* Background Inter-District Highway Grid (Light Grey Transit Network) */}
            <g stroke="#E7E5E4" strokeWidth="2.5" fill="none" opacity="0.6">
              {/* N1 Corridor */}
              <path d="M 520 350 L 640 395 L 700 445 L 790 530" />
              {/* N2 Corridor */}
              <path d="M 520 350 L 600 290 L 710 210 L 770 170" />
              {/* N5 / N6 Corridor */}
              <path d="M 520 350 L 440 290 L 380 275 L 250 280" />
              {/* N8 Corridor */}
              <path d="M 520 350 L 480 410 L 440 440 L 360 510" />
              {/* Cross Connections */}
              <path d="M 640 395 L 670 475" />
              <path d="M 360 510 L 440 440 L 480 410" />
            </g>

            {/* Active Highway Base Line */}
            <motion.path
              key={`base-${currentRoute.id}`}
              d={currentRoute.svgPath}
              fill="none"
              stroke="#FFE2CD"
              strokeWidth="9"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Active Orange Highway Route Path (Animated Beam) */}
            <motion.path
              key={`active-${currentRoute.id}`}
              d={currentRoute.svgPath}
              fill="none"
              stroke="url(#routeGradientBohok)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="9 6"
              className="animate-route-flow"
              filter="url(#routeBeamGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7 }}
            />

            {/* Waypoint Checkpoints along the Highway */}
            {routeWaypoints.map((wp) => (
              <g key={wp.id} transform={`translate(${wp.mapPosition.x}, ${wp.mapPosition.y})`}>
                <circle r={wp.isMajorStop ? '5.5' : '4'} fill="#FFFFFF" stroke="#FF6B00" strokeWidth="2.5" />
                <text
                  x="8"
                  y="4"
                  fill="#6B6B6B"
                  fontSize="10"
                  fontWeight={wp.isMajorStop ? 'bold' : 'normal'}
                >
                  {wp.nameBn}
                </text>
              </g>
            ))}

            {/* Destination City Hub Marker */}
            <g transform={`translate(${destHub.mapPosition.x}, ${destHub.mapPosition.y})`}>
              <circle r="26" fill="#FF6B00" fillOpacity="0.12" />
              <circle r="14" fill="#FF6B00" fillOpacity="0.25" />
              <circle r="7.5" fill="#FF6B00" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="-55" y="16" width="110" height="26" rx="7" fill="#171717" />
              <text x="0" y="33" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                {destHub.nameBn} গন্তব্য
              </text>
            </g>

            {/* Origin City Hub Marker */}
            <g transform={`translate(${originHub.mapPosition.x}, ${originHub.mapPosition.y})`}>
              <circle r="24" fill="#FF6B00" fillOpacity="0.1" />
              <circle r="12" fill="#FF6B00" fillOpacity="0.25" />
              <circle r="7" fill="#171717" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="-48" y="-34" width="96" height="24" rx="6" fill="#171717" />
              <text x="0" y="-18" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                {originHub.nameBn} হাব
              </text>
            </g>

            {/* Dynamic Parcel Marker traveling along the route */}
            <g transform={`translate(${currentParcelX}, ${currentParcelY})`}>
              <circle r="18" fill="#FF6B00" fillOpacity="0.2" className="animate-ping" />
              <circle r="9" fill="#FF6B00" stroke="#FFFFFF" strokeWidth="2" filter="url(#markerShadow)" />
              <circle r="3.5" fill="#FFFFFF" />
            </g>

            {/* Selected Traveller Approximate Privacy Mask Circle */}
            {selectedPos && (
              <g transform={`translate(${selectedPos.x}, ${selectedPos.y})`}>
                <circle
                  r="42"
                  fill="#FF6B00"
                  fillOpacity="0.08"
                  stroke="#FF6B00"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x="0"
                  y="-48"
                  fill="#E85D04"
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  প্রাইভেসি এরিয়া (~১.২ কিমি)
                </text>
              </g>
            )}

            {/* Approximate Traveller Markers on Map */}
            {routeTravellers.map((traveller, index) => {
              const isSelected = traveller.id === selectedTravellerId;
              const pos = traveller.mapPosition || originHub.mapPosition;

              return (
                <g
                  key={traveller.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  onClick={() => setSelectedTravellerId(traveller.id)}
                >
                  {/* Radar Pulse */}
                  <circle
                    r={isSelected ? '22' : '15'}
                    fill="#FF6B00"
                    fillOpacity={isSelected ? '0.35' : '0.15'}
                    className="animate-pulse"
                  />

                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? '13' : '9.5'}
                    fill={isSelected ? '#FF6B00' : '#FFFFFF'}
                    stroke={isSelected ? '#FFFFFF' : '#FF6B00'}
                    strokeWidth={isSelected ? '3' : '2.5'}
                    filter="url(#markerShadow)"
                  />

                  {/* Avatar Initials */}
                  <text
                    x="0"
                    y="4"
                    fill={isSelected ? '#FFFFFF' : '#E85D04'}
                    fontSize={isSelected ? '10' : '8.5'}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {traveller.avatarInitials}
                  </text>

                  {/* Name Label */}
                  <g transform="translate(0, 22)">
                    <rect
                      x="-38"
                      y="-10"
                      width="76"
                      height="20"
                      rx="5"
                      fill={isSelected ? '#171717' : '#FFFFFF'}
                      stroke={isSelected ? '#171717' : '#FFE2CD'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      fill={isSelected ? '#FFFFFF' : '#171717'}
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {traveller.name.split(' ')[0]}
                    </text>
                  </g>
                </g>
              );
            })}
          </motion.svg>

          {/* Bottom Left Controls: Highway code badge & Simulation trigger */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#FFE2CD] shadow-sm flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-[#FF6B00] -rotate-45" />
              <span className="text-xs font-bold text-[#171717]">
                করিডোর: {currentRoute.highwayCode} • {currentRoute.fromBn} ↔ {currentRoute.toBn}
              </span>
              <span className="text-xs text-[#6B6B6B]">
                ({toBengaliNumerals(currentRoute.distanceKm)} কিমি)
              </span>
            </div>

            <button
              onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
              className="bg-white/95 hover:bg-white text-xs font-semibold text-[#171717] px-3 py-1.5 rounded-xl border border-[#FFE2CD] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 text-[#FF6B00] ${isAnimationPlaying ? 'animate-spin' : ''}`} />
              <span>{isAnimationPlaying ? 'সিমুলেশন চলছে' : 'প্লে করুন'}</span>
            </button>
          </div>

          {/* Bottom Right Privacy Note & Provider Badge */}
          <div className="absolute bottom-4 right-4 z-20 hidden md:flex bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#FFE2CD] shadow-sm items-center gap-2 text-xs text-[#6B6B6B]">
            <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="font-semibold text-[#171717]">প্রাইভেসি নীতি:</span>
            <span>সর্বসাধারণের কাছে সুনির্দিষ্ট বাসা/লাইভ জিপিএস গোপন রাখা হয়</span>
            <span className="ml-1 px-2 py-0.5 rounded-md bg-[#FFF7F0] text-[#FF6B00] border border-[#FFE2CD] text-[10px] font-bold">
              ম্যাপ ইঞ্জিন: হাইওয়ে ভেক্টর নেটওয়ার্ক
            </span>
          </div>
        </div>

        {/* 3. Parcel Journey Flow & Selected Traveller Deck */}
        <div className="bg-[#FFF7F0]/40 border-t border-[#FFE2CD] p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
          {/* Left: 5-Stage Journey Flow */}
          <div className="flex-1 flex flex-col justify-between">
            <ParcelJourneyFlow
              currentStageIndex={currentJourneyStageIndex}
              progressPercent={journeyProgress}
            />

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span className="font-semibold text-[#171717]">
                  {currentRoute.fromBn} থেকে {currentRoute.toBn} রুটে মোট {toBengaliNumerals(routeTravellers.length)} জন যাচাইকৃত সহযাত্রী তালিকায় প্রস্তুত
                </span>
              </div>
              <span className="font-semibold text-[#E85D04] bg-white px-2.5 py-1 rounded-lg border border-[#FFE2CD]">
                ডেমো ডেটা মডেল
              </span>
            </div>
          </div>

          {/* Right: Selected Traveller Card (Desktop: compact card; Mobile: card view) */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                নির্বাচিত সহযাত্রী
              </span>
              <span className="text-[11px] font-semibold text-[#6B6B6B]">
                {toBengaliNumerals(routeTravellers.findIndex((t) => t.id === selectedTraveller.id) + 1)} / {toBengaliNumerals(routeTravellers.length)}
              </span>
            </div>

            {selectedTraveller ? (
              <TravellerCard
                traveller={selectedTraveller}
                onSelectBooking={onSelectBooking}
              />
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-[#FFE2CD] text-center text-sm text-[#6B6B6B]">
                এই মুহূর্তে নির্বাচিত ফিল্টারে কোনো সহযাত্রী পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Mobile Traveller Carousel (Horizontal swipe cards for mobile devices) */}
      <div className="lg:hidden mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#171717]">
            এই রুটের অন্যান্য সহযাত্রী ({toBengaliNumerals(routeTravellers.length)})
          </span>
          <span className="text-[10px] text-[#6B6B6B]">সোয়াইপ করুন →</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
          {routeTravellers.map((traveller) => {
            const isSelected = traveller.id === selectedTravellerId;

            return (
              <div
                key={traveller.id}
                onClick={() => setSelectedTravellerId(traveller.id)}
                className={`snap-center shrink-0 w-[270px] bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20 shadow-md'
                    : 'border-[#FFE2CD] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#FFF7F0] border border-[#FF6B00] text-[#E85D04] font-bold flex items-center justify-center text-sm">
                      {traveller.avatarInitials}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#171717]">{traveller.name}</h5>
                      <span className="text-[10px] text-[#16A34A] font-medium">★ {toBengaliNumerals(traveller.rating)}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#FFF7F0] text-[#FF6B00] px-2 py-0.5 rounded font-bold">
                    {traveller.departureTime.split(' ')[0]} {traveller.departureTime.split(' ')[1]}
                  </span>
                </div>
                <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between pt-1 border-t border-[#F0ECE7]">
                  <span>{traveller.originAreaBn.split(' ')[0]}</span>
                  <span className="text-[#16A34A]">{traveller.availableCapacityKg} কেজি খালি</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
