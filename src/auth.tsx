import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { isSupabaseEnabled, supabase } from './supabase';
import { syncAll } from './db';

const LOCAL_KEY = 'titansfc.admin.session';
const LOCAL_LOGIN = (import.meta.env.VITE_ADMIN_LOGIN as string | undefined) ?? 'admin';
const LOCAL_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'titans2026';
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'admin@titansfc.local';

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue>({
  user: null,
  ready: false,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(Ctx);

const toUser = (email?: string | null): AuthUser | null => {
  if (!email) return null;
  return { name: email.split('@')[0] || email, email };
};

function readLocalSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { user: string; at: number };
    if (Date.now() - session.at >= 1000 * 60 * 60 * 12) return null;
    return { name: session.user, email: '' };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => (isSupabaseEnabled ? null : readLocalSession()));
  const [ready, setReady] = useState(!isSupabaseEnabled);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const applySession = (session: { user: { id: string; email?: string | null } } | null) => {
      if (!active) return;
      setUser(toUser(session?.user.email));
      setReady(true);
      if (session && syncedFor.current !== session.user.id) {
        syncedFor.current = session.user.id;
        void syncAll();
      }
      if (!session) syncedFor.current = null;
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    if (supabase) {
      const email = name.includes('@') ? name.trim() : ADMIN_EMAIL;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return false;
        setUser(toUser(data.user.email));
        setReady(true);
        return true;
      } catch {
        return false;
      }
    }
    if (name.trim() === LOCAL_LOGIN && password === LOCAL_PASSWORD) {
      sessionStorage.setItem(LOCAL_KEY, JSON.stringify({ user: name, at: Date.now() }));
      setUser({ name, email: '' });
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    if (supabase) await supabase.auth.signOut();
    else sessionStorage.removeItem(LOCAL_KEY);
    syncedFor.current = null;
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}
