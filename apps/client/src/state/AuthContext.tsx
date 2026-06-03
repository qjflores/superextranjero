import React, { createContext, ReactNode } from 'react';
import { useAuthState, AuthState } from './useAuthState.js';

interface AuthContextType {
  auth: AuthState;
  register: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth, register, login, logout, clearError } = useAuthState();

  return (
    <AuthContext.Provider value={{ auth, register, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
