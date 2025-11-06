import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import employeeSlice from './slices/employeeSlice';
import projectSlice from './slices/projectSlice';
import timesheetSlice from './slices/timesheetSlice';
import offboardingSlice from './slices/offboardingSlice';
import dashboardSlice from './slices/dashboardSlice';
import ticketSlice from './slices/ticketSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    employee: employeeSlice,
    project: projectSlice,
    timesheet: timesheetSlice,
    offboarding: offboardingSlice,
    dashboard: dashboardSlice,
    ticket: ticketSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;