import { apiClient } from './client';

export interface Project {
  id: number;
  projectName: string;
  jobTitle: string;
  vendorCompanyName: string;
  pocName?: string;
  pocTitle?: string;
  pocEmail?: string;
  pocPhone?: string;
  vendorEmail?: string;
  agreementTerms?: string;
  vendorLocation?: string;
  clientCompanyName: string;
  clientLocation?: string;
  workMode?: string;
  vendorPayRate?: number;
  candidatePayRate?: number;
  projectStartDate: string;
  projectEndDate?: string;
  extensionDate?: string;
  status: string;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get('/api/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  create: async (project: Partial<Project>): Promise<Project> => {
    const response = await apiClient.post('/api/projects', project);
    return response.data;
  },

  update: async (id: number, project: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put(`/api/projects/${id}`, project);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },

  search: async (query: string): Promise<Project[]> => {
    const response = await apiClient.get(`/api/projects?search=${encodeURIComponent(query)}`);
    return response.data;
  },
};