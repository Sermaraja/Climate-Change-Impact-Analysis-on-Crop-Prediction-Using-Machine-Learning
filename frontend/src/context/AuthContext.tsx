import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  preferred_language: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  register: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agri_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agri_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configure Axios interceptor for JWT Auth Header
  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('agri_token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      apiClient.interceptors.request.eject(interceptor);
    };
  }, []);

  // Fetch current user on init if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('agri_token');
      if (storedToken) {
        try {
          const response = await apiClient.get<UserProfile>('/auth/me');
          setUser(response.data);
          localStorage.setItem('agri_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to fetch user profile, logging out:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('agri_token', newToken);
    localStorage.setItem('agri_user', JSON.stringify(newUser));
  };

  const register = (newToken: string, newUser: UserProfile) => {
    login(newToken, newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
