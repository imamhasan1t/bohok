// BOHOK Phase 7 — Two-Sided Rating & Feedback Page
// Route: /booking/[bookingId]/rating

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/lib/booking/useBooking';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Star,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

function BookingRatingContent() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const router = useRouter();

  const { booking, submitRating } = useBooking(bookingId);

  const [role, setRole] = useState<'sender' | 'traveller'>('sender');
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [careScore, setCareScore] = useState(5);
  const [speedScore, setSpeedScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

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

  const tags =
    role === 'sender'
      ? [
          'পার্সেল সম্পূর্ণ অক্ষত ছিল',
          'নির্ধারিত সময়ের আগেই পৌঁছেছেন',
          'চমৎকার সৌজন্যবোধ ও যোগাযোগ',
          'খুবই যত্নশীল ও বিশ্বস্ত',
          'ভবিষ্যতেও ওনার সাথে পাঠাতে চাই',
        ]
      : [
          'পিকআপে একদম সময়মতো উপস্থিত',
          'পার্সেল সুন্দরভাবে সিল করা ছিল',
          'চমৎকার ভদ্র আচরণ',
          'সহজ ও স্পষ্ট যোগাযোগ',
        ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullComment = selectedTags.length
      ? `${selectedTags.join(', ')}। ${comment}`
      : comment || 'চমৎকার অভিজ্ঞতা!';

    submitRating(booking.id, role, stars, fullComment, {
      careScore,
      speedScore,
      communicationScore,
      punctualityScore: speedScore,
    });
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
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">
                দ্বিমুখী রেটিং ও রিভিউ
              </span>
              <h1 className="text-2xl font-black text-[#171717]">
                অভিজ্ঞতা শেয়ার করুন
              </h1>
            </div>
          </div>

          <Badge variant="verified" className="text-xs px-3 py-1">
            বুকিং #{booking.id}
          </Badge>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-green-200 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto ring-8 ring-green-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#171717]">
                আপনার মতামতের জন্য ধন্যবাদ!
              </h3>
              <p className="text-xs text-[#6B6B6B] max-w-md mx-auto">
                আপনার দেওয়া {stars} তারকা রেটিং এবং মতামত BOHOK কমিউনিটির ট্রাস্ট ও নির্ভরযোগ্যতা সুদৃঢ় করতে সহায়তা করবে।
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link href={`/booking/${booking.id}`}>
                <Button variant="outline" size="md">
                  বুকিং বিবরণ দেখুন
                </Button>
              </Link>
              <Link href="/dashboard/sender">
                <Button variant="primary" size="md">
                  ড্যাশবোর্ডে ফিরুন
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6"
          >
            {/* Role Tab */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE7]">
              <div>
                <h4 className="font-extrabold text-sm text-[#171717]">
                  আপনি কার মূল্যায়ন করছেন?
                </h4>
                <p className="text-xs text-[#6B6B6B]">
                  {role === 'sender'
                    ? `সহযাত্রী: ${booking.travellerName}`
                    : `প্রেরক: ${booking.senderName}`}
                </p>
              </div>

              <div className="flex items-center p-1 bg-[#F5EFEA] rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRole('sender')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    role === 'sender'
                      ? 'bg-white text-[#FF6B00] shadow-xs'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  প্রেরক হিসেবে রেটিং
                </button>
                <button
                  type="button"
                  onClick={() => setRole('traveller')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    role === 'traveller'
                      ? 'bg-white text-[#FF6B00] shadow-xs'
                      : 'text-[#6B6B6B]'
                  }`}
                >
                  সহযাত্রী হিসেবে রেটিং
                </button>
              </div>
            </div>

            {/* Big Interactive Stars Selector */}
            <div className="text-center py-4 space-y-2">
              <span className="text-xs text-[#6B6B6B] block">সামগ্রিক অভিজ্ঞতা নির্বাচন করুন</span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isActive = (hoverStars || stars) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverStars(starVal)}
                      onMouseLeave={() => setHoverStars(0)}
                      onClick={() => setStars(starVal)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-9 h-9 ${
                          isActive
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#D1C7BD]'
                        } transition-colors`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-sm font-bold text-[#FF6B00] block">
                {stars === 5 && 'অসাধারণ অভিজ্ঞতা (৫/৫)'}
                {stars === 4 && 'খুব ভালো (৪/৫)'}
                {stars === 3 && 'মোটামুটি সন্তোষজনক (৩/৫)'}
                {stars === 2 && 'উন্নতি প্রয়োজন (২/৫)'}
                {stars === 1 && 'খারাপ অভিজ্ঞতা (১/৫)'}
              </span>
            </div>

            {/* Criteria Breakdown Steppers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FFF7F0] rounded-2xl border border-[#FFE2CD] text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#171717] block">
                  {role === 'sender' ? 'পার্সেল সুরক্ষা' : 'প্যাকেজিং মান'}
                </span>
                <select
                  value={careScore}
                  onChange={(e) => setCareScore(Number(e.target.value))}
                  className="w-full p-2 bg-white rounded-xl border border-[#FFE2CD] text-xs font-bold"
                >
                  <option value={5}>৫ — অত্যন্ত যত্নশীল</option>
                  <option value={4}>৪ — ভালো</option>
                  <option value={3}>৩ — সাধারণ</option>
                  <option value={2}>২ — অসতর্ক</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#171717] block">সময়সীমা ও গতি</span>
                <select
                  value={speedScore}
                  onChange={(e) => setSpeedScore(Number(e.target.value))}
                  className="w-full p-2 bg-white rounded-xl border border-[#FFE2CD] text-xs font-bold"
                >
                  <option value={5}>৫ — একদম সময়মতো</option>
                  <option value={4}>৪ — সামান্য দেরি</option>
                  <option value={3}>৩ — দেরিতে</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#171717] block">সৌজন্য ও ব্যবহার</span>
                <select
                  value={communicationScore}
                  onChange={(e) => setCommunicationScore(Number(e.target.value))}
                  className="w-full p-2 bg-white rounded-xl border border-[#FFE2CD] text-xs font-bold"
                >
                  <option value={5}>৫ — চমৎকার ব্যবহার</option>
                  <option value={4}>৪ — ভদ্র</option>
                  <option value={3}>৩ — সাধারণ</option>
                </select>
              </div>
            </div>

            {/* Praise Tag Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#171717]">
                দ্রুত প্রশংসাসূচক ট্যাগ যোগ করুন:
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs'
                          : 'bg-white text-[#6B6B6B] border-[#F0ECE7] hover:border-[#FFE2CD]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#171717]">
                বিস্তারিত মন্তব্য (ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="আপনার ভ্রমণের বা পার্সেল হস্তান্তরের অভিজ্ঞতা কেমন ছিল তা সংক্ষেপে লিখুন..."
                className="w-full p-3 rounded-2xl border border-[#FFE2CD] text-xs focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              leftIcon={<Star className="w-5 h-5 fill-white" />}
            >
              রেটিং ও রিভিউ জমা দিন
            </Button>
          </form>
        )}
      </Container>
    </div>
  );
}

export default function BookingRatingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDFB] pt-24 pb-16 flex items-center justify-center text-xs text-[#6B6B6B]">
          রেটিং তথ্য লোড হচ্ছে...
        </div>
      }
    >
      <BookingRatingContent />
    </React.Suspense>
  );
}
