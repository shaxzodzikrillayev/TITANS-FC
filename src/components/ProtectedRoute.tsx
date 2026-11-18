import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, ready } = useAuth();

  // Wait for the Supabase session to be restored before redirecting.
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
