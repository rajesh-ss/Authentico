import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setCredentials: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'blockcert_auth';

// Get initial auth state from localStorage
const getInitialAuthState = (): AuthState => {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  const setCredentials = useCallback((user: User, token: string) => {
    sessionStorage.setItem('auth_token', token);
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Use the auth service
      const response = await authService.login({ email, password });

      // Basic password check happens in service for now (mock)
      if (password !== 'password') {
        throw new Error('Invalid credentials');
      }

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store token
      sessionStorage.setItem('auth_token', response.token);

      return response.user;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Persist auth state changes to sessionStorage
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: authState.user }));
    }
  }, [authState.isAuthenticated, authState.user]);

  const connectWallet = useCallback(async () => {
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (authState.user) {
      setAuthState((prev) => ({
        ...prev,
        user: prev.user
          ? {
              ...prev.user,
              walletConnected: true,
              walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8a2c1',
            }
          : null,
      }));
    }
  }, [authState.user]);

  const disconnectWallet = useCallback(() => {
    if (authState.user) {
      setAuthState((prev) => ({
        ...prev,
        user: prev.user
          ? {
              ...prev.user,
              walletConnected: false,
              walletAddress: undefined,
            }
          : null,
      }));
    }
  }, [authState.user]);

  return (
    <AuthContext.Provider
      value={{ ...authState, login, logout, connectWallet, disconnectWallet, setCredentials }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
