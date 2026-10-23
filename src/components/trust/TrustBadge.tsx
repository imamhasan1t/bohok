'use client';

import React from 'react';
import { ShieldCheck, Phone, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface TrustBadgeProps {
  type: 'phone_verified' | 'identity_pending' | 'super_traveller' | 'new_member';
  className?: string;
  size?: 'sm' | 'md';
}

export function TrustBadge({ type, className = '', size = 'sm' }: TrustBadgeProps) {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  const iconSize = isSm ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (type) {
    case 'phone_verified':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] shadow-2xs ${sizeClasses} ${className}`}
        >
          <CheckCircle className={`${iconSize} text-[#16A34A]`} />
          <span>✓ ফোন যাচাইকৃত</span>
        </span>
      );

    case 'identity_pending':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] ${sizeClasses} ${className}`}
        >
          <AlertCircle className={`${iconSize} text-[#9CA3AF]`} />
          <span>পরিচয় যাচাই হয়নি</span>
        </span>
      );

    case 'super_traveller':
      return (
        <span
          className={`inline-flex items-center gap-1 font-black rounded-full bg-[#FFF7F0] text-[#E85D04] border border-[#FFE2CD] shadow-2xs ${sizeClasses} ${className}`}
        >
          <Star className={`${iconSize} fill-[#FF6B00] text-[#FF6B00]`} />
          <span>বিশ্বস্ত সহযাত্রী</span>
        </span>
      );

    case 'new_member':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] ${sizeClasses} ${className}`}
        >
          <ShieldCheck className={`${iconSize} text-[#9CA3AF]`} />
          <span>নতুন প্রোফাইল</span>
        </span>
      );
  }
}
