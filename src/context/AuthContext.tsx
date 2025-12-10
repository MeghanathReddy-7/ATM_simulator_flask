import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Account } from '@/types/atm';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  account: Account | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accountNumber: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateAccount: (account: Account) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const response = await api.validateSession();
          if (response.success && response.user && response.account) {
            setUser(response.user);
            setAccount(response.account);
          } else {
            api.setToken(null);
          }
        } catch {
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = useCallback(async (accountNumber: string, pin: string) => {
    try {
      const response = await api.login(accountNumber, pin);
      
      if (response.success && response.token && response.user && response.account) {
        api.setToken(response.token);
        setUser(response.user);
        setAccount(response.account);
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection error' 
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors during logout
    } finally {
      setUser(null);
      setAccount(null);
    }
  }, []);

  const updateAccount = useCallback((updatedAccount: Account) => {
    setAccount(updatedAccount);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        isAuthenticated: !!user && !!account,
        isLoading,
        login,
        logout,
        updateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe fallback to avoid crashing when provider hasn't mounted yet
    return {
      user: null,
      account: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => ({ success: false, message: 'Auth not initialized' }),
      logout: async () => {},
      updateAccount: () => {},
    };
  }
  return context;
}
