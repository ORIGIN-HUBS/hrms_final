import { apiClient } from './api';
import { API_CONFIG } from '@/constants/config';
import { Timesheet, TimesheetEntry } from '@/types';

export const timesheetService = {
  /**
   * Get all timesheets
   */
  getAllTimesheets: async (): Promise<Timesheet[]> => {
    try {
      const response = await apiClient.get<Timesheet[]>(API_CONFIG.ENDPOINTS.TIMESHEETS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timesheets');
    }
  },

  /**
   * Get timesheet by ID
   */
  getTimesheetById: async (id: number): Promise<Timesheet> => {
    try {
      const response = await apiClient.get<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEET_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timesheet');
    }
  },

  /**
   * Get timesheets by employee
   */
  getTimesheetsByEmployee: async (employeeId: number): Promise<Timesheet[]> => {
    try {
      const response = await apiClient.get<Timesheet[]>(
        API_CONFIG.ENDPOINTS.TIMESHEETS_BY_EMPLOYEE(employeeId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employee timesheets');
    }
  },

  /**
   * Get pending timesheets for approval
   */
  getPendingTimesheets: async (): Promise<Timesheet[]> => {
    try {
      const response = await apiClient.get<Timesheet[]>(
        API_CONFIG.ENDPOINTS.TIMESHEETS_PENDING
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending timesheets');
    }
  },

  /**
   * Create new timesheet
   */
  createTimesheet: async (data: Partial<Timesheet>): Promise<Timesheet> => {
    try {
      const response = await apiClient.post<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEETS,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create timesheet');
    }
  },

  /**
   * Update timesheet
   */
  updateTimesheet: async (id: number, data: Partial<Timesheet>): Promise<Timesheet> => {
    try {
      const response = await apiClient.put<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEET_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update timesheet');
    }
  },

  /**
   * Submit timesheet for approval
   */
  submitTimesheet: async (id: number): Promise<Timesheet> => {
    try {
      const response = await apiClient.post<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEET_SUBMIT(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit timesheet');
    }
  },

  /**
   * Approve timesheet
   */
  approveTimesheet: async (id: number): Promise<Timesheet> => {
    try {
      const response = await apiClient.post<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEET_APPROVE(id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve timesheet');
    }
  },

  /**
   * Reject timesheet
   */
  rejectTimesheet: async (id: number, reason: string): Promise<Timesheet> => {
    try {
      const response = await apiClient.post<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEET_REJECT(id),
        { reason }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject timesheet');
    }
  },

  /**
   * Save timesheet entries (auto-save)
   */
  saveTimesheetEntries: async (id: number, entries: TimesheetEntry[]): Promise<any> => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.TIMESHEET_SAVE(id),
        entries
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save timesheet entries');
    }
  },

  /**
   * Get timesheet summary
   */
  getTimesheetSummary: async (weekStart?: string): Promise<any> => {
    try {
      const url = weekStart
        ? `${API_CONFIG.ENDPOINTS.TIMESHEET_SUMMARY}?weekStart=${weekStart}`
        : API_CONFIG.ENDPOINTS.TIMESHEET_SUMMARY;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timesheet summary');
    }
  },

  /**
   * Get or create current week timesheet
   */
  getCurrentWeekTimesheet: async (employeeId: number): Promise<Timesheet> => {
    try {
      const response = await apiClient.get<Timesheet>(
        API_CONFIG.ENDPOINTS.TIMESHEET_CURRENT_WEEK(employeeId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get current week timesheet');
    }
  },
};

export default timesheetService;

