'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ADMIN_SESSION_KEY = 'hastarekha_admin_session_v1';
const TEN_MINUTES_MS = 10 * 60 * 1000;

interface AdminSession {
  password: string;
  expiresAt: number;
}

interface AdminContextType {
  isAdmin: boolean;
  remainingSeconds: number;
  adminPassword: string | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  remainingSeconds: 0,
  adminPassword: null,
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check stored session
  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) {
        setIsAdmin(false);
        setRemainingSeconds(0);
        setAdminPassword(null);
        return;
      }

      const session: AdminSession = JSON.parse(raw);
      const now = Date.now();

      if (session.expiresAt && now < session.expiresAt && session.password) {
        setIsAdmin(true);
        setAdminPassword(session.password);
        setRemainingSeconds(Math.max(0, Math.ceil((session.expiresAt - now) / 1000)));
      } else {
        // Expired
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAdmin(false);
        setRemainingSeconds(0);
        setAdminPassword(null);
      }
    } catch {
      setIsAdmin(false);
      setRemainingSeconds(0);
      setAdminPassword(null);
    }
  }, []);

  // Check session on mount and 1-second ticker for remaining time
  useEffect(() => {
    const initTimer = setTimeout(() => {
      checkSession();
    }, 0);

    const interval = setInterval(() => {
      checkSession();
    }, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [checkSession]);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid admin passcode' };
      }

      const session: AdminSession = {
        password,
        expiresAt: Date.now() + TEN_MINUTES_MS,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      }

      setIsAdmin(true);
      setAdminPassword(password);
      setRemainingSeconds(600);
      setIsLoginModalOpen(false);

      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error verifying passcode';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
    setIsAdmin(false);
    setRemainingSeconds(0);
    setAdminPassword(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        remainingSeconds,
        adminPassword,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
