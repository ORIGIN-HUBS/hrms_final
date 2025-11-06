import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId?: string;
  personalEmail: string;
  workEmail?: string;
  contactNumber: string;
  jobTitle: string;
  status: string;
  joiningDate?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
  alternateContactNumber?: string;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  ssn?: string;
  workPermit?: string;
  supervisor?: string;
  employmentType?: string;
  workLocation?: string;
  workMode?: string;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params?: { search?: string; page?: number; size?: number }) => {
    const response = await api.get('/employees', { params });
    return response.data;
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employee/fetchEmployeeById',
  async (id: number) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  }
);

export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (employeeData: Partial<Employee>) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  }
);

export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, data }: { id: number; data: Partial<Employee> }) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.selectedEmployee = action.payload;
      });
  },
});

export const { clearError, clearSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;