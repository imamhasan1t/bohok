// BOHOK Phase 7 — Handover & Delivery Verification Page
// Route: /booking/[bookingId]/handover

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/useBooking';
import { HandoverVerification } from '@/components/booking/HandoverVerification';
import { DeliveryVerification } from '@/components/booking/DeliveryVerification';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { HandoverSafetyChecklist } from '@/lib/booking/bookingTypes';
import { ArrowLeft, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

function HandoverContent() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const router = useRouter();

  const {
    booking,
    verifyHandoverOtp,
    startJourney,
    verifyDeliveryOtp,
  } = useBooking(bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center">
        <Container size="narrow" className="text-center space-y-4">
          <h2 className="text-2xl font-black text-[#171717]">বুকিং পাওয়া যায়নি</h2>
          <Link href="/dashboard/sender">
            <Button variant="primary" size="md">
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </Link>
        </Container>
      </div>
    );
  }

  const handleHandoverVerify = (otp: string, checklist: HandoverSafetyChecklist) => {
    verifyHandoverOtp(booking.id, otp, checklist);
  };

  const handleAdvanceToTransit = () => {
    startJourney(booking.id);
    router.push(`/booking/${booking.id}/track`);
  };

  const handleDeliveryVerify = async (otp: string, notes?: string) => {
    await verifyDeliveryOtp(booking.id, otp, notes);
  };

  // Determine whether to focus primarily on Handover (OTP 1) or Delivery (OTP 2)
  const isPostTransit = [
    'IN_TRANSIT',
    'ARRIVED_DESTINATION',
    'DELIVERY_PENDING',
    'DELIVERED',
  ].includes(booking.status);

  return (
    <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-20">
      <Container size="narrow" className="space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE7]">
          <div className="flex items-center gap-3">
            <Link
              href={`/booking/${booking.id}`}
              className="p-2 rounded-xl bg-white border border-[#F0ECE7] text-[#6B6B6B] hover:text-[#171717] hover:border-[#FFE2CD] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
                দ্বৈত ওটিপি সিকিউরিটি ভেরিফিকেশন
              </span>
              <h1 className="text-2xl font-black text-[#171717]">
                হ্যান্ডওভার ও ডেলিভারি নিশ্চিতকরণ
              </h1>
            </div>
          </div>

          <Badge variant="verified" className="text-xs px-3 py-1">
            বুকিং #{booking.id}
          </Badge>
        </div>

        {/* Dynamic Display: Show Handover first, or Delivery if In Transit / Arrived */}
        {!isPostTransit || !booking.handover.otp1Verified ? (
          <div className="space-y-6">
            <HandoverVerification
              booking={booking}
              onVerify={handleHandoverVerify}
              onAdvanceToTransit={handleAdvanceToTransit}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <DeliveryVerification
              booking={booking}
              onVerify={handleDeliveryVerify}
            />
          </div>
        )}
      </Container>
    </div>
  );
}

export default function HandoverPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center text-xs text-[#6B6B6B]">
          হস্তান্তর তথ্য লোড হচ্ছে...
        </div>
      }
    >
      <HandoverContent />
    </React.Suspense>
  );
}
