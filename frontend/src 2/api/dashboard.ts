import { apiClient } from './client';
import { DashboardStats, Employee, Project } from '@/types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },

  getRecentEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get('/api/dashboard/recent-employees');
    return response.data;
  },

  getRecentProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/api/dashboard/recent-projects');
    return response.data;
  },

  getDepartmentStats: async () => {
    const response = await apiClient.get('/api/dashboard/department-stats');
    return response.data;
  },

  getMonthlyHires: async () => {
    const response = await apiClient.get('/api/dashboard/monthly-hires');
    return response.data;
  },
};