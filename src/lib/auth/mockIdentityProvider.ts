// BOHOK Phase 6 — Mock Identity Provider Abstraction
// Interface ready for a future approved Bangladesh Government Identity / Porichoy NID verification provider.
// SECURITY PRINCIPLE: Never stores NID numbers or document images in frontend state.

export interface IdentityVerificationProvider {
  startVerification(userId: string): Promise<{
    sessionId: string;
    status: 'PENDING' | 'READY_FOR_PROVIDER';
    noticeBn: string;
  }>;
  getVerificationStatus(userId: string): Promise<{
    status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED';
    isVerified: boolean;
    messageBn: string;
  }>;
  cancelVerification(userId: string): Promise<boolean>;
}

export class MockIdentityProvider implements IdentityVerificationProvider {
  public async startVerification(userId: string) {
    return {
      sessionId: `idv-session-${userId}-${Date.now()}`,
      status: 'READY_FOR_PROVIDER' as const,
      noticeBn:
        'পরবর্তী ফেজে জাতীয় পরিচয়পত্র (এনআইডি) ভেরিফিকেশন চালু হবে। এই সংস্করণে পরিচয় যাচাই স্থগিত রয়েছে।',
    };
  }

  public async getVerificationStatus(userId: string) {
    // Current demo architecture legitimately sets identity as unverified
    return {
      status: 'UNVERIFIED' as const,
      isVerified: false,
      messageBn: 'এই সংস্করণে সরকারি পরিচয় যাচাই সক্রিয় নয়। পরবর্তী ধাপে যাচাই করা যাবে।',
    };
  }

  public async cancelVerification(_userId: string): Promise<boolean> {
    return true;
  }
}

export const mockIdentityProvider = new MockIdentityProvider();
