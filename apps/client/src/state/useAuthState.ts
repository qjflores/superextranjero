import { useState } from 'react';

interface AuthState {
  userId?: string;
  token?: string;
  isAuthenticated: boolean;
}

export const useAuthState = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
  });

  const login = (userId: string, token: string) => {
    setAuth({ userId, token, isAuthenticated: true });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false });
  };

  return { auth, login, logout };
};
