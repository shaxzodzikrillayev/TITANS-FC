import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { syncAll } from './db';
import { clearSession, readSession, writeSession } from './session';

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'admin@titansfc.local';

// Fallback credentials are stored only as SHA-256 digests, so the deployed
// static bundle never contains the password in plain text.
const AUTH_SALT = 'titans-fc-admin-v1';
const ADMIN_HASHES = new Set([
  '284155f0773f0ab087da8838f71dc596e540b6f20367a2a7c3be8a280581222a',
  'e4d204a06a3f310b9553639a292199df7d7b1b70e3d56d6eeb9bf23f55b1aa30',
  '0d96fee1c82608d475314a6b34fca18db0572d5613022cd0ecc9f878dac7c5fe',
]);

async function matchesAdmin(name: string, password: string): Promise<boolean> {
  if (!globalThis.crypto?.subtle) return false;
  const bytes = new TextEncoder().encode(`${AUTH_SALT}:${name}:${password}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return ADMIN_HASHES.has(hex);
}

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
    if (!(await matchesAdmin(value, password))) return false;

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
