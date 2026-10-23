// BOHOK Phase 8 — Server Route Authentication Middleware
// Extracts token from Authorization header or HTTP-only cookie

import { NextRequest } from 'next/server';
import { serverConfig } from '../config';
import { AuthContextHelper, AuthContext } from './authContext';

export function getSessionTokenFromRequest(req: NextRequest | Request): string | null {
  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie
  const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const match = cookies.find((c) => c.startsWith(`${serverConfig.sessionCookieName}=`));
    if (match) {
      return match.split('=')[1].trim();
    }
  }

  return null;
}

export function authenticateRequest(req: NextRequest | Request): AuthContext {
  const token = getSessionTokenFromRequest(req);
  return AuthContextHelper.requireAuthFromToken(token);
}
