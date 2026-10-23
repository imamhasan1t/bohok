// Route: POST /api/auth/logout

import { NextRequest } from 'next/server';
import { getSessionTokenFromRequest } from '@/lib/server/auth/authMiddleware';
import { serverSessionStore } from '@/lib/server/auth/session';
import { serverConfig } from '@/lib/server/config';
import { AuditLogger } from '@/lib/server/audit/auditLogger';
import { successResponse, errorResponse } from '@/lib/server/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) {
      const session = serverSessionStore.getSession(token);
      if (session) {
        AuditLogger.log({
          actorUserId: session.userId,
          entityType: 'user',
          entityId: session.userId,
          eventType: 'AUTH_LOGOUT',
        });
      }
      serverSessionStore.invalidateSession(token);
    }

    const res = successResponse({ message: 'Logged out successfully' });
    res.cookies.set({
      name: serverConfig.sessionCookieName,
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
