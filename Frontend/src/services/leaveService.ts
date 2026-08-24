import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { LeaveRequest, ApplyLeavePayload, LeaveBalance } from '../types';
import { MOCK_LEAVE_REQUESTS } from '../api/mockData';
import { socketClient } from '../api/socketClient';
import { calculateDaysBetween } from '../utils/formatters';

export const leaveService = {
  getAllLeaves: async (): Promise<LeaveRequest[]> => {
    try {
      return await request<LeaveRequest[]>(API_ENDPOINTS.LEAVES.LIST);
    } catch (error) {
      return MOCK_LEAVE_REQUESTS;
    }
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    try {
      return await request<LeaveRequest[]>(API_ENDPOINTS.LEAVES.MY_LEAVES);
    } catch (error) {
      return MOCK_LEAVE_REQUESTS.filter((l) => l.employeeId === 'DAY-1001');
    }
  },

  applyLeave: async (payload: ApplyLeavePayload): Promise<LeaveRequest> => {
    const totalDays = calculateDaysBetween(payload.startDate, payload.endDate);
    let newLeave: LeaveRequest;

    try {
      newLeave = await request<LeaveRequest>(API_ENDPOINTS.LEAVES.APPLY, {
        method: 'POST',
        body: JSON.stringify({ ...payload, totalDays }),
      });
    } catch (error) {
      newLeave = {
        id: 'lve-' + Date.now(),
        employeeId: 'DAY-1001',
        employeeName: 'Alex Vance',
        department: 'Engineering',
        leaveType: payload.leaveType,
        startDate: payload.startDate,
        endDate: payload.endDate,
        totalDays,
        remarks: payload.remarks,
        status: 'Pending',
        appliedOn: new Date().toISOString().split('T')[0],
      };
      MOCK_LEAVE_REQUESTS.unshift(newLeave);
    }

    // Dispatch Socket event for real-time updates
    socketClient.emitLocalEvent('leave:submitted', newLeave);
    return newLeave;
  },

  approveLeave: async (id: string, adminComments?: string): Promise<LeaveRequest> => {
    let updatedLeave: LeaveRequest;

    try {
      updatedLeave = await request<LeaveRequest>(API_ENDPOINTS.LEAVES.APPROVE(id), {
        method: 'PUT',
        body: JSON.stringify({ adminComments }),
      });
    } catch (error) {
      const found = MOCK_LEAVE_REQUESTS.find((l) => l.id === id);
      if (found) {
        found.status = 'Approved';
        found.adminComments = adminComments || 'Approved by HR';
        found.reviewedBy = 'Elena Rostova (HR)';
        found.reviewedAt = new Date().toISOString().split('T')[0];
        updatedLeave = { ...found };
      } else {
        throw new Error('Leave request not found');
      }
    }

    socketClient.emitLocalEvent('leave:approved', updatedLeave);
    return updatedLeave;
  },

  rejectLeave: async (id: string, adminComments?: string): Promise<LeaveRequest> => {
    let updatedLeave: LeaveRequest;

    try {
      updatedLeave = await request<LeaveRequest>(API_ENDPOINTS.LEAVES.REJECT(id), {
        method: 'PUT',
        body: JSON.stringify({ adminComments }),
      });
    } catch (error) {
      const found = MOCK_LEAVE_REQUESTS.find((l) => l.id === id);
      if (found) {
        found.status = 'Rejected';
        found.adminComments = adminComments || 'Rejected by HR';
        found.reviewedBy = 'Elena Rostova (HR)';
        found.reviewedAt = new Date().toISOString().split('T')[0];
        updatedLeave = { ...found };
      } else {
        throw new Error('Leave request not found');
      }
    }

    socketClient.emitLocalEvent('leave:rejected', updatedLeave);
    return updatedLeave;
  },

  getLeaveBalances: async (): Promise<LeaveBalance> => {
    try {
      return await request<LeaveBalance>(API_ENDPOINTS.LEAVES.BALANCES);
    } catch (error) {
      return {
        paidLeaveRemaining: 15,
        paidLeaveTotal: 20,
        sickLeaveRemaining: 8,
        sickLeaveTotal: 10,
        unpaidLeaveUsed: 0,
      };
    }
  },
};
