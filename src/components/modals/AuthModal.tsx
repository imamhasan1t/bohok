'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck, Phone, ArrowRight, CheckCircle2, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { requestOtp, submitOtp, isAuthenticated, user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('01711002233');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await requestOtp(phoneNumber);
    setIsLoading(false);

    if (result.success) {
      setIsOtpSent(true);
      setOtpCode('123456'); // demo autofill for convenience
    } else {
      setErrorMessage(result.messageBn);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await submitOtp(phoneNumber, otpCode);
    setIsLoading(false);

    if (result.success) {
      onClose();
      router.push('/profile');
    } else {
      setErrorMessage(result.messageBn);
    }
  };

  const handleReset = () => {
    setIsOtpSent(false);
    setOtpCode('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="BOHOK-এ প্রবেশ করুন"
      subtitle="আপনার বাংলাদেশি মোবাইল নম্বর দিয়ে লগইন বা রেজিস্টার করুন"
    >
      <div className="space-y-4 pt-1">
        <div className="bg-[#FFF7F0] p-3 rounded-2xl border border-[#FFE2CD] flex items-center justify-between text-xs text-[#E85D04]">
          <span className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            ডেমো মোড সক্রিয় (OTP: 123456)
          </span>
          <Link
            href="/login"
            onClick={onClose}
            className="text-[#FF6B00] font-bold underline hover:text-[#E85D04]"
          >
            পূর্ণাঙ্গ লগইন পেজ
          </Link>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                মোবাইল নম্বর
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6B6B6B]">
                  +৮৮
                </span>
                <input
                  type="tel"
                  required
                  placeholder="০১৭১১-০০২২৩৩"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-sm pl-14 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <span className="text-[11px] text-[#6B6B6B] mt-1 block">
                আপনার নম্বরে ৬ সংখ্যার ওটিপি যাচাইকরণ কোড পাঠানো হবে।
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              কোড পাঠান
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                ৬ সংখ্যার ওটিপি কোড
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center text-xl font-bold tracking-widest py-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00]"
              />
              <span className="text-[11px] text-[#16A34A] mt-1 block text-center font-semibold">
                ✓ ডেমো ওটিপি কোড: 123456
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              লগইন নিশ্চিত করুন
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
