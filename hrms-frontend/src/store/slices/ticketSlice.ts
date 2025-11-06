import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Ticket {
  id?: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
};

export const fetchTickets = createAsyncThunk(
  'ticket/fetchTickets',
  async () => {
    const response = await api.get('/tickets');
    return response.data;
  }
);

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.tickets = action.payload;
      });
  },
});

export default ticketSlice.reducer;