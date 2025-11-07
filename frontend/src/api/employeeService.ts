import { apiClient } from './client';
import { Employee } from '../types';

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/api/employees');
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get(`/api/employees/${id}`);
    return response.data;
  },

  create: async (employee: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.post('/api/employees', employee);
    return response.data;
  },

  update: async (id: number, employee: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put(`/api/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/employees/${id}`);
  },

  search: async (query: string): Promise<Employee[]> => {
    const response = await apiClient.get(`/api/employees?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  createUserAccount: async (employeeId: number): Promise<any> => {
    const response = await apiClient.post(`/api/employees/${employeeId}/create-user-account`);
    return response.data;
  },
};