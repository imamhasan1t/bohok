// BOHOK Phase 7 — Sender Dashboard Page
// Route: /dashboard/sender

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
  Package,
  PlusCircle,
  MapPin,
  Clock,
  Navigation,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';

export default function SenderDashboardPage() {
  const { allBookings } = useBooking();
  const { user } = useAuth();
  const { isLive } = useRealtimeBooking();

  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  // Filter bookings for sender
  const senderId = user?.id || 'user-sender-imam';
  const myBookings = allBookings.filter(
    (b) => b.senderId === senderId || b.senderName.includes('ইমাম')
  );

  const activeBookings = myBookings.filter((b) =>
    [
      'PENDING_TRAVELLER',
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

  const deliveredBookings = myBookings.filter((b) => b.status === 'DELIVERED');
  const cancelledBookings = myBookings.filter((b) => ['CANCELLED', 'DISPUTED'].includes(b.status));

  const filteredList =
    filter === 'active'
      ? activeBookings
      : filter === 'delivered'
      ? deliveredBookings
      : filter === 'cancelled'
      ? cancelledBookings
      : myBookings;

  return (
    <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-20">
      <Container size="default" className="space-y-8">
        {/* Top Header & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                প্রেরক ড্যাশবোর্ড
              </span>
              <Badge variant="verified" className="text-[10px]">
                যাচাইকৃত প্রেরক
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
              আমার পার্সেল ও ডেলিভারিসমূহ
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              সকল প্রেরিত ও চলমান পার্সেলের লাইভ ট্র্যাকিং, ওটিপি এবং এসক্রো অবস্থা পর্যবেক্ষণ করুন
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/send">
              <Button
                variant="primary"
                size="lg"
                className="shadow-md px-6"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                নতুন পার্সেল পাঠান
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#FFE2CD] shadow-xs space-y-1">
            <span className="text-xs text-[#6B6B6B] block">মোট পার্সেল অনুরোধ</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#171717]">
                {myBookings.length} টি
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00]">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#FFE2CD] shadow-xs space-y-1">
            <span className="text-xs text-[#6B6B6B] block">চলমান / সক্রিয় যাত্রা</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#FF6B00]">
                {activeBookings.length} টি
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00]">
                <Navigation className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-green-200 shadow-xs space-y-1">
            <span className="text-xs text-[#6B6B6B] block">সফল ডেলিভারি</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#16A34A]">
                {deliveredBookings.length} টি
              </span>
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-[#16A34A]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#FFE2CD] shadow-xs space-y-1">
            <span className="text-xs text-[#6B6B6B] block">এসক্রোতে সুরক্ষিত অর্থ</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#171717]">
                ৳{' '}
                {activeBookings.reduce(
                  (acc, b) => (b.paymentStatus === 'HELD' ? acc + b.priceBreakdown.total : acc),
                  0
                )}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFF7F0] flex items-center justify-center text-[#FF6B00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-[#6B6B6B] border border-[#F0ECE7] hover:border-[#FFE2CD]'
            }`}
          >
            সকল পার্সেল ({myBookings.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'active'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-[#6B6B6B] border border-[#F0ECE7] hover:border-[#FFE2CD]'
            }`}
          >
            চলমান / সক্রিয় ({activeBookings.length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'delivered'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-[#6B6B6B] border border-[#F0ECE7] hover:border-[#FFE2CD]'
            }`}
          >
            ডেলিভারি সম্পন্ন ({deliveredBookings.length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'cancelled'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-white text-[#6B6B6B] border border-[#F0ECE7] hover:border-[#FFE2CD]'
            }`}
          >
            বাতিল / বিরোধ ({cancelledBookings.length})
          </button>
        </div>

        {/* Bookings List Cards */}
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#FFE2CD] text-center space-y-4">
            <Package className="w-12 h-12 text-[#FF6B00] mx-auto opacity-40" />
            <h4 className="text-xl font-bold text-[#171717]">কোনো পার্সেল পাওয়া যায়নি</h4>
            <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
              এই ফিল্টারে বর্তমানে কোনো পার্সেল রেকর্ড নেই। আপনি এখনই আপনার প্রথম পার্সেল যাত্রা পোস্ট করতে পারেন।
            </p>
            <Link href="/send">
              <Button variant="primary" size="md">
                পার্সেল পাঠান
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((b) => {
              const meta = BOOKING_STATUS_META[b.status] || {
                labelBn: b.status,
                variant: 'default',
                stepNumber: 1,
              };

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-[#FFE2CD] hover:border-[#FF6B00]/40 transition-all shadow-xs space-y-5"
                >
                  {/* Top Bar: Reference ID & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE7]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#FF6B00]">
                        #{b.id}
                      </span>
                      <span className="text-sm font-extrabold text-[#171717]">
                        {b.parcelTitleBn}
                      </span>
                      <span className="text-[11px] text-[#8C827A] px-2 py-0.5 rounded-full bg-[#F5EFEA]">
                        {b.parcelCategoryBn} • {b.parcelWeightKg} কেজি
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={meta.variant} className="text-xs px-2.5 py-0.5 font-bold">
                        {meta.labelBn}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle Grid: Route, Timing & Stakeholder */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#FF6B00] font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>রুট ও করিডোর</span>
                      </div>
                      <p className="font-bold text-[#171717] text-sm">{b.routeBn}</p>
                      <p className="text-[#6B6B6B] text-[11px]">{b.corridorNameBn}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#16A34A] font-bold">
                        <User className="w-3.5 h-3.5" />
                        <span>বহনকারী সহযাত্রী</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#171717]">{b.travellerName}</span>
                        <span className="text-[11px] text-[#16A34A] font-bold">
                          ★ {b.travellerRating}
                        </span>
                      </div>
                      <p className="text-[#6B6B6B] text-[11px]">{b.travellerVehicleBn}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#6B6B6B] block">ভাড়া ও এসক্রো স্থিতি</span>
                      <p className="font-black text-sm text-[#FF6B00]">
                        ৳ {b.priceBreakdown.total}
                      </p>
                      <span className="text-[11px] text-[#16A34A] block">
                        {b.paymentStatus === 'HELD' && 'এসক্রোতে সুরক্ষিত'}
                        {b.paymentStatus === 'RELEASED' && 'ভাড়া প্রদান সম্পন্ন'}
                        {b.paymentStatus === 'UNPAID' && 'পেমেন্ট বাকি'}
                        {b.paymentStatus === 'REFUNDED' && 'টাকা ফেরত সম্পন্ন'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F0ECE7]">
                    {/* Show OTP 1 hint for Sender if ready */}
                    <div className="flex items-center gap-2 text-xs">
                      {['PAYMENT_HELD', 'READY_FOR_PICKUP', 'TRAVELLER_ARRIVED', 'HANDOVER_PENDING'].includes(b.status) && (
                        <div className="flex items-center gap-2 bg-[#FFF7F0] px-3 py-1.5 rounded-xl border border-[#FFE2CD]">
                          <KeyRound className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="text-[#6B6B6B]">১ম ওটিপি:</span>
                          <span className="font-mono font-black text-[#FF6B00] tracking-wider">
                            {b.handover.otp1}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {b.status === 'IN_TRANSIT' && (
                        <Link href={`/booking/${b.id}/track`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-[#FF6B00] border-[#FF6B00]"
                            leftIcon={<Navigation className="w-3.5 h-3.5" />}
                          >
                            লাইভ ট্র্যাকিং
                          </Button>
                        </Link>
                      )}

                      {['PAYMENT_HELD', 'READY_FOR_PICKUP', 'TRAVELLER_ARRIVED', 'HANDOVER_PENDING'].includes(b.status) && (
                        <Link href={`/booking/${b.id}/handover`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs shadow-xs"
                            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                          >
                            হ্যান্ডওভার ও ওটিপি
                          </Button>
                        </Link>
                      )}

                      {b.status === 'DELIVERED' && !b.senderRating && (
                        <Link href={`/booking/${b.id}/rating`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                            leftIcon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                          >
                            রেটিং দিন
                          </Button>
                        </Link>
                      )}

                      <Link href={`/booking/${b.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          বিস্তারিত দেখুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
