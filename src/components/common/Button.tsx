'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'softOrange';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-[#FF6B00] text-white hover:bg-[#E85D04] shadow-[0_4px_14px_rgba(255,107,0,0.28)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.36)]',
      secondary:
        'bg-white text-[#171717] border border-[#E5E7EB] hover:bg-[#FFF7F0] hover:border-[#FFE2CD] shadow-sm',
      outline:
        'bg-transparent text-[#FF6B00] border border-[#FF6B00] hover:bg-[#FFF7F0]',
      ghost:
        'bg-transparent text-[#171717] hover:bg-[#FFF7F0] hover:text-[#FF6B00]',
      softOrange:
        'bg-[#FFF7F0] text-[#E85D04] border border-[#FFE2CD] hover:bg-[#FFE7D4]',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium rounded-lg',
      md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
      lg: 'text-base px-6 py-3.5 gap-2.5 rounded-xl font-semibold',
      xl: 'text-lg px-8 py-4 gap-3 rounded-2xl font-bold',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            অপেক্ষা করুন...
          </span>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
