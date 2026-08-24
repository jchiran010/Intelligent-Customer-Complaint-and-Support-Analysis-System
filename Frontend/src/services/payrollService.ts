import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { EmployeePayroll, PaySlip, UpdateSalaryPayload, SalaryStructure } from '../types';
import { MOCK_PAYROLL } from '../api/mockData';
import { socketClient } from '../api/socketClient';

export const payrollService = {
  getMyPayroll: async (): Promise<EmployeePayroll> => {
    try {
      return await request<EmployeePayroll>(API_ENDPOINTS.PAYROLL.MY_PAYROLL);
    } catch (error) {
      return MOCK_PAYROLL[0];
    }
  },

  getAllPayroll: async (): Promise<EmployeePayroll[]> => {
    try {
      return await request<EmployeePayroll[]>(API_ENDPOINTS.PAYROLL.LIST);
    } catch (error) {
      return MOCK_PAYROLL;
    }
  },

  updateSalaryStructure: async (empId: string, payload: UpdateSalaryPayload): Promise<EmployeePayroll> => {
    let updatedItem: EmployeePayroll;

    const grossSalary = payload.basicSalary + payload.hra + payload.specialAllowance + payload.conveyanceAllowance + payload.medicalAllowance;
    const totalDeductions = payload.pfDeduction + payload.taxDeduction + payload.otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    const newStructure: SalaryStructure = {
      ...payload,
      grossSalary,
      totalDeductions,
      netSalary,
      currency: 'USD',
    };

    try {
      updatedItem = await request<EmployeePayroll>(API_ENDPOINTS.PAYROLL.UPDATE(empId), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      const found = MOCK_PAYROLL.find((p) => p.employeeId === empId);
      if (found) {
        found.salaryStructure = newStructure;
        found.lastPayoutAmount = netSalary;
        updatedItem = { ...found };
      } else {
        updatedItem = {
          employeeId: empId,
          employeeName: 'Employee ' + empId,
          department: 'Engineering',
          designation: 'Staff Specialist',
          lastPayoutMonth: 'August 2026',
          lastPayoutAmount: netSalary,
          status: 'Active',
          salaryStructure: newStructure,
        };
      }
    }

    socketClient.emitLocalEvent('payroll:updated', updatedItem);
    return updatedItem;
  },

  getPaySlips: async (): Promise<PaySlip[]> => {
    try {
      return await request<PaySlip[]>(API_ENDPOINTS.PAYROLL.PAYSLIPS);
    } catch (error) {
      return [
        {
          id: 'ps-101',
          employeeId: 'DAY-1001',
          employeeName: 'Alex Vance',
          month: 'July 2026',
          issueDate: '2026-08-01',
          salaryStructure: MOCK_PAYROLL[0].salaryStructure,
          paymentStatus: 'Paid',
          downloadUrl: '#',
        },
        {
          id: 'ps-100',
          employeeId: 'DAY-1001',
          employeeName: 'Alex Vance',
          month: 'June 2026',
          issueDate: '2026-07-01',
          salaryStructure: MOCK_PAYROLL[0].salaryStructure,
          paymentStatus: 'Paid',
          downloadUrl: '#',
        },
      ];
    }
  },
};
