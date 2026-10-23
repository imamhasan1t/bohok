'use client';

import { useState, useEffect } from 'react';
import { User, Session, AuthState, UserRole } from './authTypes';
import { authStore } from './authStore';
import { authService } from './authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authStore.getCurrentUser());
  const [session, setSession] = useState<Session | null>(authStore.getCurrentSession());
  const [authState, setAuthState] = useState<AuthState>(authStore.getAuthState());

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = authStore.subscribe((updatedUser, state) => {
      setUser(updatedUser);
      setSession(authStore.getCurrentSession());
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    session,
    authState,
    isAuthenticated: authStore.isAuthenticated(),
    requestOtp: (phone: string) => authService.requestOtp(phone),
    submitOtp: (phone: string, otp: string, role?: UserRole, name?: string) =>
      authService.submitOtp(phone, otp, role, name),
    resendOtp: (phone: string) => authService.resendOtp(phone),
    logout: () => authService.logout(),
    switchRole: (role: UserRole) => authService.switchRole(role),
    getTrustSignals: (u?: User) => authService.getTrustSignals(u || user!),
    setRedirectAfterAuth: (path: string | null) => authStore.setRedirectAfterAuth(path),
    getRedirectAfterAuth: () => authStore.getRedirectAfterAuth(),
  };
}
