import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api';

type User = any;

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
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
    await setToken(r.token); setUser(r.user); return r.user;
  };
  const googleExchange = async (session_id: string, role = 'student') => {
    const r = await api('/auth/google/exchange', { method: 'POST', body: JSON.stringify({ session_id, role }) });
    await setToken(r.token); setUser(r.user); return r.user;
  };
  const logout = async () => { await setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, googleExchange, logout, refresh, setUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
