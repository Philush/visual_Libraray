'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMe, login as apiLogin, register as apiRegister } from '@/lib/api/auth';
import { getStoredToken, setStoredToken, removeStoredToken } from '@/lib/api/client';
import type { User, LoginPayload, RegisterPayload } from '@visual-library/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // При монтировании проверяем сохранённый токен
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    getMe(token)
      .then((user) => setState({ user, isLoading: false, isAuthenticated: true }))
      .catch(() => {
        removeStoredToken();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user, accessToken } = await apiLogin(payload);
    setStoredToken(accessToken);
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user, accessToken } = await apiRegister(payload);
    setStoredToken(accessToken);
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    removeStoredToken();
    queryClient.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
