import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { AUTH_STATE_EVENT, createProfile, getProfile, getLocalDemoProfile, getStoredLocalSession } from '@/lib/auth';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
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
      const profile = (await getProfile(userId)) as Profile;
      const roleName = profile?.roles?.name || null;
      setState((prev) => ({
        ...prev,
        profile,
        isAdmin: ['admin', 'super_admin'].includes(roleName || ''),
        isManager: ['admin', 'super_admin', 'manager'].includes(roleName || ''),
      }));
    } catch {
      // Profile might not exist yet — create it and reload it, but do not block the app.
      try {
        await createProfile(userId, email);
        const fallbackProfile = (await getProfile(userId).catch(() => null)) as Profile | null;
        const fallbackRoleName = fallbackProfile?.roles?.name || null;
        setState((prev) => ({
          ...prev,
          profile: fallbackProfile,
          isAdmin: ['admin', 'super_admin'].includes(fallbackRoleName || ''),
          isManager: ['admin', 'super_admin', 'manager'].includes(fallbackRoleName || ''),
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          profile: null,
          isAdmin: false,
          isManager: false,
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const syncLocalSession = () => {
        const savedSession = getStoredLocalSession();
        const account = savedSession?.account;

        if (account) {
          const localProfile = getLocalDemoProfile(account);
          const localUser = {
            id: account.id,
            email: account.email,
            app_metadata: {
              role: account.roleName,
              department: account.department,
              departmentSlug: account.departmentSlug,
              full_name: account.fullName,
            },
          } as any;

          setState((prev) => ({
            ...prev,
            session: { access_token: `local-${account.id}-token`, user: localUser } as any,
            user: localUser,
            profile: localProfile,
            isAdmin: ['admin', 'super_admin'].includes(account.roleName || ''),
            isManager: [
              'admin',
              'super_admin',
              'airline_manager',
              'hr_manager',
              'operations_manager',
              'crew_manager',
              'fleet_manager',
              'route_planner',
            ].includes(account.roleName || ''),
            loading: false,
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          profile: null,
          isAdmin: false,
          isManager: false,
          loading: false,
        }));
      };

      syncLocalSession();
      window.addEventListener(AUTH_STATE_EVENT, syncLocalSession);
      window.addEventListener('storage', syncLocalSession);

      return () => {
        window.removeEventListener(AUTH_STATE_EVENT, syncLocalSession);
        window.removeEventListener('storage', syncLocalSession);
      };
    }

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
        if (session?.user) {
          void loadProfile(session.user.id, session.user.email || '');
        }
      } catch {
        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          profile: null,
          isAdmin: false,
          isManager: false,
          loading: false,
        }));
      }
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
        if (session?.user) {
          void loadProfile(session.user.id, session.user.email || '');
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
