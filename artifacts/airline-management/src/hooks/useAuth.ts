import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  AUTH_STATE_EVENT,
  createProfile,
  getProfile,
  getLocalDemoProfile,
  getStoredLocalSession,
  mergeProfileWithUserMetadata,
} from '@/lib/auth';

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

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const isLocalDemoEnvironment = !isSupabaseConfigured || import.meta.env.DEV || isLocalhost;

export function useAuth() {
  const initialLocalSession = typeof window !== 'undefined' ? getStoredLocalSession() : null;
  const initialAccount = initialLocalSession?.account;
  const initialLocalProfile = initialAccount ? getLocalDemoProfile(initialAccount) : null;
  const initialLocalUser = initialAccount
    ? ({
        id: initialAccount.id,
        email: initialAccount.email,
        app_metadata: {
          role: initialAccount.roleName,
          department: initialAccount.department,
          departmentSlug: initialAccount.departmentSlug,
          full_name: initialAccount.fullName,
        },
      } as any)
    : null;

  const [state, setState] = useState<AuthState>({
    user: initialLocalUser,
    session: initialLocalUser
      ? ({ access_token: `local-${initialAccount.id}-token`, user: initialLocalUser } as any)
      : null,
    profile: initialLocalProfile,
    loading: !initialLocalUser,
    isAdmin: ['admin', 'super_admin'].includes(initialAccount?.roleName || ''),
    isManager: [
      'admin',
      'super_admin',
      'airline_manager',
      'hr_manager',
      'operations_manager',
      'crew_manager',
      'fleet_manager',
      'route_planner',
    ].includes(initialAccount?.roleName || ''),
  });

  const loadProfile = useCallback(async (userId: string, email: string, userMetadata?: User | null) => {
    const metadataProfile = mergeProfileWithUserMetadata(null, userMetadata as any);

    try {
      const profile = (await getProfile(userId)) as Profile;
      const roleName = profile?.roles?.name || metadataProfile?.roles?.name || null;
      setState((prev) => ({
        ...prev,
        profile: (profile || metadataProfile) as Profile | null,
        isAdmin: ['admin', 'super_admin'].includes(roleName || ''),
        isManager: ['admin', 'super_admin', 'manager'].includes(roleName || ''),
      }));
    } catch {
      // Profile might not exist yet — create it and reload it, but do not block the app.
      try {
        await createProfile(userId, email);
        const fallbackProfile = (await getProfile(userId).catch(() => null)) as Profile | null;
        const mergedProfile = mergeProfileWithUserMetadata(fallbackProfile, userMetadata);
        const fallbackRoleName = mergedProfile?.roles?.name || null;
        setState((prev) => ({
          ...prev,
          profile: mergedProfile as Profile | null,
          isAdmin: ['admin', 'super_admin'].includes(fallbackRoleName || ''),
          isManager: ['admin', 'super_admin', 'manager'].includes(fallbackRoleName || ''),
        }));
      } catch {
        const fallbackRoleName = metadataProfile?.roles?.name || null;
        setState((prev) => ({
          ...prev,
          profile: metadataProfile as Profile | null,
          isAdmin: ['admin', 'super_admin'].includes(fallbackRoleName || ''),
          isManager: ['admin', 'super_admin', 'manager'].includes(fallbackRoleName || ''),
        }));
      }
    }
  }, []);

  useEffect(() => {
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
        return true;
      }

      return false;
    };

    const trySyncLocalSessionFirst = () => {
      const hadLocalSession = syncLocalSession();
      if (hadLocalSession) {
        return true;
      }

      if (!isSupabaseConfigured) {
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

      return false;
    };

    window.addEventListener(AUTH_STATE_EVENT, syncLocalSession);
    window.addEventListener('storage', syncLocalSession);

    if (!isSupabaseConfigured) {
      trySyncLocalSessionFirst();

      return () => {
        window.removeEventListener(AUTH_STATE_EVENT, syncLocalSession);
        window.removeEventListener('storage', syncLocalSession);
      };
    }

    const initializeAuth = async () => {
      const hadLocalSession = trySyncLocalSessionFirst();
      if (hadLocalSession) {
        return;
      }

      try {
        const sessionPromise = Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: Session | null } }>((resolve) => {
            const timeout = window.setTimeout(() => resolve({ data: { session: null } }), 1500);
            return () => window.clearTimeout(timeout);
          }),
        ]);

        const { data: { session } } = await sessionPromise;
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        if (session?.user) {
          await loadProfile(session.user.id, session.user.email || '', session.user);
        }

        setState((prev) => ({
          ...prev,
          loading: false,
        }));
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
        }));

        if (session?.user) {
          await loadProfile(session.user.id, session.user.email || '', session.user);
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
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

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(AUTH_STATE_EVENT, syncLocalSession);
      window.removeEventListener('storage', syncLocalSession);
    };
  }, [loadProfile]);

  return state;
}
