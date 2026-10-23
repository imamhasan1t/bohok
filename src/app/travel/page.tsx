import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { Footer } from '@/components/layout/Footer';
import { TravellerFlowWizard } from '@/components/traveller-flow/TravellerFlowWizard';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'যাত্রা পোস্ট করুন | BOHOK (বহন) — আপনার যাত্রার সাথে আয় করুন',
  description:
    'ঢাকা, কুমিল্লা, চট্টগ্রাম, সিলেট, খুলনা, রাজশাহীসহ যেকোনো গন্তব্যে ভ্রমণের পথে ব্যাগের বাড়তি খালি জায়গায় অনুমোদিত পার্সেল বহন করে যাতায়াত খরচ সাশ্রয় করুন।',
};

export default function TravelPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFF7F0]/30 selection:bg-[#FFE2CD] selection:text-[#E85D04]">
      {/* Minimalist Header */}
      <header className="bg-white border-b border-[#FFE2CD]/60 py-4 sticky top-0 z-40 backdrop-blur-md">
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-black text-lg shadow-sm">
                B
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#171717]">
                  BOHOK
                </span>
                <span className="text-xs font-bold text-[#FF6B00] bg-[#FFF7F0] px-1.5 py-0.5 rounded border border-[#FFE2CD]">
                  বহন
                </span>
              </div>
            </Link>

            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-[#6B6B6B] hover:text-[#FF6B00] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-10 sm:py-16">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
            <span className="text-xs font-bold text-[#FF6B00] bg-[#FFF7F0] px-3.5 py-1 rounded-full border border-[#FFE2CD] inline-flex items-center gap-1.5 shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF6B00]" />
              আপনার যাত্রার সাথে আয় করুন
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
              আপনার যাত্রা প্রকাশ করুন
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B]">
              সহজ ৭টি ধাপে আপনার ভ্রমণের রুট ও ব্যাগের অতিরিক্ত স্পেস জানিয়ে একই রুটের যাচাইকৃত পার্সেল অনুরোধ গ্রহণ করুন।
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-20 text-[#6B6B6B]">লোড হচ্ছে...</div>}>
            <TravellerFlowWizard />
          </Suspense>
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
