'use client';

import React from 'react';
import { UserRole } from '@/lib/auth/authTypes';
import { Package, Luggage, Handshake, Check } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  className?: string;
}

export function RoleSelector({ currentRole, onSelectRole, className = '' }: RoleSelectorProps) {
  const roles: Array<{
    id: UserRole;
    icon: typeof Package;
    titleBn: string;
    subBn: string;
    emoji: string;
  }> = [
    {
      id: 'SENDER',
      icon: Package,
      titleBn: 'পার্সেল পাঠাব',
      subBn: 'বিশ্বস্ত সহযাত্রীর মাধ্যমে শহর থেকে শহরে পার্সেল প্রেরণ',
      emoji: '📦',
    },
    {
      id: 'TRAVELLER',
      icon: Luggage,
      titleBn: 'যাত্রার সাথে পার্সেল বহন করব',
      subBn: 'স্বাভাবিক যাতায়াতে অতিরিক্ত স্পেস শেয়ার করে উপার্জনের সুযোগ',
      emoji: '🧳',
    },
    {
      id: 'BOTH',
      icon: Handshake,
      titleBn: 'দুটোই করি',
      subBn: 'প্রয়োজনে পার্সেল পাঠাব এবং নিয়মিত ভ্রমণের সময় বহন করব',
      emoji: '🤝',
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
        আপনার প্রধান ভূমিকা নির্বাচন করুন
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roles.map((item) => {
          const isSelected = currentRole === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRole(item.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
                isSelected
                  ? 'bg-[#FFF7F0] border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/40'
                  : 'bg-white border-[#FFE2CD] hover:border-[#FF6B00]/50 hover:bg-[#FFF7F0]/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl mb-2 block">{item.emoji}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <h4 className="font-extrabold text-[#171717] text-sm group-hover:text-[#FF6B00] transition-colors">
                {item.titleBn}
              </h4>
              <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
                {item.subBn}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
