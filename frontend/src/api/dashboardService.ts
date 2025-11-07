import { apiClient } from './client';
import { DashboardAnalytics } from '../types';

export const dashboardService = {
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await apiClient.get('/api/dashboard/analytics');
    return response.data;
  },

  getEmployeeAnalytics: async (employeeId: string): Promise<any> => {
    const response = await apiClient.get(`/api/dashboard/employee-analytics/${employeeId}`);
    return response.data;
  },
};