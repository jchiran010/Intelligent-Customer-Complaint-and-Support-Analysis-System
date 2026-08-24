import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LoginCredentials, RegisterData, EmailVerifyData } from '../types';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRoleView: UserRole;
  switchedEmployee: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string; requiresVerification: boolean }>;
  verifyEmail: (data: EmailVerifyData) => Promise<boolean>;
  logout: () => void;
  switchRoleView: (role: UserRole) => void;
  setSwitchedEmployee: (emp: User | null) => void;
  updateCurrentUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(user?.role || 'EMPLOYEE');
  const [switchedEmployee, setSwitchedEmployee] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
          setActiveRoleView(currentUser.role);
        } catch (err) {
          storage.clearAll();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setToken(result.token);
      setActiveRoleView(result.user.role);
      setSwitchedEmployee(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    return await authService.register(data);
  };

  const verifyEmail = async (data: EmailVerifyData): Promise<boolean> => {
    const res = await authService.verifyEmail(data);
    return res.success;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setSwitchedEmployee(null);
  };

  const switchRoleView = (role: UserRole) => {
    if (user?.role === 'ADMIN' || user?.role === 'HR') {
      setActiveRoleView(role);
    }
  };

  const updateCurrentUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      storage.setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        activeRoleView,
        switchedEmployee,
        login,
        register,
        verifyEmail,
        logout,
        switchRoleView,
        setSwitchedEmployee,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
