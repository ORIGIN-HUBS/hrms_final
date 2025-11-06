import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { Employee, EmployeeCreateRequest } from '@/types';

export const employeeService = {
  /**
   * Get all employees
   */
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await apiClient.get<Employee[]>(API_CONFIG.ENDPOINTS.EMPLOYEES);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
  },
  
  /**
   * Get employee by ID
   */
  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      const response = await apiClient.get<Employee>(
        API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employee');
    }
  },
  
  /**
   * Get employee by email
   */
  getEmployeeByEmail: async (email: string): Promise<Employee> => {
    try {
      const response = await apiClient.get<Employee>(
        API_CONFIG.ENDPOINTS.EMPLOYEE_BY_EMAIL(email)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employee');
    }
  },
  
  /**
   * Create new employee
   */
  createEmployee: async (data: EmployeeCreateRequest): Promise<Employee> => {
    try {
      const response = await apiClient.post<Employee>(
        API_CONFIG.ENDPOINTS.EMPLOYEES,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create employee');
    }
  },
  
  /**
   * Update employee
   */
  updateEmployee: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await apiClient.put<Employee>(
        API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update employee');
    }
  },

  /**
   * Delete employee
   */
  deleteEmployee: async (id: number): Promise<void> => {
    try {
      console.log('Deleting employee with ID:', id);
      console.log('Delete URL:', API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id));
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id));
      console.log('Delete response:', response);
    } catch (error: any) {
      console.error('Delete employee error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete employee');
    }
  },
  
  /**
   * Upload employee document
   */
  uploadDocument: async (employeeId: number, file: FormData): Promise<any> => {
    try {
      const response = await apiClient.upload(
        API_CONFIG.ENDPOINTS.EMPLOYEE_UPLOAD_DOCUMENT(employeeId),
        file
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },
  
  /**
   * Get employee documents
   */
  getEmployeeDocuments: async (employeeId: number): Promise<any[]> => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.EMPLOYEE_DOCUMENTS(employeeId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  },
  
  /**
   * Create user account for employee
   */
  createUserAccount: async (employeeId: number, userData: any): Promise<any> => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CREATE_USER_ACCOUNT(employeeId),
        userData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user account');
    }
  },
};

export default employeeService;

