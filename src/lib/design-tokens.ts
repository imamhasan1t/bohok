// BOHOK Design Token System
// Phase 1 Architecture Foundation

export const BOHOK_COLORS = {
  primary: '#FF6B00',        // Signature Brand Orange
  deepOrange: '#E85D04',     // Hover / Depth / Accent Orange
  softBackground: '#FFF7F0', // Warm Peach / Orange Tint
  subtleBorder: '#FFE2CD',   // Warm boundary accent
  pureWhite: '#FFFFFF',      // Canvas Background
  primaryText: '#171717',    // High-contrast Bengali typography
  secondaryText: '#6B6B6B',  // Secondary / Meta typography
  borderNeutral: '#EFEFEF',  // Neutral UI borders
  surfaceNeutral: '#F9FAFB', // Off-white secondary surfaces
  verifiedGreen: '#16A34A',  // Trust & NID verification badge
  verifiedGreenLight: '#DCFCE7', // Trust badge background
  warningAmber: '#D97706',   // Notice / alert status
  mapCanvas: '#FBFBFA',      // Minimal Mapbox style clean canvas
  mapRoad: '#EDEAE4',        // Secondary highway representation
  mapWater: '#E2EEF8',       // Water bodies (Meghna & Gomti rivers)
} as const;

export const BOHOK_FONTS = {
  bengali: 'var(--font-bengali), "Hind Siliguri", "Noto Sans Bengali", "Kalpurush", "SolaimanLipi", sans-serif',
  sans: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
} as const;

export const BOHOK_SHADOWS = {
  sm: '0 1px 2px 0 rgba(23, 23, 23, 0.04)',
  card: '0 2px 8px -2px rgba(23, 23, 23, 0.06), 0 1px 4px -1px rgba(23, 23, 23, 0.04)',
  elevated: '0 12px 32px -8px rgba(255, 107, 0, 0.12), 0 4px 16px -4px rgba(23, 23, 23, 0.06)',
  glow: '0 0 24px rgba(255, 107, 0, 0.25)',
  modal: '0 24px 48px -12px rgba(23, 23, 23, 0.18)',
} as const;

export const BOHOK_RADIUS = {
  sm: '0.375rem',  // 6px
  md: '0.625rem',  // 10px
  lg: '0.875rem',  // 14px
  xl: '1.25rem',   // 20px
  full: '9999px',
} as const;

export const BOHOK_TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  standard: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  gentle: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
