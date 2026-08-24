export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_EMAIL: '/api/auth/verify-email',
    ME: '/api/auth/me',
  },
  EMPLOYEES: {
    LIST: '/api/employees',
    DETAIL: (id: string) => `/api/employees/${id}`,
    UPDATE: (id: string) => `/api/employees/${id}`,
    DOCUMENTS: (id: string) => `/api/employees/${id}/documents`,
  },
  ATTENDANCE: {
    DAILY: '/api/attendance/daily',
    WEEKLY: '/api/attendance/weekly',
    CHECK_IN: '/api/attendance/check-in',
    CHECK_OUT: '/api/attendance/check-out',
    MY_ATTENDANCE: '/api/attendance/me',
  },
  LEAVES: {
    LIST: '/api/leaves',
    MY_LEAVES: '/api/leaves/me',
    APPLY: '/api/leaves/apply',
    APPROVE: (id: string) => `/api/leaves/${id}/approve`,
    REJECT: (id: string) => `/api/leaves/${id}/reject`,
    BALANCES: '/api/leaves/balances',
  },
  PAYROLL: {
    MY_PAYROLL: '/api/payroll/me',
    LIST: '/api/payroll',
    UPDATE: (empId: string) => `/api/payroll/${empId}`,
    PAYSLIPS: '/api/payroll/slips',
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    ATTENDANCE: '/api/analytics/attendance',
    LEAVES: '/api/analytics/leaves',
    PAYROLL: '/api/analytics/payroll',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
  },
  REPORTS: {
    ATTENDANCE_CSV: '/api/reports/attendance/csv',
    PAYROLL_CSV: '/api/reports/payroll/csv',
  },
};
