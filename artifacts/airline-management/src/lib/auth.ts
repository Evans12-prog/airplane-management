import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  fullName?: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;

  // Create a profile for the new user immediately if user is confirmed
  if (data.user && !data.user.identities?.length) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  if (data.user) {
    await createProfile(data.user.id, email, fullName);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, roles(*), departments(*)')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createProfile(userId: string, email: string, fullName?: string) {
  // Get the default role (staff)
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'staff')
    .single();

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName || null,
    role_id: role?.id || null,
  });
  if (error) throw error;
}
