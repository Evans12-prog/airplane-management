import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createProfile, getProfile } from '@/lib/auth';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role_id: string | null;
  dark_mode: boolean;
  language: string;
  notification_settings: unknown;
  roles?: { id: string; name: string; permissions: unknown } | null;
  departments?: { id: string; name: string } | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAdmin: false,
    isManager: false,
  });

  const loadProfile = useCallback(async (userId: string, email: string) => {
    try {
      const profile = await getProfile(userId);
      const roleName = (profile?.roles as { name?: string } | null)?.name;
      setState((prev) => ({
        ...prev,
        profile,
        isAdmin: ['admin', 'super_admin'].includes(roleName || ''),
        isManager: ['admin', 'super_admin', 'manager'].includes(roleName || ''),
        loading: false,
      }));
    } catch {
      // Profile might not exist yet — create it
      await createProfile(userId, email);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '');
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setState((prev) => ({ ...prev, session, user: session?.user ?? null }));
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email || '');
        } else {
          setState((prev) => ({
            ...prev,
            profile: null,
            isAdmin: false,
            isManager: false,
            loading: false,
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  return state;
}
