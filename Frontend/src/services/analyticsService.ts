import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { DashboardAnalytics, AttendanceAnalytics, LeaveAnalytics, PayrollAnalytics } from '../types';
import { MOCK_ANALYTICS } from '../api/mockData';

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    try {
      return await request<DashboardAnalytics>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    } catch (error) {
      return MOCK_ANALYTICS;
    }
  },

  getAttendanceAnalytics: async (): Promise<AttendanceAnalytics> => {
    try {
      return await request<AttendanceAnalytics>(API_ENDPOINTS.ANALYTICS.ATTENDANCE);
    } catch (error) {
      return MOCK_ANALYTICS.attendance;
    }
  },

  getLeaveAnalytics: async (): Promise<LeaveAnalytics> => {
    try {
      return await request<LeaveAnalytics>(API_ENDPOINTS.ANALYTICS.LEAVES);
    } catch (error) {
      return MOCK_ANALYTICS.leaves;
    }
  },

  getPayrollAnalytics: async (): Promise<PayrollAnalytics> => {
    try {
      return await request<PayrollAnalytics>(API_ENDPOINTS.ANALYTICS.PAYROLL);
    } catch (error) {
      return MOCK_ANALYTICS.payroll;
    }
  },
};
