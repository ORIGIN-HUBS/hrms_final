import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  pendingDocuments: number;
  totalTimesheets: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  employeeDashboard: any;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  employeeDashboard: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
);

export const fetchEmployeeDashboard = createAsyncThunk(
  'dashboard/fetchEmployeeDashboard',
  async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => {
        state.employeeDashboard = action.payload;
      });
  },
});

export default dashboardSlice.reducer;