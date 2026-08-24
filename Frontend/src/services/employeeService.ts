import { request } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { Employee } from '../types';
import { MOCK_EMPLOYEES, MOCK_CURRENT_EMPLOYEE } from '../api/mockData';

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    try {
      return await request<Employee[]>(API_ENDPOINTS.EMPLOYEES.LIST);
    } catch (error) {
      return MOCK_EMPLOYEES;
    }
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    try {
      return await request<Employee>(API_ENDPOINTS.EMPLOYEES.DETAIL(id));
    } catch (error) {
      const found = MOCK_EMPLOYEES.find((e) => e.id === id || e.employeeId === id);
      return found || MOCK_CURRENT_EMPLOYEE;
    }
  },

  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<Employee> => {
    try {
      return await request<Employee>(API_ENDPOINTS.EMPLOYEES.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // Local Mock Update
      const found = MOCK_EMPLOYEES.find((e) => e.id === id || e.employeeId === id) || MOCK_CURRENT_EMPLOYEE;
      const updated = { ...found, ...updates };
      return updated;
    }
  },

  uploadDocument: async (empId: string, docName: string): Promise<any> => {
    try {
      return await request(API_ENDPOINTS.EMPLOYEES.DOCUMENTS(empId), {
        method: 'POST',
        body: JSON.stringify({ name: docName }),
      });
    } catch (error) {
      return {
        id: 'doc-' + Date.now(),
        name: docName,
        type: docName.endsWith('.pdf') ? 'PDF' : 'Document',
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: '#',
        size: '1.5 MB',
      };
    }
  },
};
