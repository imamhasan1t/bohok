// BOHOK Phase 7 — Dispute & Dispute Resolution Registration Page
// Route: /booking/[bookingId]/dispute

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/useBooking';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { DisputeCategory } from '@/lib/booking/bookingTypes';
import {
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  UploadCloud,
  CheckCircle2,
  Clock,
  PhoneCall,
} from 'lucide-react';

function BookingDisputeContent() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const router = useRouter();

  const { booking, raiseDispute } = useBooking(bookingId);

  const [raisedByRole, setRaisedByRole] = useState<'sender' | 'traveller'>('sender');
  const [category, setCategory] = useState<DisputeCategory>('parcel_damaged');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const categoryOptions: Array<{ value: DisputeCategory; labelBn: string }> = [
    { value: 'parcel_damaged', labelBn: 'পার্সেল ক্ষতিগ্রস্ত বা ভাঙা অবস্থায় পাওয়া গেছে' },
    { value: 'parcel_missing', labelBn: 'পার্সেল নিখোঁজ বা সহযাত্রী খুঁজে পাচ্ছেন না' },
    { value: 'late_delivery', labelBn: 'অযৌক্তিক অতিরিক্ত বিলম্ব ও যোগাযোগ বিচ্ছিন্নতা' },
    { value: 'no_show', labelBn: 'পিকআপ স্থানে কেউ উপস্থিত হননি (নো-শো)' },
    { value: 'prohibited_items', labelBn: 'অননুমোদিত বা বিপজ্জনক পণ্য সন্দেহ' },
    { value: 'wrong_recipient', labelBn: 'ভুল ব্যক্তির কাছে হস্তান্তর চেষ্টা' },
    { value: 'other', labelBn: 'অন্যান্য গুরুতর অভিযোগ' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('অনুগ্রহ করে সমস্যার সংক্ষিপ্ত বিবরণ লিখুন।');
      return;
    }

    const selectedCat = categoryOptions.find((c) => c.value === category);
    raiseDispute(
      booking.id,
      raisedByRole,
      category,
      selectedCat?.labelBn || category,
      description
    );

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-20">
      <Container size="narrow" className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE7]">
          <div className="flex items-center gap-3">
            <Link
              href={`/booking/${booking.id}`}
              className="p-2 rounded-xl bg-white border border-[#F0ECE7] text-[#6B6B6B] hover:text-[#171717] hover:border-[#FFE2CD] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                সুরক্ষা ও মধ্যস্থতা সেবা
              </span>
              <h1 className="text-2xl font-black text-[#171717]">
                সমস্যা বা বিরোধ রিপোর্ট করুন
              </h1>
            </div>
          </div>

          <Badge variant="error" className="text-xs px-3 py-1">
            বুকিং #{booking.id}
          </Badge>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-red-200 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#171717]">
                বিরোধ আবেদন সফলভাবে নথিভুক্ত হয়েছে
              </h3>
              <p className="text-xs text-[#6B6B6B] max-w-md mx-auto">
                আপনার অভিযোগের ভিত্তিতে এসক্রো তহবিল সাময়িকভাবে স্থগিত রাখা হয়েছে। BOHOK সিকিউরিটি ও আরবিট্রেশন টিম উভয় পক্ষের সাথে যোগাযোগ করে আগামী ২৪ ঘণ্টার মধ্যে সমাধান নিশ্চিত করবে।
              </p>
            </div>

            {/* SLA Box */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl max-w-md mx-auto text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>সমাধানের সময়সীমা (SLA):</span>
              </div>
              <span className="font-bold">সর্বোচ্চ ২৪ ঘণ্টা</span>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link href={`/booking/${booking.id}`}>
                <Button variant="primary" size="md">
                  বুকিং স্ট্যাটাস দেখুন
                </Button>
              </Link>
              <Link href="/dashboard/sender">
                <Button variant="secondary" size="md">
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm space-y-6"
          >
            {/* Caller identity */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE7]">
              <div>
                <h4 className="font-extrabold text-sm text-[#171717]">
                  অভিযোগকারীর ভূমিকা
                </h4>
                <p className="text-xs text-[#6B6B6B]">
                  সঠিক ভূমিকা নির্বাচন করলে মধ্যস্থতা দ্রুত হয়
                </p>
              </div>

              <div className="flex items-center p-1 bg-[#F5EFEA] rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRaisedByRole('sender')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    raisedByRole === 'sender'
                      ? 'bg-white text-red-600 shadow-xs'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  প্রেরক হিসেবে
                </button>
                <button
                  type="button"
                  onClick={() => setRaisedByRole('traveller')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    raisedByRole === 'traveller'
                      ? 'bg-white text-red-600 shadow-xs'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  সহযাত্রী হিসেবে
                </button>
              </div>
            </div>

            {/* Dispute Category Radio / Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#171717]">
                সমস্যার প্রধান কারণ নির্বাচন করুন:
              </label>
              <div className="space-y-2">
                {categoryOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      category === opt.value
                        ? 'bg-red-50/60 border-red-300 text-red-950 font-bold'
                        : 'bg-white border-[#F0ECE7] text-[#171717] hover:bg-[#FFFDFB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disputeCategory"
                      value={opt.value}
                      checked={category === opt.value}
                      onChange={() => setCategory(opt.value)}
                      className="text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>{opt.labelBn}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171717]">
                ঘটনার বিস্তারিত বিবরণ দিন:
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="সমস্যাটি কখন ঘটেছে, কী হয়েছিল এবং কীভাবে সমাধান চান তা স্পষ্টভাবে উল্লেখ করুন..."
                className="w-full p-3 rounded-2xl border border-red-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Photo Proof Upload Mockup */}
            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-dashed border-[#FFE2CD] text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-[#FF6B00] mx-auto" />
              <div>
                <span className="text-xs font-bold text-[#171717] block">
                  প্রমাণ হিসেবে ছবি বা নথি সংযুক্ত করুন (ঐচ্ছিক ডেমো)
                </span>
                <span className="text-[10px] text-[#6B6B6B]">
                  ক্ষতিগ্রস্ত পার্সেল বা চ্যাট স্ক্রিনশট যুক্ত করুন
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploading(true);
                  setTimeout(() => setIsUploading(false), 1000);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#FFE2CD] text-[#FF6B00] font-bold hover:bg-[#FFF7F0] transition-colors"
              >
                {isUploading ? 'আপলোড হচ্ছে...' : 'ফাইল নির্বাচন করুন'}
              </button>
            </div>

            {/* Escrow Protection Notice */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  এসক্রো সুরক্ষা তাৎক্ষণিকভাবে সক্রিয় হবে:
                </span>
                <p className="text-[11px] mt-0.5">
                  বিরোধ দাখিল হওয়ার সাথে সাথেই এসক্রো অ্যাকাউন্ট থেকে অর্থ ছাড় প্রক্রিয়া বন্ধ করা হবে। তদন্ত নিষ্পত্তি না হওয়া পর্যন্ত কোনো পক্ষ অর্থ দাবি করতে পারবেন না।
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md"
              leftIcon={<ShieldAlert className="w-5 h-5" />}
            >
              বিরোধ অভিযোগ নথিভুক্ত করুন
            </Button>
          </form>
        )}
      </Container>
    </div>
  );
}

export default function BookingDisputePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center text-xs text-[#6B6B6B]">
          বিরোধ ফর্ম লোড হচ্ছে...
        </div>
      }
    >
      <BookingDisputeContent />
    </React.Suspense>
  );
}
