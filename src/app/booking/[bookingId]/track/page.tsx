// BOHOK Phase 7 — Live Corridor Tracking Page
// Route: /booking/[bookingId]/track

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/useBooking';
import { TrackingCorridorMap } from '@/components/booking/TrackingCorridorMap';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  ArrowLeft,
  Navigation,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

function BookingTrackContent() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const router = useRouter();

  const { booking, travellerArrivedDestination } = useBooking(bookingId);

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

  const handleMilestoneComplete = (isFinished: boolean) => {
    if (isFinished && booking.status === 'IN_TRANSIT') {
      travellerArrivedDestination(booking.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-20">
      <Container size="default" className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F0ECE7]">
          <div className="flex items-center gap-3">
            <Link
              href={`/booking/${booking.id}`}
              className="p-2 rounded-xl bg-white border border-[#F0ECE7] text-[#6B6B6B] hover:text-[#171717] hover:border-[#FFE2CD] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                  লাইভ করিডোর ট্র্যাকিং
                </span>
                <span className="text-xs font-mono font-bold text-[#6B6B6B]">
                  #{booking.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">
                {booking.routeBn} — {booking.parcelTitleBn}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="verified" className="text-xs px-3 py-1 font-bold">
              {booking.status === 'IN_TRANSIT' ? 'মহাসড়কে পার্সেল চলমান' : 'গন্তব্যে পৌঁছেছে'}
            </Badge>
          </div>
        </div>

        {/* Live Interactive Corridor Tracking Map */}
        <TrackingCorridorMap
          bookingId={booking.id}
          originBn={booking.originCityBn}
          destinationBn={booking.destinationCityBn}
          onMilestoneReached={handleMilestoneComplete}
        />

        {/* Support & Quick Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traveller Communication Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#FFE2CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF6B00]" />
                <h4 className="font-extrabold text-base text-[#171717]">
                  সহযাত্রীর সাথে যোগাযোগ
                </h4>
              </div>
              <Badge variant="verified" className="text-[11px]">
                যাচাইকৃত সহযাত্রী
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFDFB] border border-[#F0ECE7]">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                {booking.travellerAvatar}
              </div>
              <div className="flex-1">
                <h5 className="font-black text-sm text-[#171717]">
                  {booking.travellerName}
                </h5>
                <p className="text-xs text-[#6B6B6B]">
                  যানবাহন: {booking.travellerVehicleBn}
                </p>
                <p className="text-xs font-mono font-bold text-[#FF6B00] mt-0.5">
                  ফোন: {booking.travellerPhoneMasked}
                </p>
              </div>
              <a
                href={`tel:${booking.travellerPhone}`}
                className="p-3 rounded-2xl bg-[#FFF7F0] hover:bg-[#FFE2CD] text-[#FF6B00] transition-colors"
                title="কল করুন"
              >
                <PhoneCall className="w-5 h-5" />
              </a>
            </div>

            <p className="text-[11px] text-[#6B6B6B]">
              গোপনীয়তা বিধিমালার কারণে আপনার এবং সহযাত্রীর ফোন নম্বর সুরক্ষিত প্রক্সি মাধ্যমে ফিল্টার করা হয়ে থাকে।
            </p>
          </div>

          {/* Recipient Dropoff Coordination Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#FFE2CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                <h4 className="font-extrabold text-base text-[#171717]">
                  গন্তব্যে ডেলিভারি প্রস্তুতি
                </h4>
              </div>
              <Badge variant="primary" className="text-[11px]">
                ড্রপঅফ
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#F0ECE7] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">প্রাপকের নাম</span>
                <span className="font-bold text-[#171717]">{booking.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">প্রাপকের ফোন</span>
                <span className="font-bold font-mono text-[#171717]">{booking.recipientPhoneMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">ডেলিভারি এলাকা</span>
                <span className="font-bold text-[#171717]">{booking.destinationAreaBn}</span>
              </div>
            </div>

            <Link href={`/booking/${booking.id}/handover`} className="block">
              <Button
                variant="primary"
                size="md"
                className="w-full shadow-xs"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                ২য় ওটিপি ভেরিফিকেশন স্ক্রিনে যান
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function BookingTrackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center text-xs text-[#6B6B6B]">
          করিডোর ট্র্যাকিং তথ্য লোড হচ্ছে...
        </div>
      }
    >
      <BookingTrackContent />
    </React.Suspense>
  );
}
