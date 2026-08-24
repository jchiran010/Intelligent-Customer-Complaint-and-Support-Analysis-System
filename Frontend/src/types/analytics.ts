export interface KPIStats {
  totalEmployees: number;
  presentToday: number;
  presentPercentage: number;
  pendingLeaves: number;
  monthlyPayrollTotal: number;
}

export interface AttendanceAnalytics {
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
  weeklyTrend: {
    day: string;
    present: number;
    absent: number;
  }[];
}

export interface LeaveAnalytics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  typeDistribution: {
    type: string;
    count: number;
  }[];
}

export interface PayrollAnalytics {
  totalExpenditure: number;
  averageSalary: number;
  departmentDistribution: {
    department: string;
    amount: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

export interface DashboardAnalytics {
  kpis: KPIStats;
  attendance: AttendanceAnalytics;
  leaves: LeaveAnalytics;
  payroll: PayrollAnalytics;
}
