import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  borderAccent?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Card({
  children,
  className,
  interactive = false,
  borderAccent = false,
  padding = 'md',
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border transition-all duration-300',
        borderAccent ? 'border-[#FFE2CD]' : 'border-[#EFEFEF]',
        'shadow-[0_2px_8px_-2px_rgba(23,23,23,0.04)]',
        interactive &&
          'hover:shadow-[0_12px_24px_-6px_rgba(255,107,0,0.1)] hover:border-[#FFE2CD] hover:-translate-y-0.5 cursor-pointer',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
