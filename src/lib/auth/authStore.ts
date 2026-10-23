// BOHOK Phase 6 — In-Memory Reactive Authentication Store
// Manages current user session, auth state machine, role versatility, and subscriber notifications

import { User, Session, AuthState, UserRole, AuthEventType, AuthEvent } from './authTypes';
import { maskPhoneNumber } from './authValidation';

export type AuthListener = (user: User | null, state: AuthState) => void;

export class AuthStore {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private authState: AuthState = 'LOGGED_OUT';
  private redirectAfterAuth: string | null = null;
  private listeners: Set<AuthListener> = new Set();
  private events: AuthEvent[] = [];

  // ==========================================
  // STATE MACHINE & TRANSITIONS
  // ==========================================

  public getAuthState(): AuthState {
    if (this.currentSession && this.isSessionExpired()) {
      this.authState = 'SESSION_EXPIRED';
    }
    return this.authState;
  }

  public setAuthState(nextState: AuthState): void {
    // Basic state machine validation
    const current = this.authState;
    if (current === nextState) return;

    this.authState = nextState;
    this.notify();
  }

  // ==========================================
  // SESSION & USER ACCESSORS
  // ==========================================

  public getCurrentUser(): User | null {
    if (this.currentSession && this.isSessionExpired()) {
      this.logout('SESSION_EXPIRED');
      return null;
    }
    return this.currentUser;
  }

  public getCurrentSession(): Session | null {
    if (this.currentSession && this.isSessionExpired()) {
      this.logout('SESSION_EXPIRED');
      return null;
    }
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getCurrentSession() !== null;
  }

  public isSessionExpired(): boolean {
    if (!this.currentSession) return false;
    return new Date() > new Date(this.currentSession.expiresAt);
  }

  // ==========================================
  // LOGIN & LOGOUT ACTIONS
  // ==========================================

  public login(user: User, durationHours = 24): Session {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const session: Session = {
      sessionId,
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.currentUser = user;
    this.currentSession = session;
    this.authState = 'AUTHENTICATED';

    this.emitEvent('LOGIN_SUCCESS', user.id, `ব্যবহারকারী সফলভাবে লগইন করেছেন (${user.name})`);
    this.notify();

    return session;
  }

  public logout(reason: AuthState = 'LOGGED_OUT'): void {
    const prevUserId = this.currentUser?.id;
    this.currentUser = null;
    this.currentSession = null;
    this.authState = reason;

    if (reason === 'SESSION_EXPIRED') {
      this.emitEvent('SESSION_EXPIRED', prevUserId, 'ব্যবহারকারীর লগইন সেশনের মেয়াদ শেষ হয়েছে।');
    } else {
      this.emitEvent('LOGOUT', prevUserId, 'ব্যবহারকারী লগআউট করেছেন।');
    }

    this.notify();
  }

  // ==========================================
  // ROLE VERSATILITY (SENDER | TRAVELLER | BOTH)
  // ==========================================

  public switchRole(newRole: UserRole): User {
    if (!this.currentUser) {
      throw new Error('No authenticated user to update role.');
    }

    this.currentUser = {
      ...this.currentUser,
      role: newRole,
    };

    this.notify();
    return this.currentUser;
  }

  // ==========================================
  // REDIRECT MANAGEMENT
  // ==========================================

  public setRedirectAfterAuth(path: string | null): void {
    this.redirectAfterAuth = path;
  }

  public getRedirectAfterAuth(): string | null {
    const path = this.redirectAfterAuth;
    this.redirectAfterAuth = null;
    return path;
  }

  // ==========================================
  // EVENT LOG & SUBSCRIPTION
  // ==========================================

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentUser, this.authState);
      } catch (err) {
        console.error('Error notifying auth listener:', err);
      }
    });
  }

  private emitEvent(
    type: AuthEventType,
    userId: string | undefined,
    descriptionBn: string,
    payload?: Record<string, unknown>
  ): void {
    this.events.push({
      id: `auth-evt-${Date.now()}`,
      type,
      userId,
      timestamp: new Date().toISOString(),
      descriptionBn,
      payload,
    });
  }

  public getEvents(): readonly AuthEvent[] {
    return this.events;
  }

  /**
   * Reset store (primarily for unit tests and clean prototype state)
   */
  public reset(): void {
    this.currentUser = null;
    this.currentSession = null;
    this.authState = 'LOGGED_OUT';
    this.redirectAfterAuth = null;
    this.events = [];
  }
}

// Global singleton instance
export const authStore = new AuthStore();
