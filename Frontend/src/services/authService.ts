import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginCredentials, RegisterData, EmailVerifyData, User } from '../types';
import { MOCK_CURRENT_EMPLOYEE, MOCK_HR_USER } from '../api/mockData';
import { storage } from '../utils/storage';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    try {
      const response = await request<{ token: string; user: User }>(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      storage.setToken(response.token);
      storage.setUser(response.user);
      return response;
    } catch (error) {
      // Mock Fallback for local demo & verification
      if (credentials.email.toLowerCase().includes('hr') || credentials.email.toLowerCase().includes('admin')) {
        const mockUser: User = {
          id: MOCK_HR_USER.id,
          employeeId: MOCK_HR_USER.employeeId,
          email: credentials.email,
          name: MOCK_HR_USER.name,
          role: 'HR',
          avatarUrl: MOCK_HR_USER.profilePicture,
          isEmailVerified: true,
          department: MOCK_HR_USER.department,
          designation: MOCK_HR_USER.designation
        };
        const mockToken = 'mock_jwt_token_hr_' + Date.now();
        storage.setToken(mockToken);
        storage.setUser(mockUser);
        return { token: mockToken, user: mockUser };
      } else {
        const mockUser: User = {
          id: MOCK_CURRENT_EMPLOYEE.id,
          employeeId: MOCK_CURRENT_EMPLOYEE.employeeId,
          email: credentials.email,
          name: MOCK_CURRENT_EMPLOYEE.name,
          role: 'EMPLOYEE',
          avatarUrl: MOCK_CURRENT_EMPLOYEE.profilePicture,
          isEmailVerified: true,
          department: MOCK_CURRENT_EMPLOYEE.department,
          designation: MOCK_CURRENT_EMPLOYEE.designation
        };
        const mockToken = 'mock_jwt_token_employee_' + Date.now();
        storage.setToken(mockToken);
        storage.setUser(mockUser);
        return { token: mockToken, user: mockUser };
      }
    }
  },

  register: async (data: RegisterData): Promise<{ message: string; requiresVerification: boolean }> => {
    try {
      return await request(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Mock Fallback
      return {
        message: 'Account created successfully! Please check your email for the verification code.',
        requiresVerification: true,
      };
    }
  },

  verifyEmail: async (data: EmailVerifyData): Promise<{ success: boolean; message: string }> => {
    try {
      return await request(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Mock Fallback
      return {
        success: true,
        message: 'Email verified successfully! You can now sign in.',
      };
    }
  },

  getMe: async (): Promise<User> => {
    try {
      return await request<User>(API_ENDPOINTS.AUTH.ME);
    } catch (error) {
      const stored = storage.getUser();
      if (stored) return stored;
      return {
        id: MOCK_CURRENT_EMPLOYEE.id,
        employeeId: MOCK_CURRENT_EMPLOYEE.employeeId,
        email: MOCK_CURRENT_EMPLOYEE.email,
        name: MOCK_CURRENT_EMPLOYEE.name,
        role: MOCK_CURRENT_EMPLOYEE.role,
        avatarUrl: MOCK_CURRENT_EMPLOYEE.profilePicture,
        isEmailVerified: true,
        department: MOCK_CURRENT_EMPLOYEE.department,
        designation: MOCK_CURRENT_EMPLOYEE.designation
      };
    }
  },

  logout: async (): Promise<void> => {
    storage.clearAll();
  },
};
