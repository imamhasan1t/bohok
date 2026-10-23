'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { UserRole } from '@/lib/auth/authTypes';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { TrustSummary } from '@/components/trust/TrustSummary';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  ShieldCheck,
  Star,
  Phone,
  Package,
  Luggage,
  Calendar,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, switchRole, getTrustSignals } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFF7F0]/30 px-4">
        <AuthGuard fallbackNoticeBn="আপনার প্রোফাইল দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।">
          <div />
        </AuthGuard>
      </div>
    );
  }

  const signals = getTrustSignals(user);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FFF7F0]/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#F0ECE7]">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-20 h-20 rounded-3xl bg-[#FFF7F0] border-2 border-[#FF6B00] flex items-center justify-center text-[#FF6B00] font-black text-3xl shadow-sm shrink-0">
                {user.avatarInitials}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">
                    {user.name}
                  </h1>
                  <Badge variant="verified" className="text-xs">
                    {signals.trustLevelBn}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#6B6B6B] flex-wrap">
                  <span className="font-semibold text-[#171717] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                    {user.maskedPhone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    যুক্ত হয়েছেন: {user.createdAt.slice(0, 10)}
                  </span>
                </div>

                <VerificationBadge
                  isPhoneVerified={user.isPhoneVerified}
                  isIdentityVerified={user.isIdentityVerified}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              লগআউট
            </Button>
          </div>

          {/* Role Switcher */}
          <RoleSelector
            currentRole={user.role}
            onSelectRole={(newRole: UserRole) => switchRole(newRole)}
          />
        </div>

        {/* Trust Signals Section */}
        <TrustSummary signals={signals} userName={user.name} />

        {/* Verification Hub CTA Card */}
        <div className="bg-gradient-to-r from-[#FFF7F0] to-[#FFEFE2] rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              যাচাইকরণ কেন্দ্র (Verification Center)
            </span>
            <h3 className="text-xl font-black text-[#171717]">
              আপনার পরিচয় ও বিশ্বাসযোগ্যতা যাচাই করুন
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B]">
              আপনার মোবাইল নম্বর ডেমো হিসেবে যাচাই করা হয়েছে। সরকারি জাতীয় পরিচয়পত্র ভেরিফিকেশন পরবর্তী ফেজে উন্মুক্ত করা হবে।
            </p>
          </div>

          <Link href="/verification">
            <Button
              variant="primary"
              size="md"
              className="whitespace-nowrap shadow-sm text-xs font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              যাচাই কেন্দ্রে যান
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/send" className="block group">
            <div className="bg-white p-6 rounded-3xl border border-[#FFE2CD] hover:border-[#FF6B00] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7F0] text-[#FF6B00] flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#171717] group-hover:text-[#FF6B00] transition-colors">
                    পার্সেল পাঠান
                  </h4>
                  <p className="text-xs text-[#6B6B6B]">সহযাত্রী খুঁজে নিন ও পার্সেল বুক করুন</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#FF6B00] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/travel" className="block group">
            <div className="bg-white p-6 rounded-3xl border border-[#FFE2CD] hover:border-[#FF6B00] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7F0] text-[#FF6B00] flex items-center justify-center">
                  <Luggage className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#171717] group-hover:text-[#FF6B00] transition-colors">
                    ভ্রমণ পোস্ট করুন
                  </h4>
                  <p className="text-xs text-[#6B6B6B]">যাত্রাপথে পার্সেল বহন করে আয় করুন</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#FF6B00] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
