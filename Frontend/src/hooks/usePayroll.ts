import { useState, useCallback } from 'react';
import { EmployeePayroll, PaySlip, UpdateSalaryPayload } from '../types';
import { payrollService } from '../services/payrollService';
import { useNotification } from '../context/NotificationContext';

export const usePayroll = () => {
  const [myPayroll, setMyPayroll] = useState<EmployeePayroll | null>(null);
  const [allPayroll, setAllPayroll] = useState<EmployeePayroll[]>([]);
  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useNotification();

  const fetchMyPayroll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await payrollService.getMyPayroll();
      setMyPayroll(data);
      const slips = await payrollService.getPaySlips();
      setPaySlips(slips);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payroll');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllPayroll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await payrollService.getAllPayroll();
      setAllPayroll(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organizational payroll');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSalaryStructure = async (empId: string, payload: UpdateSalaryPayload) => {
    setIsLoading(true);
    try {
      const updated = await payrollService.updateSalaryStructure(empId, payload);
      setAllPayroll((prev) => prev.map((p) => (p.employeeId === empId ? updated : p)));
      addToast('success', 'Payroll Updated', `Salary structure updated for ${updated.employeeName}.`);
      return updated;
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Failed to update salary structure');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    myPayroll,
    allPayroll,
    paySlips,
    isLoading,
    error,
    fetchMyPayroll,
    fetchAllPayroll,
    updateSalaryStructure,
  };
};
