export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
}

export interface CheckInPayload {
  employeeId: string;
  location?: string;
  notes?: string;
}

export interface CheckOutPayload {
  employeeId: string;
  notes?: string;
}

export interface DailyAttendanceSummary {
  date: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
  attendancePercentage: number;
}

export interface WeeklyAttendanceSummary {
  weekStartDate: string;
  weekEndDate: string;
  dailyStats: {
    day: string;
    date: string;
    present: number;
    absent: number;
    halfDay: number;
    leave: number;
  }[];
}
