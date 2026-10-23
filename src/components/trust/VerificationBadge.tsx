'use client';

import React from 'react';
import { ShieldCheck, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  className?: string;
}

export function VerificationBadge({
  isPhoneVerified,
  isIdentityVerified,
  className = '',
}: VerificationBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {isPhoneVerified ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7]/70 border border-[#86EFAC]/60 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          <span>ফোন যাচাইকৃত</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
          <Phone className="w-3 h-3 text-[#9CA3AF]" />
          <span>ফোন অপ্রমাণিত</span>
        </span>
      )}

      {isIdentityVerified ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7]/70 border border-[#86EFAC]/60 px-2 py-0.5 rounded-md">
          <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
          <span>এনআইডি যাচাইকৃত</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF] bg-[#F9FAFB] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
          <AlertCircle className="w-3 h-3 text-[#D1D5DB]" />
          <span>পরিচয় যাচাই ডেমো</span>
        </span>
      )}
    </div>
  );
}
