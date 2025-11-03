import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { Offboarding } from '@/types';

export const offboardingService = {
  /**
   * Get all offboarding records
   */
  getAllOffboardings: async (): Promise<Offboarding[]> => {
    try {
      const response = await apiClient.get<Offboarding[]>(API_CONFIG.ENDPOINTS.OFFBOARDINGS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch offboarding records');
    }
  },

  /**
   * Get offboarding by ID
   */
  getOffboardingById: async (id: number): Promise<Offboarding> => {
    try {
      const response = await apiClient.get<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch offboarding record');
    }
  },

  /**
   * Get offboarding by employee ID
   */
  getOffboardingByEmployee: async (employeeId: number): Promise<Offboarding> => {
    try {
      const response = await apiClient.get<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_BY_EMPLOYEE(employeeId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employee offboarding');
    }
  },

  /**
   * Initiate offboarding process
   */
  initiateOffboarding: async (data: Partial<Offboarding>): Promise<Offboarding> => {
    try {
      const response = await apiClient.post<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDINGS,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate offboarding');
    }
  },

  /**
   * Update offboarding record
   */
  updateOffboarding: async (id: number, data: Partial<Offboarding>): Promise<Offboarding> => {
    try {
      const response = await apiClient.put<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update offboarding');
    }
  },

  /**
   * Revoke IT access (email and slack)
   */
  revokeAccess: async (id: number, accessType: 'email' | 'slack' | 'all'): Promise<Offboarding> => {
    try {
      const response = await apiClient.post<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_REVOKE_ACCESS(id),
        { accessType }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to revoke access');
    }
  },

  /**
   * Generate relieving letter
   */
  generateRelievingLetter: async (id: number): Promise<Offboarding> => {
    try {
      const response = await apiClient.post<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_GENERATE_RELIEVING(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate relieving letter');
    }
  },

  /**
   * Generate experience certificate
   */
  generateExperienceCertificate: async (id: number): Promise<Offboarding> => {
    try {
      const response = await apiClient.post<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_GENERATE_EXPERIENCE(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate experience certificate');
    }
  },

  /**
   * Complete offboarding process
   */
  completeOffboarding: async (id: number): Promise<Offboarding> => {
    try {
      const response = await apiClient.post<Offboarding>(
        API_CONFIG.ENDPOINTS.OFFBOARDING_COMPLETE(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete offboarding');
    }
  },

  /**
   * Delete offboarding record
   */
  deleteOffboarding: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.OFFBOARDING_BY_ID(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete offboarding record');
    }
  },
};

export default offboardingService;

