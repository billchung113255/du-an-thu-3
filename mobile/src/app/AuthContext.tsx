import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Auth boundary for the unified app.
 *
 * One mobile binary serves both audiences. The signed-in `role` decides which
 * feature module mounts (student vs tutor). Replace the mock `signIn` with a
 * real call to the Times Edu backend that returns a session token + role;
 * keep secrets server-side and store the token in expo-secure-store.
 */
export type Role = 'student' | 'tutor';

export interface Session {
  role: Role;
  /** Display name from the backend profile. */
  name: string;
  /** Bearer token returned by the backend. Mock for now. */
  token: string;
}

interface AuthValue {
  session: Session | null;
  signIn: (role: Role) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

const MOCK_NAME: Record<Role, string> = {
  student: 'Trần Bảo Nam',
  tutor: 'Nguyễn Minh Anh',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const signIn = useCallback(async (role: Role) => {
    // TODO(api): POST {API_BASE_URL}/v1/auth/login → { token, role, name }
    // Treat the response as untrusted; validate shape before trusting it.
    setSession({ role, name: MOCK_NAME[role], token: 'mock-session-token' });
  }, []);

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo<AuthValue>(() => ({ session, signIn, signOut }), [session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
