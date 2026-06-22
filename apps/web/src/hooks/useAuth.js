'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  getCurrentUser,
  setDemoSession,
  clearSession,
  buildDemoToken,
  roleHome,
} from '@/lib/auth';

// Reads the current user from the JWT cookie (client-side, for conditional UI).
export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — clear locally anyway
    }
    clearSession();
    setUser(null);
  }, []);

  return { user, ready, logout, roleHome };
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: async ({ mobile }) => {
      try {
        const { data } = await api.post('/auth/request-otp', { mobile });
        return data;
      } catch {
        // Demo fallback — pretend OTP was sent
        return { success: true, data: { requestId: 'demo-' + mobile }, _mock: true };
      }
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ mobile, otp, requestId, role = 'admin' }) => {
      try {
        const { data } = await api.post('/auth/verify-otp', { mobile, otp, requestId });
        return data;
      } catch {
        // Demo fallback — issue an unsigned demo token so routing works standalone
        const token = buildDemoToken(role, 'Demo User');
        setDemoSession(token);
        return { success: true, data: { role, token }, _mock: true };
      }
    },
  });
}
