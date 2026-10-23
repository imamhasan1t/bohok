// BOHOK Phase 6 — Authentication Validation Utilities
// Handles Bangladeshi phone numbers (English & Bengali numerals) and OTP verification rules

export function normalizeBengaliNumeralsToEnglish(input: string): string {
  const bnToEnMap: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return input.replace(/[০-৯]/g, (w) => bnToEnMap[w] || w);
}

/**
 * Validates and normalizes a Bangladeshi mobile number.
 * Accepts formats: 017XXXXXXXX, +88017XXXXXXXX, 018XX-XXXXXX with English or Bengali numerals.
 */
export function validateBangladeshiPhone(rawInput: string): {
  isValid: boolean;
  normalizedPhone?: string;
  errorBn?: string;
} {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, errorBn: 'মোবাইল নম্বর লিখুন।' };
  }

  // 1. Convert Bengali numerals to standard English digits and strip spaces/hyphens
  const cleaned = normalizeBengaliNumeralsToEnglish(rawInput).replace(/[\s\-_]/g, '');

  // 2. Extract digits and match BD phone pattern
  let digits = cleaned;
  if (digits.startsWith('+880')) {
    digits = digits.substring(3);
  } else if (digits.startsWith('880')) {
    digits = digits.substring(2);
  }

  // Digits should now start with '01' and have total 11 digits
  const bdMobileRegex = /^01[3-9]\d{8}$/;
  if (!bdMobileRegex.test(digits)) {
    return {
      isValid: false,
      errorBn: 'সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: ০১৭১১-XXXXXX)।',
    };
  }

  return {
    isValid: true,
    normalizedPhone: `+88${digits}`,
  };
}

/**
 * Masks a mobile number for safe public display.
 * Example: "+8801711002233" -> "+880 17***-**233"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^\d+]/g, '');

  if (digits.length >= 11) {
    const end = digits.slice(-3);
    const prefix = digits.startsWith('+880')
      ? '+880 ' + digits.substring(4, 6)
      : digits.startsWith('01')
      ? digits.substring(0, 4)
      : '01**';
    return `${prefix}***-**${end}`;
  }

  return '০১৭**-***২৩৩';
}

/**
 * Validates a 6-digit OTP code.
 */
export function validateOtpInput(otp: string): {
  isValid: boolean;
  cleanedOtp?: string;
  errorBn?: string;
} {
  if (!otp) {
    return { isValid: false, errorBn: '৬ সংখ্যার ওটিপি কোড লিখুন।' };
  }

  const cleaned = normalizeBengaliNumeralsToEnglish(otp).replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleaned)) {
    return { isValid: false, errorBn: 'কোডটি অবশ্যই ৬ সংখ্যার হতে হবে।' };
  }

  return { isValid: true, cleanedOtp: cleaned };
}
