const SESSION_KEY = 'titansfc.admin.session';
const SESSION_TTL = 1000 * 60 * 60 * 12;

export interface AdminSession {
  user: string;
  at: number;
}

/** Reads the current admin session from sessionStorage. */
export function readSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (!session.user || Date.now() - session.at >= SESSION_TTL) return null;
    return session;
  } catch {
    return null;
  }
}

/** Starts a new admin session. */
export function writeSession(user: string): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, at: Date.now() } satisfies AdminSession));
}

/** Ends the current admin session. */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Whether an administrator is signed in. Used by the data layer for seeding. */
export function isAdmin(): boolean {
  return readSession() !== null;
}
