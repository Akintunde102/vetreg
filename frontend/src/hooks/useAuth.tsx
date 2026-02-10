import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { mockProfile } from '@/lib/mock-data';
import type { VetProfile } from '@/types/api';

interface AuthContextType {
  user: VetProfile | null;
  profile: VetProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  profileCompleted: boolean;
  isMasterAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<VetProfile | null>(hasSupabase ? null : mockProfile);
  const [isLoading, setIsLoading] = useState(hasSupabase);

  const fetchProfileAndSyncToken = useCallback(async (token: string | null) => {
    api.setToken(token);
    if (!token) {
      setProfile(null);
      return;
    }
    try {
      const vet = await api.getProfile();
      setProfile(vet);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!hasSupabase) {
      api.setToken('mock-token-dev');
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token ?? null;
      fetchProfileAndSyncToken(token).finally(() => setIsLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const token = session?.access_token ?? null;
      fetchProfileAndSyncToken(token);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndSyncToken]);

  const signIn = useCallback(async () => {
    if (!hasSupabase) {
      setProfile(mockProfile);
      api.setToken('mock-token-dev');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (hasSupabase) await supabase.auth.signOut();
    api.setToken(null);
    setProfile(null);
  }, []);

  const refetchProfile = useCallback(async () => {
    if (!hasSupabase) return;
    const token = (await supabase.auth.getSession()).data.session?.access_token ?? null;
    await fetchProfileAndSyncToken(token);
  }, [fetchProfileAndSyncToken]);

  const value: AuthContextType = {
    user: profile,
    profile,
    isAuthenticated: !!profile,
    isLoading,
    isApproved: profile?.status === 'APPROVED',
    isPending: profile?.status === 'PENDING_APPROVAL',
    isRejected: profile?.status === 'REJECTED',
    isSuspended: profile?.status === 'SUSPENDED',
    profileCompleted: profile?.profileCompleted ?? false,
    isMasterAdmin: profile?.isMasterAdmin ?? false,
    signIn,
    signOut,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
