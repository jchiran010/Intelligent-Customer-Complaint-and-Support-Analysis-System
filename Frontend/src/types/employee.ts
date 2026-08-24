import { UserRole } from './user';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string;
  size: string;
}

export interface PersonalDetails {
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  address: string;
  dob?: string;
  gender?: string;
  profilePicture?: string;
  emergencyContact?: string;
}

export interface JobDetails {
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  reportingManager: string;
  workLocation: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  profilePicture?: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: string;
  reportingManager: string;
  workLocation: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Inactive';
  todayAttendanceStatus?: 'Present' | 'Absent' | 'Half-day' | 'Leave';
  documents: DocumentItem[];
}
