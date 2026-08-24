export interface SalaryStructure {
  basicSalary: number;
  hra: number; // House Rent Allowance
  specialAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  grossSalary: number;
  pfDeduction: number; // Provident Fund
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  currency: string;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "August 2026"
  issueDate: string;
  salaryStructure: SalaryStructure;
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  downloadUrl?: string;
}

export interface EmployeePayroll {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  salaryStructure: SalaryStructure;
  lastPayoutMonth: string;
  lastPayoutAmount: number;
  status: 'Active' | 'On Hold';
}

export interface UpdateSalaryPayload {
  employeeId: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
}
