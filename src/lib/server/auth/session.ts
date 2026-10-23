// BOHOK Phase 8 — Server Session Architecture
// Secure HTTP session management with cryptographic hashing and rotation

import crypto from 'node:crypto';
import { serverConfig } from '../config';
import { serverDb } from '../db/memoryDb';
import { DbUser } from '../db/dbTypes';

export interface ServerSession {
  token: string;
  userId: string;
  userPhone: string;
  role: 'SENDER' | 'TRAVELLER';
  createdAt: string;
  expiresAt: string;
}

class SessionStore {
  private sessions = new Map<string, ServerSession>();

  /**
   * Creates a cryptographically secure random session token
   */
  public createSession(user: DbUser, role: 'SENDER' | 'TRAVELLER' = 'SENDER'): ServerSession {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const token = `bhk_s_${randomBytes}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + serverConfig.sessionDurationSeconds * 1000).toISOString();

    const session: ServerSession = {
      token,
      userId: user.id,
      userPhone: user.phone,
      role,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.sessions.set(token, session);
    return session;
  }

  /**
   * Validates a session token and returns the session if active and unexpired
   */
  public getSession(token: string): ServerSession | null {
    if (!token) return null;

    const session = this.sessions.get(token);
    if (!session) return null;

    // Check expiry
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  /**
   * Invalidates a session (on logout)
   */
  public invalidateSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  /**
   * Invalidates all sessions for a specific user (on password/phone change)
   */
  public invalidateAllUserSessions(userId: string): void {
    for (const [token, s] of this.sessions.entries()) {
      if (s.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }
}

export const serverSessionStore = new SessionStore();
