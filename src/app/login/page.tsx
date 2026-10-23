'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/useAuth';
import { UserRole } from '@/lib/auth/authTypes';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  ShieldCheck,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { toBengaliNumerals } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { isAuthenticated, requestOtp, submitOtp, resendOtp, getRedirectAfterAuth } = useAuth();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('01711002233');
  const [role, setRole] = useState<UserRole>('BOTH');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>('123456');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      const destination = redirectParam || getRedirectAfterAuth() || '/profile';
      router.push(destination);
    }
  }, [isAuthenticated, redirectParam, router, getRedirectAfterAuth]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Handle phone submission
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await requestOtp(phone);
      if (result.success) {
        setStep('OTP');
        setDemoOtpHint(result.otpCodeDemo || '123456');
        setCountdown(60);
        setCanResend(false);
        // Focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(result.messageBn);
      }
    } catch (err: any) {
      setErrorMessage('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual digit input
  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      handleVerify(newDigits.join(''));
    }
  };

  // Handle keyboard backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for full 6-digit OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setOtpDigits(arr);
      otpInputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  // Verify and login
  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('সম্পূর্ণ ৬ সংখ্যার কোড লিখুন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await submitOtp(phone, code, role);
      if (result.success) {
        const destination = redirectParam || getRedirectAfterAuth() || '/profile';
        router.push(destination);
      } else {
        setErrorMessage(result.messageBn);
      }
    } catch (err: any) {
      setErrorMessage('কোড যাচাইয়ে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await resendOtp(phone);
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setDemoOtpHint(result.otpCodeDemo || '123456');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        setErrorMessage(result.messageBn);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Logins
  const handleQuickDemoLogin = (demoPhone: string, demoRole: UserRole) => {
    setPhone(demoPhone);
    setRole(demoRole);
    setStep('OTP');
    setDemoOtpHint('123456');
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FFF7F0]/40 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
              B
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7F0] border border-[#FFE2CD] text-[11px] font-bold text-[#E85D04]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>ফেজ ৬: অথেনটিকেশন ও ট্রাস্ট ফাউন্ডেশন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            BOHOK-এ প্রবেশ করুন
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B]">
            নিরাপদ পিয়ার-টু-পিয়ার পার্সেল প্ল্যাটফর্মে আপনার স্বাগতম।
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFE2CD] shadow-xl relative overflow-hidden">
          {/* Demo Mode Notice Badge */}
          <div className="bg-[#FFF7F0] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 py-2.5 mb-6 border-b border-[#FFE2CD] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#E85D04] font-bold">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>ডেমো মোড সক্রিয়</span>
            </div>
            <span className="text-[11px] font-medium text-[#6B6B6B]">
              শুধু ডেমো ব্যবহারের জন্য
            </span>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2.5 text-xs text-[#991B1B]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 'PHONE' ? (
              <motion.form
                key="step-phone"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                onSubmit={handleRequestOtp}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">
                    আপনার মোবাইল নম্বর
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B6B6B] select-none">
                      +৮৮
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="০১৭১১-০০২২৩৩"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-base font-semibold pl-14 pr-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-[#6B6B6B] mt-1.5 block leading-normal">
                    আপনার নম্বরে ৬ সংখ্যার ওটিপি যাচাইকরণ কোড পাঠানো হবে।
                  </span>
                </div>

                {/* Role Preference */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#171717]">
                    আপনার প্রাথমিক ব্যবহার
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'SENDER' as UserRole, label: '📦 পার্সেল' },
                      { id: 'TRAVELLER' as UserRole, label: '🧳 ভ্রমণ' },
                      { id: 'BOTH' as UserRole, label: '🤝 দুটোই' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          role === item.id
                            ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs'
                            : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:border-[#FF6B00]/50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full justify-center text-sm font-bold shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  কোড পাঠান
                </Button>

                {/* Fast Demo Autofills */}
                <div className="pt-3 border-t border-[#F0ECE7] space-y-2">
                  <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider block text-center">
                    বা এক ক্লিকে ডেমো প্রোফাইলে প্রবেশ করুন:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('01711002233', 'BOTH')}
                      className="text-left p-2.5 rounded-xl border border-[#FFE2CD] bg-[#FFF7F0] hover:bg-[#FFEBD8] transition-colors cursor-pointer text-xs"
                    >
                      <span className="font-extrabold text-[#171717] block">ইমাম হোসেন</span>
                      <span className="text-[10px] text-[#FF6B00] font-semibold">প্রেরক (ডকুমেন্ট)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('01819556677', 'TRAVELLER')}
                      className="text-left p-2.5 rounded-xl border border-[#FFE2CD] bg-[#FFF7F0] hover:bg-[#FFEBD8] transition-colors cursor-pointer text-xs"
                    >
                      <span className="font-extrabold text-[#171717] block">রহিম উল্লাহ</span>
                      <span className="text-[10px] text-[#16A34A] font-semibold">সহযাত্রী (কার)</span>
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setStep('PHONE')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6B6B] hover:text-[#171717] mb-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>নম্বর পরিবর্তন করুন</span>
                  </button>

                  <h3 className="text-base font-bold text-[#171717]">
                    আপনার মোবাইলে পাঠানো ৬ সংখ্যার কোড দিন
                  </h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {phone}-এ ওটিপি কোড পাঠানো হয়েছে।
                  </p>
                </div>

                {/* 6 Digit Big Inputs */}
                <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 border-[#E5E7EB] bg-white text-[#171717] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Demo OTP Banner Callout */}
                {demoOtpHint && (
                  <div className="p-3 rounded-2xl bg-[#FFF7F0] border border-[#FF6B00]/30 flex items-center justify-between text-xs">
                    <span className="text-[#E85D04] font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      ডেমো OTP: <strong className="font-mono font-bold text-[#FF6B00] text-sm">{demoOtpHint}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpDigits(['1', '2', '3', '4', '5', '6']);
                      }}
                      className="text-[#FF6B00] font-bold underline hover:text-[#E85D04] cursor-pointer"
                    >
                      স্বয়ংক্রিয় পূরণ
                    </button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  onClick={() => handleVerify()}
                  className="w-full justify-center text-sm font-bold shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  কোড নিশ্চিত করুন
                </Button>

                {/* Resend OTP */}
                <div className="text-center pt-1">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>নতুন কোড পাঠান</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">
                      {toBengaliNumerals(countdown)} সেকেন্ড পর পুনরায় কোড চাইতে পারবেন
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust & Transparency Footnote */}
        <p className="text-[11px] text-[#6B6B6B] text-center max-w-sm mx-auto leading-relaxed">
          * BOHOK প্রোটোটাইপ সেশনের জন্য সিমুলেটেড এসএমএস ব্যবহার করে। কোনো বাণিজ্যিক এসএমএস বা ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 pb-16 bg-[#FFF7F0]/40 flex flex-col justify-center items-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black text-2xl shadow-md animate-pulse">
            B
          </div>
          <span className="text-xs font-bold text-[#E85D04] mt-3">লোড হচ্ছে...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
