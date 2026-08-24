import { useState, useCallback } from 'react';
import { AttendanceRecord, CheckInPayload, CheckOutPayload } from '../types';
import { attendanceService } from '../services/attendanceService';
import { useNotification } from '../context/NotificationContext';

export const useAttendance = () => {
  const [dailyAttendance, setDailyAttendance] = useState<AttendanceRecord[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotification();

  const fetchDailyAttendance = useCallback(async (date?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getDailyAttendance(date);
      setDailyAttendance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily attendance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getMyAttendance();
      setMyAttendance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch my attendance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkIn = async (payload: CheckInPayload) => {
    setIsLoading(true);
    try {
      const rec = await attendanceService.checkIn(payload);
      setMyAttendance((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
      addToast('success', 'Checked In', 'Your attendance clock-in has been logged.');
      return rec;
    } catch (err: any) {
      addToast('error', 'Check In Failed', err.message || 'Error checking in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkOut = async (payload: CheckOutPayload) => {
    setIsLoading(true);
    try {
      const rec = await attendanceService.checkOut(payload);
      setMyAttendance((prev) => [rec, ...prev.filter((r) => r.id !== rec.id)]);
      addToast('success', 'Checked Out', 'Your attendance clock-out has been recorded.');
      return rec;
    } catch (err: any) {
      addToast('error', 'Check Out Failed', err.message || 'Error checking out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dailyAttendance,
    myAttendance,
    isLoading,
    error,
    fetchDailyAttendance,
    fetchMyAttendance,
    checkIn,
    checkOut,
  };
};
