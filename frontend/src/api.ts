import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function getToken() {
  return await AsyncStorage.getItem('tamkeen_token');
}

export async function setToken(t: string | null) {
  if (t) await AsyncStorage.setItem('tamkeen_token', t);
  else await AsyncStorage.removeItem('tamkeen_token');
}

export async function api(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const detail = data?.detail;
    const msg = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((e: any) => e.msg || JSON.stringify(e)).join(' ')
      : (data?.message || `خطأ ${res.status}`);
    throw new Error(msg);
  }
  return data;
}
