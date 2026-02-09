import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { mockProfile } from '@/lib/mock-data';
import type { VetProfile } from '@/types/api';

interface AuthContextType {
  user: VetProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VetProfile | null>(mockProfile); // Mock authenticated
  const [isLoading] = useState(false);

  const signIn = useCallback(() => {
    setUser(mockProfile);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
