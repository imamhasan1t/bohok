// BOHOK Phase 7 — Booking Details & Operational Command Page
// Route: /booking/[bookingId]

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/useBooking';
import { ParcelJourneyTimeline } from '@/components/booking/ParcelJourneyTimeline';
import { SafetyBanner } from '@/components/booking/SafetyBanner';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { BOOKING_STATUS_META } from '@/lib/booking/bookingTransitions';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  KeyRound,
  Navigation,
  Star,
  AlertTriangle,
  CreditCard,
  UserCheck,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

function BookingDetailContent() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const router = useRouter();

  const {
    booking,
    acceptBooking,
    holdPayment,
    travellerArrivedPickup,
    startJourney,
    travellerArrivedDestination,
    cancelBooking,
  } = useBooking(bookingId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('ব্যক্তিগত অসুবিধা');

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center">
        <Container size="narrow" className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#171717]">বুকিং পাওয়া যায়নি</h2>
          <p className="text-xs text-[#6B6B6B]">
            বুকিং আইডি <strong>{bookingId}</strong> সঠিক কিনা তা পুনরায় যাচাই করুন।
          </p>
          <div className="pt-2">
            <Link href="/dashboard/sender">
              <Button variant="primary" size="md">
                ড্যাশবোর্ডে ফিরে যান
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const meta = BOOKING_STATUS_META[booking.status] || {
    labelBn: booking.status,
    variant: 'default',
    stepNumber: 1,
    descriptionBn: '',
  };

  const handlePayEscrow = async () => {
    setIsProcessing(true);
    try {
      await holdPayment(booking.id, 'bkash');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    try {
      cancelBooking(booking.id, 'sender', cancelReason);
      setCancelModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'বুকিং বাতিল করা সম্ভব নয়');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-20">
      <Container size="default" className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white border border-[#F0ECE7] text-[#6B6B6B] hover:text-[#171717] hover:border-[#FFE2CD] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                  বুকিং রেফারেন্স
                </span>
                <span className="text-xs font-mono font-bold text-[#6B6B6B]">
                  #{booking.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
                {booking.parcelTitleBn}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={meta.variant} className="text-xs px-3 py-1 font-bold">
              {meta.labelBn}
            </Badge>
            <Badge variant="demo" className="text-[11px]">
              ডেমো লাইফসাইকেল
            </Badge>
          </div>
        </div>

        {/* Primary Operational Action Callout (Contextual based on status) */}
        <div className="bg-[#FFF7F0] border-2 border-[#FFE2CD] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B00] uppercase">
              <Clock className="w-4 h-4" />
              <span>বর্তমান ধাপের করণীয়</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#171717]">
              {booking.status === 'PENDING_TRAVELLER' && 'সহযাত্রীর অনুমোদনের অপেক্ষায়'}
              {booking.status === 'ACCEPTED' && 'সহযাত্রী অনুমোদন করেছেন! এসক্রো পেমেন্ট সম্পন্ন করুন'}
              {booking.status === 'PAYMENT_PENDING' && 'এসক্রো পেমেন্ট জমা দিন'}
              {booking.status === 'PAYMENT_HELD' && 'টাকা এসক্রোতে জমা হয়েছে। পিকআপের জন্য প্রস্তুত থাকুন'}
              {booking.status === 'TRAVELLER_ARRIVED' && 'সহযাত্রী উপস্থিত! পার্সেল হস্তান্তর ও ১ম ওটিপি দিন'}
              {booking.status === 'HANDOVER_PENDING' && 'নিরাপত্তা চেকলিস্ট ও ১ম ওটিপি যাচাই সম্পন্ন করুন'}
              {booking.status === 'HANDED_OVER' && 'পার্সেল হস্তান্তর সফল। সহযাত্রী যাত্রা শুরু করবেন'}
              {booking.status === 'IN_TRANSIT' && 'পার্সেল জাতীয় মহাসড়কে চলছে। লাইভ অগ্রগতি দেখুন'}
              {booking.status === 'ARRIVED_DESTINATION' && 'সহযাত্রী গন্তব্যে পৌঁছেছেন! প্রাপকের সাথে যোগাযোগ করুন'}
              {booking.status === 'DELIVERY_PENDING' && 'প্রাপক ২য় ওটিপি দিয়ে ডেলিভারি গ্রহণ করবেন'}
              {booking.status === 'DELIVERED' && 'ডেলিভারি সম্পন্ন! সহযাত্রীকে রেটিং প্রদান করুন'}
              {booking.status === 'CANCELLED' && 'এই বুকিং অনুরোধটি বাতিল করা হয়েছে'}
              {booking.status === 'DISPUTED' && 'বিরোধ পর্যালোচনা চলছে। সাপোর্ট টিম তদন্ত করছে'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-xl">
              {meta.descriptionBn}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {booking.status === 'PENDING_TRAVELLER' && (
              <Button
                variant="primary"
                size="md"
                onClick={() => acceptBooking(booking.id)}
                className="w-full sm:w-auto shadow-sm"
              >
                (ডেমো) সহযাত্রী হিসেবে গ্রহণ করুন
              </Button>
            )}

            {(booking.status === 'ACCEPTED' || booking.status === 'PAYMENT_PENDING') && (
              <Button
                variant="primary"
                size="lg"
                isLoading={isProcessing}
                onClick={handlePayEscrow}
                className="w-full sm:w-auto shadow-md"
                leftIcon={<CreditCard className="w-5 h-5" />}
              >
                বিকাশ ডেমো এসক্রো পরিশোধ (৳{booking.priceBreakdown.total})
              </Button>
            )}

            {(booking.status === 'PAYMENT_HELD' ||
              booking.status === 'READY_FOR_PICKUP' ||
              booking.status === 'TRAVELLER_ARRIVED' ||
              booking.status === 'HANDOVER_PENDING') && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => travellerArrivedPickup(booking.id)}
                  className="text-xs"
                >
                  (সিমুলেট) সহযাত্রী পৌঁছালেন
                </Button>
                <Link href={`/booking/${booking.id}/handover`}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-md"
                    leftIcon={<KeyRound className="w-5 h-5" />}
                  >
                    হ্যান্ডওভার ও ১ম ওটিপি যাচাই
                  </Button>
                </Link>
              </div>
            )}

            {booking.status === 'HANDED_OVER' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => startJourney(booking.id)}
                  className="shadow-md"
                  leftIcon={<Navigation className="w-5 h-5" />}
                >
                  মহাসড়কে যাত্রা শুরু করুন
                </Button>
                <Link href={`/booking/${booking.id}/track`}>
                  <Button variant="outline" size="lg">
                    ট্র্যাকিং দেখুন
                  </Button>
                </Link>
              </div>
            )}

            {booking.status === 'IN_TRANSIT' && (
              <div className="flex items-center gap-2">
                <Link href={`/booking/${booking.id}/track`}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-md"
                    leftIcon={<Navigation className="w-5 h-5" />}
                  >
                    লাইভ করিডোর ট্র্যাকিং
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => travellerArrivedDestination(booking.id)}
                  className="text-xs"
                >
                  (সিমুলেট) গন্তব্যে পৌঁছালেন
                </Button>
              </div>
            )}

            {(booking.status === 'ARRIVED_DESTINATION' ||
              booking.status === 'DELIVERY_PENDING') && (
              <Link href={`/booking/${booking.id}/handover`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md"
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                >
                  ২য় ওটিপি যাচাই ও ডেলিভারি নিশ্চিত করুন
                </Button>
              </Link>
            )}

            {booking.status === 'DELIVERED' && (
              <Link href={`/booking/${booking.id}/rating`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md"
                  leftIcon={<Star className="w-5 h-5 fill-white" />}
                >
                  রেটিং ও মতামত দিন
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Cinematic Lifecycle Timeline */}
        <ParcelJourneyTimeline
          currentStatus={booking.status}
          timelineEvents={booking.timeline}
        />

        {/* 2-Column Core Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Route, Stakeholders & Parcel Specs (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route & Transport Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6">
              <h3 className="text-lg font-black text-[#171717]">
                রুট ও যাতায়াত বিবরণ
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#F0ECE7] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#FF6B00] font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>পিকআপ পয়েন্ট (প্রস্থান)</span>
                  </div>
                  <p className="text-sm font-black text-[#171717]">
                    {booking.originCityBn} — {booking.originAreaBn}
                  </p>
                  <p className="text-[#6B6B6B] text-[11px]">
                    সম্ভাব্য সময়: {booking.pickupEstimatedTimeBn}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#F0ECE7] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#16A34A] font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>ডেলিভারি মিটিং পয়েন্ট (গন্তব্য)</span>
                  </div>
                  <p className="text-sm font-black text-[#171717]">
                    {booking.destinationCityBn} — {booking.destinationAreaBn}
                  </p>
                  <p className="text-[#6B6B6B] text-[11px]">
                    সম্ভাব্য ডেলিভারি: {booking.deliveryEstimatedTimeBn}
                  </p>
                </div>
              </div>

              {/* Highway Corridor */}
              <div className="p-4 rounded-2xl bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#FF6B00]" />
                  <span className="font-bold text-[#171717]">
                    {booking.corridorNameBn}
                  </span>
                </div>
                <span className="text-[#6B6B6B]">{booking.travellerVehicleBn}</span>
              </div>
            </div>

            {/* Stakeholder Profiles: Sender, Recipient & Traveller */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sender Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFE2CD] shadow-sm space-y-3 text-xs">
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase block">
                  পার্সেল প্রেরক
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF7F0] border border-[#FFE2CD] flex items-center justify-center font-bold text-[#FF6B00]">
                    ই
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-[#171717]">
                      {booking.senderName}
                    </h5>
                    <p className="text-[11px] text-[#6B6B6B]">
                      {booking.senderPhoneMasked}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFE2CD] shadow-sm space-y-3 text-xs">
                <span className="text-[10px] font-bold text-[#16A34A] uppercase block">
                  পার্সেল প্রাপক
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center font-bold text-[#16A34A]">
                    তা
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-[#171717]">
                      {booking.recipientName}
                    </h5>
                    <p className="text-[11px] text-[#6B6B6B]">
                      {booking.recipientPhoneMasked}
                    </p>
                  </div>
                </div>
              </div>

              {/* Traveller Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#FFE2CD] shadow-sm space-y-3 text-xs">
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase block">
                  বহনকারী সহযাত্রী
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">
                    {booking.travellerAvatar}
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-[#171717]">
                      {booking.travellerName}
                    </h5>
                    <div className="flex items-center gap-1 text-[11px] text-[#16A34A] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{booking.travellerRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Banner */}
            <SafetyBanner />
          </div>

          {/* Right Column: Pricing Receipt & Quick Actions (1 col) */}
          <div className="space-y-6">
            {/* Price & Escrow Breakdown Receipt */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFE2CD] shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE7]">
                <h4 className="font-black text-base text-[#171717]">
                  ভাড়া ও পেমেন্ট রশিদ
                </h4>
                <Badge
                  variant={
                    booking.paymentStatus === 'RELEASED'
                      ? 'verified'
                      : booking.paymentStatus === 'HELD'
                      ? 'primary'
                      : 'warning'
                  }
                  className="text-[11px]"
                >
                  {booking.paymentStatus === 'RELEASED' && 'পেমেন্ট রিলিজ সম্পন্ন'}
                  {booking.paymentStatus === 'HELD' && 'এসক্রোতে সুরক্ষিত'}
                  {booking.paymentStatus === 'UNPAID' && 'পরিশোধ বাকি'}
                  {booking.paymentStatus === 'REFUNDED' && 'ফেরত দেওয়া হয়েছে'}
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>সহযাত্রীর পার্সেল বহন ফি</span>
                  <span className="font-bold text-[#171717]">
                    ৳ {booking.priceBreakdown.travellerFee}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>BOHOK প্ল্যাটফর্ম সার্ভিস ফি</span>
                  <span className="font-bold text-[#171717]">
                    ৳ {booking.priceBreakdown.platformFee}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>ট্রাস্ট গ্যারান্টি ও সাপোর্ট ফি</span>
                  <span className="font-bold text-[#171717]">
                    ৳ {booking.priceBreakdown.trustGuarantee}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#F0ECE7] flex items-center justify-between font-black text-base text-[#171717]">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="text-[#FF6B00]">
                    ৳ {booking.priceBreakdown.total}
                  </span>
                </div>
              </div>

              {booking.paymentTransactionId && (
                <div className="bg-[#FFF7F0] p-3 rounded-xl border border-[#FFE2CD] text-[11px] text-[#6B6B6B] space-y-1">
                  <span className="block font-bold text-[#171717]">
                    লেনদেন ট্র্যাকিং কোড:
                  </span>
                  <span className="font-mono block">{booking.paymentTransactionId}</span>
                </div>
              )}
            </div>

            {/* Quick Actions & Dispute */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFE2CD] shadow-sm space-y-3 text-xs">
              <h5 className="font-bold text-[#171717]">সহায়তা ও নিরাপত্তা অপশন</h5>
              
              <Link href={`/booking/${booking.id}/dispute`} className="block">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full text-xs text-amber-800 border-amber-300 hover:bg-amber-50"
                  leftIcon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                >
                  সমস্যা বা বিরোধ রিপোর্ট করুন (Dispute)
                </Button>
              </Link>

              {/* Cancellation button if allowed */}
              {['PENDING_TRAVELLER', 'ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_HELD', 'READY_FOR_PICKUP'].includes(booking.status) && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                >
                  বুকিং বাতিল করুন
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-[#171717]">
                আপনি কি নিশ্চিতভাবে বাতিল করতে চান?
              </h4>
              <p className="text-xs text-[#6B6B6B]">
                পেমেন্ট সম্পন্ন থাকলে এসক্রো তহবিল স্বয়ংক্রিয়ভাবে প্রেরকের অ্যাকাউন্টে ফেরত দেওয়া হবে।
              </p>
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  বাতিলের কারণ নির্বাচন করুন
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#FFE2CD] focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="ব্যক্তিগত অসুবিধা">ব্যক্তিগত অসুবিধা</option>
                  <option value="পার্সেলের তথ্যে ভুল">পার্সেলের তথ্যে ভুল</option>
                  <option value="সহযাত্রীর সাথে সময় মিলছে না">সহযাত্রীর সাথে সময় মিলছে না</option>
                  <option value="অন্য মাধ্যমে পাঠানো হয়েছে">অন্য মাধ্যমে পাঠানো হয়েছে</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setCancelModalOpen(false)}
                  className="w-full"
                >
                  ফিরে যান
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCancel}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  বাতিল নিশ্চিত করুন
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center text-xs text-[#6B6B6B]">
          বুকিং তথ্য লোড হচ্ছে...
        </div>
      }
    >
      <BookingDetailContent />
    </React.Suspense>
  );
}
