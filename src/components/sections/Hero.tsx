'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Compass,
  ChevronDown,
} from 'lucide-react';

interface HeroProps {
  onOpenSendModal: () => void;
  onOpenTripModal: () => void;
  onSelectRoutePreview?: (routeId: string) => void;
}

export function Hero({ onOpenSendModal, onOpenTripModal, onSelectRoutePreview }: HeroProps) {
  const quickCorridors = [
    { id: 'dhaka-cumilla', labelBn: 'ঢাকা ↔ কুমিল্লা', isPilot: true },
    { id: 'dhaka-chattogram', labelBn: 'ঢাকা ↔ চট্টগ্রাম', isPilot: false },
    { id: 'dhaka-sylhet', labelBn: 'ঢাকা ↔ সিলেট', isPilot: false },
    { id: 'dhaka-khulna', labelBn: 'ঢাকা ↔ খুলনা', isPilot: false },
    { id: 'dhaka-rajshahi', labelBn: 'ঢাকা ↔ রাজশাহী', isPilot: false },
  ];

  const handleRouteClick = (routeId: string) => {
    if (onSelectRoutePreview) {
      onSelectRoutePreview(routeId);
    }
    const mapElement = document.getElementById('map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden bg-white">
      {/* Background warm peach ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#FFF7F0] rounded-full blur-3xl opacity-80" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#FFE2CD]/50 rounded-full blur-3xl opacity-70" />
      </div>

      <Container>
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Pilot Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2"
          >
            <Badge variant="softOrange" pulse className="px-3 py-1.5 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>পাইলট রুট সক্রিয়: ঢাকা ↔ কুমিল্লা • সারাদেশে সম্প্রসারণশীল</span>
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#171717] leading-[1.15] sm:leading-[1.12]"
          >
            আপনি যাচ্ছেন। <br />
            <span className="text-[#FF6B00] relative inline-block mt-1">
              আপনার সাথে পার্সেলও যাক।
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#FFE2CD] -z-10"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 9.5C80 2.5 220 2.5 297.5 9.5"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl md:text-2xl text-[#6B6B6B] font-normal max-w-2xl leading-relaxed"
          >
            আপনি যে পথে যাচ্ছেন, সেই পথেই আপনার পার্সেল পৌঁছে দিন—
            দ্রুত, সহজ ও যাচাই করা মানুষের মাধ্যমে।
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            <Link href="/send" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 shadow-[0_8px_24px_rgba(255,107,0,0.28)]"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                পার্সেল পাঠান
              </Button>
            </Link>
            <Link href="/travel" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 border-[#FFE2CD] hover:border-[#FF6B00]"
              >
                যাত্রা পোস্ট করুন
              </Button>
            </Link>
          </motion.div>

          {/* Visual Connection to Interactive Map */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 sm:mt-12 w-full bg-[#FFF7F0]/60 p-4 sm:p-5 rounded-3xl border border-[#FFE2CD] shadow-xs"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#FF6B00]" />
                ম্যাপে লাইভ রুট দেখুন ও সহযাত্রী ম্যাচ করুন:
              </span>
              <a
                href="#map-section"
                className="text-xs font-semibold text-[#FF6B00] hover:text-[#E85D04] flex items-center gap-1 group"
              >
                <span>ইন্টারঅ্যাক্টিভ ম্যাপে যান</span>
                <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickCorridors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleRouteClick(c.id)}
                  className="px-3 py-1.5 bg-white text-xs font-bold text-[#171717] rounded-xl border border-[#FFE2CD] hover:border-[#FF6B00] hover:bg-[#FFF7F0] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span>{c.labelBn}</span>
                  {c.isPilot ? (
                    <span className="text-[10px] bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.2 rounded font-semibold">
                      পাইলট
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#6B6B6B] font-normal">রুট</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Micro Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 pt-6 border-t border-[#F0ECE7] w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
          >
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#F0ECE7]">
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">এনআইডি যাচাই</h5>
                <p className="text-[11px] text-[#6B6B6B]">১০০% ভেরিফাইড ট্রাভেলার</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#F0ECE7]">
              <div className="w-9 h-9 rounded-lg bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">একই দিনে ডেলিভারি</h5>
                <p className="text-[11px] text-[#6B6B6B]">সরাসরি দ্রুততম সময়ে</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#F0ECE7]">
              <div className="w-9 h-9 rounded-lg bg-[#FFF7F0] flex items-center justify-center text-[#E85D04] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">দ্বৈত ওটিপি সুরক্ষা</h5>
                <p className="text-[11px] text-[#6B6B6B]">পিন ছাড়া হস্তান্তর নয়</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#F0ECE7]">
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">পিয়ার-টু-পিয়ার</h5>
                <p className="text-[11px] text-[#6B6B6B]">সরাসরি ন্যায্য সংযোগ</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
