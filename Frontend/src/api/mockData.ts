import { Employee, AttendanceRecord, LeaveRequest, EmployeePayroll, NotificationItem, DashboardAnalytics } from '../types';

export const MOCK_CURRENT_EMPLOYEE: Employee = {
  id: 'emp-101',
  employeeId: 'DAY-1001',
  name: 'Alex Vance',
  email: 'alex.vance@dayflow.io',
  role: 'EMPLOYEE',
  phone: '+1 (555) 234-5678',
  address: '742 Evergreen Terrace, San Francisco, CA 94107',
  profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  department: 'Engineering',
  designation: 'Senior Frontend Engineer',
  joiningDate: '2023-03-15',
  employmentType: 'Full-Time',
  reportingManager: 'Sarah Connor (VP of Tech)',
  workLocation: 'San Francisco HQ / Remote Hybrid',
  status: 'Active',
  todayAttendanceStatus: 'Present',
  documents: [
    { id: 'doc-1', name: 'Employment_Contract_2023.pdf', type: 'PDF', uploadDate: '2023-03-15', fileUrl: '#', size: '2.4 MB' },
    { id: 'doc-2', name: 'Tax_Declaration_W4.pdf', type: 'PDF', uploadDate: '2024-01-10', fileUrl: '#', size: '1.1 MB' },
    { id: 'doc-3', name: 'Identity_Verification_Passport.pdf', type: 'PDF', uploadDate: '2023-03-15', fileUrl: '#', size: '3.8 MB' }
  ]
};

export const MOCK_HR_USER: Employee = {
  id: 'emp-999',
  employeeId: 'DAY-0001',
  name: 'Elena Rostova',
  email: 'hr@dayflow.io',
  role: 'HR',
  phone: '+1 (555) 999-1122',
  address: '100 Corporate Parkway, San Jose, CA',
  profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  department: 'Human Resources',
  designation: 'Head of People Ops & HR',
  joiningDate: '2021-01-10',
  employmentType: 'Full-Time',
  reportingManager: 'Board of Directors',
  workLocation: 'San Francisco HQ',
  status: 'Active',
  todayAttendanceStatus: 'Present',
  documents: []
};

export const MOCK_EMPLOYEES: Employee[] = [
  MOCK_CURRENT_EMPLOYEE,
  MOCK_HR_USER,
  {
    id: 'emp-102',
    employeeId: 'DAY-1002',
    name: 'Marcus Chen',
    email: 'marcus.c@dayflow.io',
    role: 'EMPLOYEE',
    phone: '+1 (555) 345-6789',
    address: '120 Market Street, San Francisco, CA',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    department: 'Engineering',
    designation: 'Backend Architect',
    joiningDate: '2022-08-01',
    employmentType: 'Full-Time',
    reportingManager: 'Sarah Connor',
    workLocation: 'San Francisco HQ',
    status: 'Active',
    todayAttendanceStatus: 'Present',
    documents: []
  },
  {
    id: 'emp-103',
    employeeId: 'DAY-1003',
    name: 'Sophia Martinez',
    email: 'sophia.m@dayflow.io',
    role: 'EMPLOYEE',
    phone: '+1 (555) 876-5432',
    address: '456 Mission Street, San Francisco, CA',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    department: 'Product & Design',
    designation: 'Lead UI/UX Designer',
    joiningDate: '2023-01-20',
    employmentType: 'Full-Time',
    reportingManager: 'David K. (CPO)',
    workLocation: 'Remote',
    status: 'On Leave',
    todayAttendanceStatus: 'Leave',
    documents: []
  },
  {
    id: 'emp-104',
    employeeId: 'DAY-1004',
    name: 'David Kim',
    email: 'david.k@dayflow.io',
    role: 'ADMIN',
    phone: '+1 (555) 654-3210',
    address: '888 Brannan St, San Francisco, CA',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    department: 'Executive',
    designation: 'Chief Product Officer',
    joiningDate: '2020-05-10',
    employmentType: 'Full-Time',
    reportingManager: 'CEO',
    workLocation: 'San Francisco HQ',
    status: 'Active',
    todayAttendanceStatus: 'Present',
    documents: []
  },
  {
    id: 'emp-105',
    employeeId: 'DAY-1005',
    name: 'Emma Watson',
    email: 'emma.w@dayflow.io',
    role: 'EMPLOYEE',
    phone: '+1 (555) 432-1098',
    address: '333 Palo Alto Ave, Palo Alto, CA',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    department: 'Marketing',
    designation: 'Growth Marketing Manager',
    joiningDate: '2024-02-01',
    employmentType: 'Full-Time',
    reportingManager: 'Elena Rostova',
    workLocation: 'Hybrid',
    status: 'Active',
    todayAttendanceStatus: 'Half-day',
    documents: []
  }
];

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'DAY-1001',
    employeeName: 'Alex Vance',
    date: '2026-08-24',
    checkInTime: '2026-08-24T09:02:00Z',
    checkOutTime: undefined,
    totalHours: 6.2,
    status: 'Present',
    location: 'San Francisco HQ (IP Verified)'
  },
  {
    id: 'att-2',
    employeeId: 'DAY-1002',
    employeeName: 'Marcus Chen',
    date: '2026-08-24',
    checkInTime: '2026-08-24T08:55:00Z',
    checkOutTime: undefined,
    totalHours: 6.3,
    status: 'Present',
    location: 'Remote VPN'
  },
  {
    id: 'att-3',
    employeeId: 'DAY-1003',
    employeeName: 'Sophia Martinez',
    date: '2026-08-24',
    status: 'Leave',
    notes: 'Approved Paid Vacation Leave'
  },
  {
    id: 'att-4',
    employeeId: 'DAY-1005',
    employeeName: 'Emma Watson',
    date: '2026-08-24',
    checkInTime: '2026-08-24T09:15:00Z',
    checkOutTime: '2026-08-24T13:15:00Z',
    totalHours: 4.0,
    status: 'Half-day',
    notes: 'Medical appointment afternoon'
  },
  {
    id: 'att-5',
    employeeId: 'DAY-1001',
    employeeName: 'Alex Vance',
    date: '2026-08-23',
    checkInTime: '2026-08-23T08:58:00Z',
    checkOutTime: '2026-08-23T17:30:00Z',
    totalHours: 8.5,
    status: 'Present',
    location: 'San Francisco HQ'
  },
  {
    id: 'att-6',
    employeeId: 'DAY-1001',
    employeeName: 'Alex Vance',
    date: '2026-08-22',
    checkInTime: '2026-08-22T09:05:00Z',
    checkOutTime: '2026-08-22T17:15:00Z',
    totalHours: 8.1,
    status: 'Present',
    location: 'San Francisco HQ'
  }
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lve-101',
    employeeId: 'DAY-1001',
    employeeName: 'Alex Vance',
    department: 'Engineering',
    leaveType: 'Paid Leave',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    totalDays: 5,
    remarks: 'Annual family vacation trip to Hawaii.',
    status: 'Pending',
    appliedOn: '2026-08-22'
  },
  {
    id: 'lve-102',
    employeeId: 'DAY-1003',
    employeeName: 'Sophia Martinez',
    department: 'Product & Design',
    leaveType: 'Paid Leave',
    startDate: '2026-08-24',
    endDate: '2026-08-26',
    totalDays: 3,
    remarks: 'Attending Design System Conference.',
    status: 'Approved',
    appliedOn: '2026-08-15',
    reviewedBy: 'Elena Rostova',
    adminComments: 'Approved! Have a great conference.',
    reviewedAt: '2026-08-16'
  },
  {
    id: 'lve-103',
    employeeId: 'DAY-1002',
    employeeName: 'Marcus Chen',
    department: 'Engineering',
    leaveType: 'Sick Leave',
    startDate: '2026-08-18',
    endDate: '2026-08-19',
    totalDays: 2,
    remarks: 'Severe dental procedure and recovery.',
    status: 'Approved',
    appliedOn: '2026-08-17',
    reviewedBy: 'Elena Rostova',
    adminComments: 'Get well soon Marcus.',
    reviewedAt: '2026-08-17'
  },
  {
    id: 'lve-104',
    employeeId: 'DAY-1005',
    employeeName: 'Emma Watson',
    department: 'Marketing',
    leaveType: 'Unpaid Leave',
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    totalDays: 2,
    remarks: 'Personal urgent relocation.',
    status: 'Rejected',
    appliedOn: '2026-07-28',
    reviewedBy: 'Elena Rostova',
    adminComments: 'Insufficient advance notice for marketing campaign launch week.',
    reviewedAt: '2026-07-29'
  }
];

export const MOCK_PAYROLL: EmployeePayroll[] = [
  {
    employeeId: 'DAY-1001',
    employeeName: 'Alex Vance',
    department: 'Engineering',
    designation: 'Senior Frontend Engineer',
    lastPayoutMonth: 'July 2026',
    lastPayoutAmount: 8750,
    status: 'Active',
    salaryStructure: {
      basicSalary: 6000,
      hra: 2400,
      specialAllowance: 1100,
      conveyanceAllowance: 300,
      medicalAllowance: 200,
      grossSalary: 10000,
      pfDeduction: 750,
      taxDeduction: 500,
      otherDeductions: 0,
      totalDeductions: 1250,
      netSalary: 8750,
      currency: 'USD'
    }
  },
  {
    employeeId: 'DAY-1002',
    employeeName: 'Marcus Chen',
    department: 'Engineering',
    designation: 'Backend Architect',
    lastPayoutMonth: 'July 2026',
    lastPayoutAmount: 9600,
    status: 'Active',
    salaryStructure: {
      basicSalary: 6500,
      hra: 2600,
      specialAllowance: 1400,
      conveyanceAllowance: 300,
      medicalAllowance: 200,
      grossSalary: 11000,
      pfDeduction: 800,
      taxDeduction: 600,
      otherDeductions: 0,
      totalDeductions: 1400,
      netSalary: 9600,
      currency: 'USD'
    }
  },
  {
    employeeId: 'DAY-1003',
    employeeName: 'Sophia Martinez',
    department: 'Product & Design',
    designation: 'Lead UI/UX Designer',
    lastPayoutMonth: 'July 2026',
    lastPayoutAmount: 8200,
    status: 'Active',
    salaryStructure: {
      basicSalary: 5500,
      hra: 2200,
      specialAllowance: 1100,
      conveyanceAllowance: 300,
      medicalAllowance: 200,
      grossSalary: 9300,
      pfDeduction: 650,
      taxDeduction: 450,
      otherDeductions: 0,
      totalDeductions: 1100,
      netSalary: 8200,
      currency: 'USD'
    }
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'emp-101',
    type: 'leave:approved',
    title: 'Leave Approved',
    message: 'Your leave request for Design Conference has been approved by Elena Rostova.',
    timestamp: '2026-08-24T08:30:00Z',
    isRead: false
  },
  {
    id: 'notif-2',
    userId: 'emp-101',
    type: 'payroll:updated',
    title: 'Pay Slip Available',
    message: 'Your pay slip for July 2026 is now available for download.',
    timestamp: '2026-08-01T10:00:00Z',
    isRead: true
  },
  {
    id: 'notif-3',
    userId: 'emp-101',
    type: 'attendance:updated',
    title: 'Clock-in Confirmed',
    message: 'Successfully checked in at 09:02 AM today.',
    timestamp: '2026-08-24T09:02:00Z',
    isRead: false
  }
];

export const MOCK_ANALYTICS: DashboardAnalytics = {
  kpis: {
    totalEmployees: 148,
    presentToday: 136,
    presentPercentage: 91.8,
    pendingLeaves: 5,
    monthlyPayrollTotal: 1248000
  },
  attendance: {
    presentCount: 136,
    absentCount: 4,
    halfDayCount: 3,
    leaveCount: 5,
    weeklyTrend: [
      { day: 'Mon', present: 140, absent: 3 },
      { day: 'Tue', present: 138, absent: 5 },
      { day: 'Wed', present: 142, absent: 1 },
      { day: 'Thu', present: 139, absent: 4 },
      { day: 'Fri', present: 136, absent: 7 }
    ]
  },
  leaves: {
    pendingCount: 5,
    approvedCount: 28,
    rejectedCount: 4,
    typeDistribution: [
      { type: 'Paid Leave', count: 18 },
      { type: 'Sick Leave', count: 12 },
      { type: 'Unpaid Leave', count: 2 }
    ]
  },
  payroll: {
    totalExpenditure: 1248000,
    averageSalary: 8432,
    departmentDistribution: [
      { department: 'Engineering', amount: 580000 },
      { department: 'Product & Design', amount: 240000 },
      { department: 'Sales & Mktg', amount: 220000 },
      { department: 'HR & Admin', amount: 208000 }
    ],
    monthlyTrend: [
      { month: 'Apr', amount: 1180000 },
      { month: 'May', amount: 1210000 },
      { month: 'Jun', amount: 1225000 },
      { month: 'Jul', amount: 1248000 }
    ]
  }
};
