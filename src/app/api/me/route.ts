// Route: GET /api/me

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth/authMiddleware';
import { serverDb } from '@/lib/server/db/memoryDb';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roles = serverDb.userRoles.get(auth.user.id) || [];
    const travellerProfile = serverDb.travellerProfiles.get(auth.user.id);
    const senderProfile = serverDb.senderProfiles.get(auth.user.id);

    return successResponse({
      user: {
        id: auth.user.id,
        phone: auth.user.phone,
        name: auth.profile.name,
        avatarInitials: auth.profile.avatarInitials,
        verificationStatus: auth.profile.verificationStatus,
        isPhoneVerified: auth.profile.isPhoneVerified,
        isIdentityVerified: auth.profile.isIdentityVerified,
        roles: roles.map((r) => r.role),
        travellerProfile,
        senderProfile,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
