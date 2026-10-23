import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'primary'
  | 'softOrange'
  | 'verified'
  | 'neutral'
  | 'demo'
  | 'outline'
  | 'warning'
  | 'error';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  pulse?: boolean;
}

export function Badge({
  variant = 'softOrange',
  children,
  icon,
  pulse = false,
  className,
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-[#FF6B00] text-white font-semibold',
    softOrange:
      'bg-[#FFF7F0] text-[#E85D04] border border-[#FFE2CD] font-medium',
    verified:
      'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] font-medium',
    neutral:
      'bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] font-medium',
    demo:
      'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold tracking-wide',
    outline:
      'bg-transparent text-[#6B6B6B] border border-[#E5E7EB] font-medium',
    warning:
      'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-medium',
    error:
      'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
