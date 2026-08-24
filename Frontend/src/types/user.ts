export type UserRole = 'EMPLOYEE' | 'HR' | 'ADMIN';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRoleView: UserRole;
  originalUser: User | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  employeeId: string;
  email: string;
  password?: string;
  role: UserRole;
  name?: string;
}

export interface EmailVerifyData {
  email: string;
  code: string;
}
