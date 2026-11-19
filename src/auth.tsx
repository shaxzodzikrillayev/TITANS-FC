import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { syncAll } from './db';
import { clearSession, readSession, writeSession } from './session';

const ADMIN_LOGIN = (import.meta.env.VITE_ADMIN_LOGIN as string | undefined) ?? 'admin';
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'titans2026';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Neon has no managed auth: restore the admin session from sessionStorage and
  // re-read the databases so a signed-in visitor can seed an empty project.
  useEffect(() => {
    const session = readSession();
    if (session) {
      setUser({ name: session.user, email: ADMIN_EMAIL });
      void syncAll();
    }
    setReady(true);
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    const value = name.trim();
    const knownName = value === ADMIN_LOGIN || value === ADMIN_EMAIL || value === ADMIN_EMAIL.split('@')[0];
    if (!knownName || password !== ADMIN_PASSWORD) return false;

    writeSession(value);
    setUser({ name: value, email: ADMIN_EMAIL });
    setReady(true);
    await syncAll();
    return true;
  };

  const logout = async (): Promise<void> => {
    clearSession();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}
