'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { Button } from '@/components/common/Button';
import { ShieldCheck, LogIn, ArrowRight } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackNoticeBn?: string;
  redirectUrl?: string;
}

export function AuthGuard({
  children,
  fallbackNoticeBn = 'এই সেবাটি ব্যবহার করতে অনুগ্রহ করে প্রথমে BOHOK-এ প্রবেশ করুন।',
  redirectUrl = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, setRedirectAfterAuth } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    const handleLoginClick = () => {
      if (typeof window !== 'undefined') {
        setRedirectAfterAuth(window.location.pathname);
      }
      router.push(redirectUrl);
    };

    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#FFE2CD] text-center space-y-5 max-w-lg mx-auto shadow-sm my-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF7F0] border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#171717]">
            লগইন প্রয়োজন
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            {fallbackNoticeBn}
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleLoginClick}
            className="w-full justify-center"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            লগইন / রেজিস্টার করুন
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
