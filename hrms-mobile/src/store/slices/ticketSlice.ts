import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelfServiceTicket } from '@/types';

interface TicketState {
  tickets: SelfServiceTicket[];
  currentTicket: SelfServiceTicket | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
};

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<SelfServiceTicket[]>) => {
      state.tickets = action.payload;
    },
    setCurrentTicket: (state, action: PayloadAction<SelfServiceTicket | null>) => {
      state.currentTicket = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setTickets, setCurrentTicket, clearError } = ticketSlice.actions;
export default ticketSlice.reducer;

