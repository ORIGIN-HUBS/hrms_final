import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Offboarding {
  id?: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
    department?: string;
  };
  lastWorkingDay?: string;
  reason?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  initiatedDate?: string;
  initiatedBy?: string;
  completedDate?: string;
  notes?: string;
  exitInterviewCompleted?: boolean;
  assetsReturned?: boolean;
  accessRevoked?: boolean;
  finalPayProcessed?: boolean;
}

interface OffboardingStats {
  totalOffboardings: number;
  inProgressOffboardings: number;
  completedOffboardings: number;
  cancelledOffboardings: number;
}

interface OffboardingState {
  offboardings: Offboarding[];
  selectedOffboarding: Offboarding | null;
  stats: OffboardingStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: OffboardingState = {
  offboardings: [],
  selectedOffboarding: null,
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchOffboardings = createAsyncThunk(
  'offboarding/fetchOffboardings',
  async (params: { search?: string; page?: number; size?: number }) => {
    const response = await api.get('/offboardings', { params });
    return response.data;
  }
);

export const fetchOffboardingById = createAsyncThunk(
  'offboarding/fetchOffboardingById',
  async (id: number) => {
    const response = await api.get(`/offboardings/${id}`);
    return response.data;
  }
);

export const createOffboarding = createAsyncThunk(
  'offboarding/createOffboarding',
  async (offboardingData: Partial<Offboarding>) => {
    const response = await api.post('/offboardings', offboardingData);
    return response.data;
  }
);

export const updateOffboarding = createAsyncThunk(
  'offboarding/updateOffboarding',
  async ({ id, data }: { id: number; data: Partial<Offboarding> }) => {
    const response = await api.put(`/offboardings/${id}`, data);
    return response.data;
  }
);

export const completeOffboarding = createAsyncThunk(
  'offboarding/completeOffboarding',
  async (id: number) => {
    const response = await api.post(`/offboardings/${id}/complete`);
    return response.data;
  }
);

export const cancelOffboarding = createAsyncThunk(
  'offboarding/cancelOffboarding',
  async (id: number) => {
    const response = await api.post(`/offboardings/${id}/cancel`);
    return response.data;
  }
);

export const fetchOffboardingStats = createAsyncThunk(
  'offboarding/fetchOffboardingStats',
  async () => {
    const response = await api.get('/offboardings/stats');
    return response.data;
  }
);

const offboardingSlice = createSlice({
  name: 'offboarding',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedOffboarding: (state) => {
      state.selectedOffboarding = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch offboardings
      .addCase(fetchOffboardings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffboardings.fulfilled, (state, action) => {
        state.loading = false;
        state.offboardings = action.payload;
      })
      .addCase(fetchOffboardings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch offboardings';
      })
      
      // Fetch offboarding by ID
      .addCase(fetchOffboardingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffboardingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOffboarding = action.payload;
      })
      .addCase(fetchOffboardingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch offboarding';
      })
      
      // Create offboarding
      .addCase(createOffboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOffboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.offboardings.push(action.payload);
      })
      .addCase(createOffboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create offboarding';
      })
      
      // Update offboarding
      .addCase(updateOffboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOffboarding.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.offboardings.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.offboardings[index] = action.payload;
        }
        state.selectedOffboarding = action.payload;
      })
      .addCase(updateOffboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update offboarding';
      })
      
      // Complete offboarding
      .addCase(completeOffboarding.fulfilled, (state, action) => {
        const index = state.offboardings.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.offboardings[index] = action.payload;
        }
      })
      
      // Cancel offboarding
      .addCase(cancelOffboarding.fulfilled, (state, action) => {
        const index = state.offboardings.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.offboardings[index] = action.payload;
        }
      })
      
      // Fetch stats
      .addCase(fetchOffboardingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearSelectedOffboarding } = offboardingSlice.actions;
export default offboardingSlice.reducer;