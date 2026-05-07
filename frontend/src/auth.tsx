import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api';

type User = any;

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<any>;
  verifyEmail: (email: string, code: string) => Promise<User>;
  resendCode: (email: string, purpose?: 'verify'|'reset') => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, code: string, new_password: string) => Promise<any>;
  googleExchange: (sessionId: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = await getToken();
    if (!t) { setUser(null); setLoading(false); return; }
    try {
      const me = await api('/auth/me');
      setUser(me);
    } catch {
      await setToken(null);
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    await setToken(r.token); setUser(r.user); return r.user;
  };
  const register = async (payload: any) => {
    const r = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    if (r.requires_verification) return r;
    await setToken(r.token); setUser(r.user); return r.user;
  };
  const verifyEmail = async (email: string, code: string) => {
    const r = await api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) });
    await setToken(r.token); setUser(r.user); return r.user;
  };
  const resendCode = async (email: string, purpose: 'verify'|'reset' = 'verify') =>
    api('/auth/resend-code', { method: 'POST', body: JSON.stringify({ email, purpose }) });
  const forgotPassword = async (email: string) =>
    api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  const resetPassword = async (email: string, code: string, new_password: string) =>
    api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, new_password }) });
  const googleExchange = async (session_id: string, role = 'student') => {
    const r = await api('/auth/google/exchange', { method: 'POST', body: JSON.stringify({ session_id, role }) });
    await setToken(r.token); setUser(r.user); return r.user;
  };
  const logout = async () => { await setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, verifyEmail, resendCode, forgotPassword, resetPassword, googleExchange, logout, refresh, setUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
