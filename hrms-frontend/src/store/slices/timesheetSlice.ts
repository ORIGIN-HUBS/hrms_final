import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface TimesheetEntry {
  id?: number;
  entryDate: string;
  projectId: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  description: string;
  workType: string;
  workLocation: string;
  billableToClient: boolean;
}

export interface TimesheetExpense {
  id?: number;
  expenseDate: string;
  projectId: string;
  category: string;
  expenseAmount: number;
  description: string;
  vendorName: string;
}

export interface Timesheet {
  id?: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    workEmail?: string;
    personalEmail?: string;
  };
  weekStartDate: string;
  weekEndDate: string;
  totalHoursLogged?: number;
  totalBillableHours?: number;
  totalOvertimeHours?: number;
  totalPayableAmount?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  submittedOn?: string;
  rejectionReason?: string;
  timeEntries?: TimesheetEntry[];
  expenses?: TimesheetExpense[];
}

interface TimesheetState {
  timesheets: Timesheet[];
  selectedTimesheet: Timesheet | null;
  loading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  timesheets: [],
  selectedTimesheet: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTimesheets = createAsyncThunk(
  'timesheet/fetchTimesheets',
  async (params: { status?: string; search?: string; page?: number; size?: number }) => {
    const response = await api.get('/timesheets', { params });
    return response.data;
  }
);

export const fetchTimesheetById = createAsyncThunk(
  'timesheet/fetchTimesheetById',
  async (id: number) => {
    const response = await api.get(`/timesheets/${id}`);
    return response.data;
  }
);

export const createTimesheet = createAsyncThunk(
  'timesheet/createTimesheet',
  async (timesheetData: Partial<Timesheet>) => {
    const response = await api.post('/timesheets', timesheetData);
    return response.data;
  }
);

export const updateTimesheet = createAsyncThunk(
  'timesheet/updateTimesheet',
  async ({ id, data }: { id: number; data: Partial<Timesheet> }) => {
    const response = await api.put(`/timesheets/${id}`, data);
    return response.data;
  }
);

export const approveTimesheet = createAsyncThunk(
  'timesheet/approveTimesheet',
  async ({ id, comments }: { id: number; comments: string }) => {
    const response = await api.post(`/timesheets/${id}/approve`, { comments });
    return response.data;
  }
);

export const rejectTimesheet = createAsyncThunk(
  'timesheet/rejectTimesheet',
  async ({ id, comments }: { id: number; comments: string }) => {
    const response = await api.post(`/timesheets/${id}/reject`, { comments });
    return response.data;
  }
);

export const submitTimesheet = createAsyncThunk(
  'timesheet/submitTimesheet',
  async (id: number) => {
    const response = await api.post(`/timesheets/${id}/submit`);
    return response.data;
  }
);

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedTimesheet: (state) => {
      state.selectedTimesheet = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch timesheets
      .addCase(fetchTimesheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets = action.payload;
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timesheets';
      })
      
      // Fetch timesheet by ID
      .addCase(fetchTimesheetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimesheetById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTimesheet = action.payload;
      })
      .addCase(fetchTimesheetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timesheet';
      })
      
      // Create timesheet
      .addCase(createTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets.push(action.payload);
      })
      .addCase(createTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create timesheet';
      })
      
      // Update timesheet
      .addCase(updateTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timesheets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timesheets[index] = action.payload;
        }
        state.selectedTimesheet = action.payload;
      })
      .addCase(updateTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update timesheet';
      })
      
      // Approve timesheet
      .addCase(approveTimesheet.fulfilled, (state, action) => {
        const index = state.timesheets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timesheets[index] = action.payload;
        }
      })
      
      // Reject timesheet
      .addCase(rejectTimesheet.fulfilled, (state, action) => {
        const index = state.timesheets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timesheets[index] = action.payload;
        }
      })
      
      // Submit timesheet
      .addCase(submitTimesheet.fulfilled, (state, action) => {
        const index = state.timesheets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timesheets[index] = action.payload;
        }
        state.selectedTimesheet = action.payload;
      });
  },
});

export const { clearError, clearSelectedTimesheet } = timesheetSlice.actions;
export default timesheetSlice.reducer;