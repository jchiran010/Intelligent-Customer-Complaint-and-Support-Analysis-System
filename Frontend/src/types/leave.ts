export type LeaveType = 'Paid Leave' | 'Sick Leave' | 'Unpaid Leave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  remarks: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  adminComments?: string;
  reviewedAt?: string;
}

export interface ApplyLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  remarks: string;
}

export interface LeaveApprovalPayload {
  leaveId: string;
  status: 'Approved' | 'Rejected';
  adminComments?: string;
}

export interface LeaveBalance {
  paidLeaveRemaining: number;
  paidLeaveTotal: number;
  sickLeaveRemaining: number;
  sickLeaveTotal: number;
  unpaidLeaveUsed: number;
}
