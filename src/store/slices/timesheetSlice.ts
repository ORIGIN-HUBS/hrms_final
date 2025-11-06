import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Timesheet } from '@/types';

interface TimesheetState {
  timesheets: Timesheet[];
  currentTimesheet: Timesheet | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  timesheets: [],
  currentTimesheet: null,
  isLoading: false,
  error: null,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setTimesheets: (state, action: PayloadAction<Timesheet[]>) => {
      state.timesheets = action.payload;
    },
    setCurrentTimesheet: (state, action: PayloadAction<Timesheet | null>) => {
      state.currentTimesheet = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setTimesheets, setCurrentTimesheet, clearError } = timesheetSlice.actions;
export default timesheetSlice.reducer;

