import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockTicket, type MockTicketMessage, dbGet, dbSet } from "../mockData";

interface SupportState {
  tickets: MockTicket[];
  currentTicket: MockTicket | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
};

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export const fetchUserTickets = createAsyncThunk(
  "support/fetchUserTickets",
  async (userId: string, { rejectWithValue }) => {
    await delay();
    try {
      const tickets = dbGet<MockTicket[]>("smm_tickets");
      return tickets.filter((t) => t.user_id === userId);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load tickets");
    }
  }
);

export const createTicket = createAsyncThunk(
  "support/createTicket",
  async (
    {
      userId,
      userName,
      subject,
      category,
      message,
    }: {
      userId: string;
      userName: string;
      subject: string;
      category: "order_issue" | "payment" | "general";
      message: string;
    },
    { rejectWithValue }
  ) => {
    await delay();
    if (!subject.trim()) return rejectWithValue("Subject is required.");
    if (!message.trim()) return rejectWithValue("Message description is required.");

    try {
      const tickets = dbGet<MockTicket[]>("smm_tickets");
      const newTicket: MockTicket = {
        id: `tkt-${Math.floor(200 + Math.random() * 800)}`,
        user_id: userId,
        subject,
        category,
        status: "open",
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        messages: [
          {
            id: `msg-${Math.random().toString(36).substring(2, 9)}`,
            ticket_id: "", // filled below
            sender_type: "user",
            sender_name: userName,
            message,
            created_at: new Date().toISOString(),
          },
        ],
      };
      
      newTicket.messages[0].ticket_id = newTicket.id;
      tickets.unshift(newTicket);
      dbSet("smm_tickets", tickets);

      return newTicket;
    } catch (err: any) {
      return rejectWithValue("Failed to create ticket.");
    }
  }
);

export const replyToTicket = createAsyncThunk(
  "support/reply",
  async (
    {
      ticketId,
      senderType,
      senderName,
      message,
    }: {
      ticketId: string;
      senderType: "user" | "admin";
      senderName: string;
      message: string;
    },
    { rejectWithValue }
  ) => {
    await delay();
    if (!message.trim()) return rejectWithValue("Message cannot be empty.");

    try {
      const tickets = dbGet<MockTicket[]>("smm_tickets");
      const idx = tickets.findIndex((t) => t.id === ticketId);
      if (idx === -1) return rejectWithValue("Ticket not found.");

      const newMsg: MockTicketMessage = {
        id: `msg-${Math.random().toString(36).substring(2, 9)}`,
        ticket_id: ticketId,
        sender_type: senderType,
        sender_name: senderName,
        message,
        created_at: new Date().toISOString(),
      };

      tickets[idx].messages.push(newMsg);
      tickets[idx].status = senderType === "admin" ? "replied" : "open";
      tickets[idx].last_updated = new Date().toISOString();
      dbSet("smm_tickets", tickets);

      return tickets[idx];
    } catch (err: any) {
      return rejectWithValue("Failed to reply.");
    }
  }
);


export const fetchTickets = createAsyncThunk(
  "support/fetchAll",
  async (_, { rejectWithValue }) => {
    await delay();
    try {
      return dbGet<MockTicket[]>("smm_tickets");
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load all tickets");
    }
  }
);

export const closeTicket = createAsyncThunk(
  "support/close",
  async (ticketId: string, { rejectWithValue }) => {
    await delay();
    try {
      const tickets = dbGet<MockTicket[]>("smm_tickets");
      const idx = tickets.findIndex((t) => t.id === ticketId);
      if (idx === -1) return rejectWithValue("Ticket not found.");

      tickets[idx].status = "closed";
      tickets[idx].last_updated = new Date().toISOString();
      dbSet("smm_tickets", tickets);

      return tickets[idx];
    } catch (err: any) {
      return rejectWithValue("Failed to close ticket.");
    }
  }
);
export const resolveTicket = closeTicket;

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    setCurrentTicket: (state, action: PayloadAction<MockTicket | null>) => {
      state.currentTicket = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<MockTicket[]>) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action: PayloadAction<MockTicket[]>) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<MockTicket>) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(replyToTicket.fulfilled, (state, action: PayloadAction<MockTicket>) => {
        const idx = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.tickets[idx] = action.payload;
        }
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(closeTicket.fulfilled, (state, action: PayloadAction<MockTicket>) => {
        const idx = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.tickets[idx] = action.payload;
        }
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      });
  },
});

export const { setCurrentTicket } = supportSlice.actions;
export default supportSlice.reducer;
