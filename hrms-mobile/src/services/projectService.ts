import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { Project } from '@/types';
import { sanitizeLogMessage } from '@/utils/security';

export const projectService = {
  /**
   * Get all projects
   */
  getAllProjects: async (searchQuery?: string): Promise<Project[]> => {
    try {
      const url = searchQuery
        ? `${API_CONFIG.ENDPOINTS.PROJECTS}?search=${encodeURIComponent(searchQuery)}`
        : API_CONFIG.ENDPOINTS.PROJECTS;
      const response = await apiClient.get<Project[]>(url);
      return response.data || [];
    } catch (error: any) {
      if (__DEV__) {
        console.warn('Projects API error:', sanitizeLogMessage(error.response?.data?.message || error.message));
      }
      if (error.response?.status === 500) {
        // Return empty array for server errors to prevent app crash
        return [];
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
  },
  
  /**
   * Get project by ID
   */
  getProjectById: async (id: number): Promise<Project> => {
    try {
      const response = await apiClient.get<Project>(
        API_CONFIG.ENDPOINTS.PROJECT_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project');
    }
  },
  
  /**
   * Get projects by employee
   */
  getProjectsByEmployee: async (employeeId: number): Promise<Project[]> => {
    try {
      const response = await apiClient.get<Project[]>(
        API_CONFIG.ENDPOINTS.PROJECTS_BY_EMPLOYEE(employeeId)
      );
      return response.data || [];
    } catch (error: any) {
      if (__DEV__) {
        console.warn('Employee projects API error:', sanitizeLogMessage(error.response?.data?.message || error.message));
      }
      if (error.response?.status === 500) {
        // Return empty array for server errors to prevent app crash
        return [];
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch employee projects');
    }
  },
  
  /**
   * Create new project
   */
  createProject: async (data: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiClient.post<Project>(
        API_CONFIG.ENDPOINTS.PROJECTS,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  },
  
  /**
   * Update project
   */
  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiClient.put<Project>(
        API_CONFIG.ENDPOINTS.PROJECT_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },
};

export default projectService;

