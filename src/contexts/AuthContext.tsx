import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'blockcert_auth';

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  'issuer@university.edu': {
    id: '1',
    email: 'issuer@university.edu',
    name: 'Dr. Sarah Johnson',
    role: 'issuer',
    department: 'Computer Science',
    institution: 'State University',
  },
  'admin@university.edu': {
    id: '2',
    email: 'admin@university.edu',
    name: 'Prof. Robert Chen',
    role: 'college_admin',
    department: 'Administration',
    institution: 'State University',
  },
  'approver@university.edu': {
    id: '3',
    email: 'approver@university.edu',
    name: 'Dr. Emily Davis',
    role: 'reevaluation_approver',
    department: 'Examination Cell',
    institution: 'State University',
  },
  'updater@university.edu': {
    id: '4',
    email: 'updater@university.edu',
    name: 'Mr. James Wilson',
    role: 'reevaluation_updater',
    department: 'Examination Cell',
    institution: 'State University',
  },
  'verifier@university.edu': {
    id: '5',
    email: 'verifier@university.edu',
    name: 'Dr. Michael Brown',
    role: 'verifying_admin',
    department: 'Quality Assurance',
    institution: 'State University',
  },
  'student@university.edu': {
    id: '6',
    email: 'student@university.edu',
    name: 'Alex Thompson',
    role: 'student',
    department: 'Computer Science',
    institution: 'State University',
  },
  'teacher@university.edu': {
    id: '7',
    email: 'teacher@university.edu',
    name: 'Prof. Anita Desai',
    role: 'teacher',
    department: 'Computer Science',
    institution: 'State University',
  },
};

// Get initial auth state from localStorage
const getInitialAuthState = (): AuthState => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers[email.toLowerCase()];
    
    if (user && password === 'password') {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid credentials');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // Persist auth state changes to localStorage
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: authState.user }));
    }
  }, [authState.isAuthenticated, authState.user]);

  const connectWallet = useCallback(async () => {
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          walletConnected: true,
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8a2c1',
        } : null,
      }));
    }
  }, [authState.user]);

  const disconnectWallet = useCallback(() => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          walletConnected: false,
          walletAddress: undefined,
        } : null,
      }));
    }
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, connectWallet, disconnectWallet }}>
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
