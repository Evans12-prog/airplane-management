import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoadingSkeleton } from './LoadingSkeleton';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
