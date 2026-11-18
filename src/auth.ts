const KEY = 'titansfc.admin.session';
const LOGIN = (import.meta.env.VITE_ADMIN_LOGIN as string | undefined) ?? 'admin';
const PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'titans2026';

export function login(name: string, password: string): boolean {
  if (name.trim() === LOGIN && password === PASSWORD) {
    sessionStorage.setItem(KEY, JSON.stringify({ user: name, at: Date.now() }));
    return true;
  }
  return false;
}

export function logout() { sessionStorage.removeItem(KEY); }

export function isAuthenticated(): boolean {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as { at: number };
    return Date.now() - session.at < 1000 * 60 * 60 * 12;
  } catch { return false; }
}
