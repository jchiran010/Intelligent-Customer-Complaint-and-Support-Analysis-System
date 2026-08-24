import { useState, useCallback } from 'react';
import { LeaveRequest, ApplyLeavePayload, LeaveBalance } from '../types';
import { leaveService } from '../services/leaveService';
import { useNotification } from '../context/NotificationContext';

export const useLeave = () => {
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotification();

  const fetchAllLeaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaveService.getAllLeaves();
      setAllLeaves(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leave requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyLeaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leaveService.getMyLeaves();
      setMyLeaves(data);
      const bal = await leaveService.getLeaveBalances();
      setBalances(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch my leave requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyLeave = async (payload: ApplyLeavePayload) => {
    setIsLoading(true);
    try {
      const newLeave = await leaveService.applyLeave(payload);
      setMyLeaves((prev) => [newLeave, ...prev]);
      addToast('success', 'Request Submitted', 'Your leave request has been submitted to HR.');
      return newLeave;
    } catch (err: any) {
      addToast('error', 'Submission Failed', err.message || 'Failed to submit leave');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveLeave = async (id: string, comments?: string) => {
    setIsLoading(true);
    try {
      const updated = await leaveService.approveLeave(id, comments);
      setAllLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
      addToast('success', 'Leave Approved', `Leave request for ${updated.employeeName} approved.`);
      return updated;
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message || 'Failed to approve leave');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectLeave = async (id: string, comments?: string) => {
    setIsLoading(true);
    try {
      const updated = await leaveService.rejectLeave(id, comments);
      setAllLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
      addToast('warning', 'Leave Rejected', `Leave request for ${updated.employeeName} rejected.`);
      return updated;
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message || 'Failed to reject leave');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    allLeaves,
    myLeaves,
    balances,
    isLoading,
    error,
    fetchAllLeaves,
    fetchMyLeaves,
    applyLeave,
    approveLeave,
    rejectLeave,
  };
};
