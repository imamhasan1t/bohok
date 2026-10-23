// BOHOK Phase 8 — Server Auth Context & IDOR Protection Guards
// Derives sensitive identities strictly from authenticated session

import { serverSessionStore, ServerSession } from './session';
import { serverDb } from '../db/memoryDb';
import { DbUser, DbUserProfile, DbBooking } from '../db/dbTypes';
import { AppErrors } from '../errors/appErrors';

export interface AuthContext {
  user: DbUser;
  profile: DbUserProfile;
  session: ServerSession;
}

export const AuthContextHelper = {
  /**
   * Resolves authentication context from token
   * Throws AppErrors.authRequired() if missing or invalid
   */
  requireAuthFromToken(token: string | null | undefined): AuthContext {
    if (!token) {
      throw AppErrors.authRequired();
    }

    const session = serverSessionStore.getSession(token);
    if (!session) {
      throw AppErrors.authRequired('Invalid or expired session token', 'সেশনের মেয়াদ শেষ হয়ে গেছে। পুনরায় লগইন করুন।');
    }

    const user = serverDb.users.get(session.userId);
    const profile = serverDb.userProfiles.get(session.userId);

    if (!user || !profile) {
      throw AppErrors.authRequired('User account not found', 'ব্যবহারকারীর অ্যাকাউন্ট পাওয়া যায়নি।');
    }

    return { user, profile, session };
  },

  /**
   * IDOR Protection: Checks if user is a participant of the booking
   */
  assertCanAccessBooking(booking: DbBooking, userId: string): void {
    if (booking.senderId !== userId && booking.travellerId !== userId) {
      throw AppErrors.forbidden(
        'User is not a participant of this booking',
        'আপনার এই বুকিংয়ের তথ্যাবলি দেখার অনুমতি নেই।'
      );
    }
  },

  /**
   * IDOR Protection: Asserts that caller is the designated traveller
   */
  assertIsTraveller(booking: DbBooking, userId: string): void {
    if (booking.travellerId !== userId) {
      throw AppErrors.forbidden(
        'User is not the assigned traveller for this booking',
        'কেবলমাত্র দায়িত্বপ্রাপ্ত সহযাত্রী এই কাজটি সম্পন্ন করতে পারেন।'
      );
    }
  },

  /**
   * IDOR Protection: Asserts that caller is the booking sender
   */
  assertIsSender(booking: DbBooking, userId: string): void {
    if (booking.senderId !== userId) {
      throw AppErrors.forbidden(
        'User is not the sender of this parcel',
        'কেবলমাত্র পার্সেল প্রেরক এই কাজটি সম্পন্ন করতে পারেন।'
      );
    }
  },
};
