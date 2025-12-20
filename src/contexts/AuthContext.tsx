import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string) => {
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
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid credentials');
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

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
