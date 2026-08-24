import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { AttendanceRecord, CheckInPayload, CheckOutPayload } from '../types';
import { MOCK_ATTENDANCE_RECORDS } from '../api/mockData';
import { socketClient } from '../api/socketClient';

export const attendanceService = {
  getDailyAttendance: async (date?: string): Promise<AttendanceRecord[]> => {
    try {
      const url = date ? `${API_ENDPOINTS.ATTENDANCE.DAILY}?date=${date}` : API_ENDPOINTS.ATTENDANCE.DAILY;
      return await request<AttendanceRecord[]>(url);
    } catch (error) {
      return MOCK_ATTENDANCE_RECORDS;
    }
  },

  getWeeklyAttendance: async (): Promise<any> => {
    try {
      return await request(API_ENDPOINTS.ATTENDANCE.WEEKLY);
    } catch (error) {
      return {
        weekStartDate: '2026-08-18',
        weekEndDate: '2026-08-24',
        records: MOCK_ATTENDANCE_RECORDS,
      };
    }
  },

  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      return await request<AttendanceRecord[]>(API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE);
    } catch (error) {
      return MOCK_ATTENDANCE_RECORDS.filter((r) => r.employeeId === 'DAY-1001');
    }
  },

  checkIn: async (payload: CheckInPayload): Promise<AttendanceRecord> => {
    let resultRecord: AttendanceRecord;
    try {
      resultRecord = await request<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      resultRecord = {
        id: 'att-' + Date.now(),
        employeeId: payload.employeeId || 'DAY-1001',
        employeeName: 'Alex Vance',
        date: new Date().toISOString().split('T')[0],
        checkInTime: new Date().toISOString(),
        status: 'Present',
        location: payload.location || 'San Francisco HQ (Verified)',
        notes: payload.notes,
      };
    }

    // Trigger live Socket notification event
    socketClient.emitLocalEvent('attendance:updated', resultRecord);
    return resultRecord;
  },

  checkOut: async (payload: CheckOutPayload): Promise<AttendanceRecord> => {
    let resultRecord: AttendanceRecord;
    try {
      resultRecord = await request<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      resultRecord = {
        id: 'att-' + Date.now(),
        employeeId: payload.employeeId || 'DAY-1001',
        employeeName: 'Alex Vance',
        date: new Date().toISOString().split('T')[0],
        checkInTime: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        checkOutTime: new Date().toISOString(),
        totalHours: 8.0,
        status: 'Present',
        notes: payload.notes || 'End of day checkout',
      };
    }

    socketClient.emitLocalEvent('attendance:updated', resultRecord);
    return resultRecord;
  },
};
