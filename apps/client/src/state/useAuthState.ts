import { useState, useCallback } from 'react';
import apiClient from '../api/client.js';

export interface AuthState {
  userId?: string;
  email?: string;
  token?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export const useAuthState = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  });

  const register = useCallback(
    async (email: string, password: string) => {
      setAuth((prev) => ({ ...prev, isLoading: true, error: undefined }));
      try {
        const data = await apiClient.register(email, password);
        apiClient.setToken(data.token);
        setAuth({
          userId: data.userId,
          email: data.email,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        setAuth((prev) => ({ ...prev, isLoading: false, error: message }));
        throw error;
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setAuth((prev) => ({ ...prev, isLoading: true, error: undefined }));
      try {
        const data = await apiClient.login(email, password);
        apiClient.setToken(data.token);
        setAuth({
          userId: data.userId,
          email: data.email,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setAuth((prev) => ({ ...prev, isLoading: false, error: message }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    apiClient.clearToken();
    setAuth({ isAuthenticated: false, isLoading: false });
  }, []);

  const clearError = useCallback(() => {
    setAuth((prev) => ({ ...prev, error: undefined }));
  }, []);

  return {
    auth,
    register,
    login,
    logout,
    clearError,
  };
};
