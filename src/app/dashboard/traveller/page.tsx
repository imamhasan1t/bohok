// BOHOK Phase 7 — Traveller Dashboard Page
// Route: /dashboard/traveller

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/useBooking';
import { useAuth } from '@/lib/auth/useAuth';
import { useRealtimeBooking } from '@/lib/realtime/useRealtimeBooking';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { BOOKING_STATUS_META } from '@/lib/booking/bookingTransitions';
import {
  Navigation,
  PlusCircle,
  MapPin,
  Clock,
  KeyRound,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
} from 'lucide-react';

export default function TravellerDashboardPage() {
  const { allBookings, acceptBooking } = useBooking();
  const { user } = useAuth();
  const { isLive } = useRealtimeBooking();

  const [declinedIds, setDeclinedIds] = useState<string[]>([]);

  // Filter bookings where traveller is Rahim (or logged in user)
  const travellerId = user?.id || 'user-traveller-rahim';
  const myBookings = allBookings.filter(
    (b) => b.travellerId === travellerId || b.travellerName.includes('রহিম')
  );

  // Incoming parcel requests awaiting traveller confirmation
  const incomingRequests = allBookings.filter(
    (b) => b.status === 'PENDING_TRAVELLER' && !declinedIds.includes(b.id)
  );

  // Active trips & carried parcels
  const activeBookings = myBookings.filter((b) =>
    [
      'ACCEPTED',
      'PAYMENT_PENDING',
      'PAYMENT_HELD',
      'READY_FOR_PICKUP',
      'TRAVELLER_ARRIVED',
      'HANDOVER_PENDING',
      'HANDED_OVER',
      'IN_TRANSIT',
      'ARRIVED_DESTINATION',
      'DELIVERY_PENDING',
    ].includes(b.status)
  );

  // Delivered
  const deliveredBookings = myBookings.filter((b) => b.status === 'DELIVERED');

  // Capacity calculations (Demo trip: 5.0 kg capacity)
  const maxCapacityKg = 5.0;
  const usedCapacityKg = activeBookings.reduce((acc, b) => acc + b.parcelWeightKg, 0);
  const remainingCapacityKg = Math.max(0, maxCapacityKg - usedCapacityKg);
  const capacityPercent = Math.min(100, Math.round((usedCapacityKg / maxCapacityKg) * 100));

  // Earnings calculations
  const releasedEarnings = deliveredBookings.reduce(
    (acc, b) => acc + b.priceBreakdown.travellerFee,
    0
  );
  const escrowPendingEarnings = activeBookings.reduce(
    (acc, b) => (b.paymentStatus === 'HELD' ? acc + b.priceBreakdown.travellerFee : acc),
    0
  );

  const handleAcceptRequest = (bookingId: string) => {
    acceptBooking(bookingId);
  };

  const handleDeclineRequest = (bookingId: string) => {
    setDeclinedIds((prev) => [...prev, bookingId]);
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-20">
      <Container size="default" className="space-y-8">
        {/* Header & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                সহযাত্রী কমান্ড সেন্টার
              </span>
              <Badge variant="verified" className="text-[10px]">
                ট্রাস্টেড সহযাত্রী ব্যাজ
              </Badge>
              {isLive ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  লাইভ সংযোগ সক্রিয়
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  পোলিং সক্রিয়
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-[#171717]">
              আমার যাত্রা ও উপার্জিত আয়
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              যাত্রাপথে পার্সেল বহনের অনুরোধ পরিচালনা করুন এবং নিরাপদে অতিরিক্ত আয় নিশ্চিত করুন
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/travel">
              <Button
                variant="primary"
                size="lg"
                className="shadow-md px-6"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                নতুন যাত্রা পোস্ট করুন
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Capacity Utilization Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#FFE2CD] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B6B6B]">যাত্রাপথের বহন সক্ষমতা</span>
              <span className="text-xs font-bold text-[#FF6B00]">{capacityPercent}% ব্যবহৃত</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#171717]">
                {usedCapacityKg.toFixed(1)}
              </span>
              <span className="text-xs text-[#6B6B6B]">/ {maxCapacityKg.toFixed(1)} কেজি</span>
            </div>
            {/* Capacity meter */}
            <div className="h-2 bg-[#F0ECE7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs space-y-2">
            <span className="text-xs text-[#6B6B6B]">নতুন পার্সেল অনুরোধ</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-600">
                {incomingRequests.length} টি
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-[#6B6B6B]">অনুমোদন অপেক্ষমাণ</p>
          </div>

          {/* Escrow Pending Earnings */}
          <div className="bg-white p-5 rounded-3xl border border-[#FFE2CD] shadow-xs space-y-2">
            <span className="text-xs text-[#6B6B6B]">এসক্রোতে অপেক্ষমাণ ভাড়া</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#FF6B00]">
                ৳ {escrowPendingEarnings}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-[#16A34A]">ডেলিভারিতে তাৎক্ষণিক মুক্তি</p>
          </div>

          {/* Released Earnings */}
          <div className="bg-white p-5 rounded-3xl border border-green-200 shadow-xs space-y-2">
            <span className="text-xs text-[#6B6B6B]">মোট অর্জিত ও গৃহীত আয়</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#16A34A]">
                ৳ {releasedEarnings}
              </span>
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-[#16A34A]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-[#6B6B6B]">সফল ডেলিভারি সম্পন্ন</p>
          </div>
        </div>

        {/* Section 1: Incoming Parcel Requests Awaiting Traveller Approval */}
        {incomingRequests.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-xl font-extrabold text-[#171717]">
                  নতুন পার্সেল বহনের অনুরোধ ({incomingRequests.length})
                </h3>
              </div>
              <span className="text-xs text-[#6B6B6B]">
                আপনার অবশিষ্ট সক্ষমতা: {remainingCapacityKg.toFixed(1)} কেজি
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => {
                const canFit = req.parcelWeightKg <= remainingCapacityKg;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-6 border-2 border-[#FFE2CD] hover:border-[#FF6B00] transition-all shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#FF6B00]">
                          #{req.id}
                        </span>
                        <h4 className="font-extrabold text-base text-[#171717]">
                          {req.parcelTitleBn}
                        </h4>
                        <p className="text-xs text-[#6B6B6B]">
                          প্রেরক: <strong>{req.senderName}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#6B6B6B] block">প্রাপ্য ভাড়া</span>
                        <span className="text-lg font-black text-[#16A34A]">
                          ৳ {req.priceBreakdown.travellerFee}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-[#FFF7F0] rounded-2xl text-xs">
                      <div>
                        <span className="text-[#6B6B6B] block">রুট</span>
                        <span className="font-bold text-[#171717]">{req.routeBn}</span>
                      </div>
                      <div>
                        <span className="text-[#6B6B6B] block">ওজন ও ধরন</span>
                        <span className="font-bold text-[#FF6B00]">
                          {req.parcelWeightKg} কেজি • {req.parcelCategoryBn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="md"
                        disabled={!canFit}
                        onClick={() => handleAcceptRequest(req.id)}
                        className="w-full shadow-xs"
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        {canFit ? 'অনুরোধ গ্রহণ করুন' : 'সক্ষমতা অতিক্রম হয়েছে'}
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleDeclineRequest(req.id)}
                        className="text-xs text-[#6B6B6B]"
                      >
                        বাতিল
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Active Carried Parcels in Journey */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-xl font-extrabold text-[#171717]">
                চলমান ও সক্রিয় পার্সেল বহনের তালিকা ({activeBookings.length})
              </h3>
            </div>
          </div>

          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#FFE2CD] text-center text-xs text-[#6B6B6B]">
              বর্তমানে কোনো পার্সেল যাত্রা চলমান নেই।
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((b) => {
                const meta = BOOKING_STATUS_META[b.status] || {
                  labelBn: b.status,
                  variant: 'default',
                  stepNumber: 1,
                };

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-6 border border-[#FFE2CD] hover:border-[#FF6B00]/40 transition-all shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE7]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#FF6B00]">
                          #{b.id}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#171717]">
                          {b.parcelTitleBn}
                        </h4>
                      </div>

                      <Badge variant={meta.variant} className="text-xs px-2.5 py-0.5 font-bold">
                        {meta.labelBn}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[#6B6B6B] block">রুট ও ড্রপঅফ এলাকা</span>
                        <p className="font-bold text-[#171717]">{b.routeBn}</p>
                        <p className="text-[11px] text-[#6B6B6B]">{b.destinationAreaBn}</p>
                      </div>

                      <div>
                        <span className="text-[#6B6B6B] block">প্রাপক যোগাযোগ</span>
                        <p className="font-bold text-[#171717]">{b.recipientName}</p>
                        <p className="text-[11px] text-[#FF6B00] font-mono">{b.recipientPhoneMasked}</p>
                      </div>

                      <div>
                        <span className="text-[#6B6B6B] block">আপনার প্রদেয় ফি</span>
                        <p className="text-lg font-black text-[#16A34A]">
                          ৳ {b.priceBreakdown.travellerFee}
                        </p>
                        <span className="text-[10px] text-[#8C827A]">
                          {b.paymentStatus === 'HELD' ? 'এসক্রোতে প্রস্তুত' : 'পরিশোধ বাকি'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F0ECE7]">
                      <div className="text-xs text-[#6B6B6B]">
                        {b.status === 'PAYMENT_HELD' && 'প্রেরক পেমেন্ট করেছেন। পিকআপ স্থানে উপস্থিত হোন।'}
                        {b.status === 'HANDED_OVER' && '১ম ওটিপি যাচাই হয়েছে। মহাসড়কে যাত্রা শুরু করুন।'}
                        {b.status === 'IN_TRANSIT' && 'পার্সেল ট্রানজিটে রয়েছে। গন্তব্যে পৌঁছালে ২য় ওটিপি নিন।'}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link href={`/booking/${b.id}/handover`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs shadow-xs"
                            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                          >
                            ওটিপি যাচাই ও ডেলিভারি
                          </Button>
                        </Link>

                        <Link href={`/booking/${b.id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            বিস্তারিত
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
