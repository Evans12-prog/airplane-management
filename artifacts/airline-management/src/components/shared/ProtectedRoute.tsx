import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthContext } from '@/contexts/AuthContext';
import { getStoredLocalSession } from '@/lib/auth';
import { LoadingSkeleton } from './LoadingSkeleton';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();
  const [, setLocation] = useLocation();
  const hasLocalSession = Boolean(typeof window !== 'undefined' && getStoredLocalSession()?.account);
  const isAuthenticated = Boolean(user || hasLocalSession);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
