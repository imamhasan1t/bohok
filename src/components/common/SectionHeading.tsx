import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

interface SectionHeadingProps {
  badgeText?: string;
  badgePulse?: boolean;
  title: string;
  highlightText?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  badgeText,
  badgePulse = false,
  title,
  highlightText,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl mb-12 sm:mb-16',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {badgeText && (
        <div className="mb-3.5 inline-block">
          <Badge variant="softOrange" pulse={badgePulse}>
            {badgeText}
          </Badge>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#171717] leading-tight">
        {title}{' '}
        {highlightText && (
          <span className="text-[#FF6B00] relative inline-block">
            {highlightText}
            <span className="absolute left-0 bottom-0.5 w-full h-1 bg-[#FFE2CD] -z-10 rounded-full" />
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="mt-3.5 text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
