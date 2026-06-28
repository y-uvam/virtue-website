import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockTicket, type MockTicketMessage } from "../mockData";
import { supabase } from "../../utils/supabase";

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

const sortTicketMessages = (tickets: any[]): MockTicket[] => {
  return tickets.map((t) => ({
    ...t,
    messages: (t.messages || []).sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  })) as MockTicket[];
};

export const fetchUserTickets = createAsyncThunk(
  "support/fetchUserTickets",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, messages:ticket_messages(*)")
        .eq("user_id", userId)
        .order("last_updated", { ascending: false });

      if (error) throw error;
      return sortTicketMessages(data || []);
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
    if (!subject.trim()) return rejectWithValue("Subject is required.");
    if (!message.trim()) return rejectWithValue("Message description is required.");

    try {
      const ticketId = `tkt-${Math.floor(200 + Math.random() * 800)}`;
      const newTicket = {
        id: ticketId,
        user_id: userId,
        subject,
        category,
        status: "open",
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      // 1. Create ticket
      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(newTicket);
      if (ticketError) throw ticketError;

      // 2. Create initial ticket message
      const initialMessage = {
        ticket_id: ticketId,
        sender_type: "user",
        sender_name: userName,
        message,
        created_at: new Date().toISOString(),
      };

      const { data: insertedMsgs, error: msgError } = await supabase
        .from("ticket_messages")
        .insert(initialMessage)
        .select();
      if (msgError) throw msgError;

      return {
        ...newTicket,
        messages: insertedMsgs || [],
      } as MockTicket;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create ticket.");
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
    if (!message.trim()) return rejectWithValue("Message cannot be empty.");

    try {
      // 1. Insert new message
      const newMsg = {
        ticket_id: ticketId,
        sender_type: senderType,
        sender_name: senderName,
        message,
        created_at: new Date().toISOString(),
      };

      const { error: msgInsertError } = await supabase
        .from("ticket_messages")
        .insert(newMsg);
      if (msgInsertError) throw msgInsertError;

      // 2. Update status and timestamp in tickets table
      const newStatus = senderType === "admin" ? "replied" : "open";
      const { error: ticketUpdateError } = await supabase
        .from("tickets")
        .update({ status: newStatus, last_updated: new Date().toISOString() })
        .eq("id", ticketId);
      if (ticketUpdateError) throw ticketUpdateError;

      // 3. Retrieve complete updated ticket
      const { data: ticket, error: fetchError } = await supabase
        .from("tickets")
        .select("*, messages:ticket_messages(*)")
        .eq("id", ticketId)
        .single();
      if (fetchError || !ticket) throw fetchError || new Error("Failed to load updated ticket");

      return sortTicketMessages([ticket])[0];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to reply.");
    }
  }
);

export const fetchTickets = createAsyncThunk(
  "support/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, messages:ticket_messages(*)")
        .order("last_updated", { ascending: false });

      if (error) throw error;
      return sortTicketMessages(data || []);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load all tickets");
    }
  }
);

export const closeTicket = createAsyncThunk(
  "support/close",
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: "closed", last_updated: new Date().toISOString() })
        .eq("id", ticketId);
      if (updateError) throw updateError;

      const { data: ticket, error: fetchError } = await supabase
        .from("tickets")
        .select("*, messages:ticket_messages(*)")
        .eq("id", ticketId)
        .single();
      if (fetchError || !ticket) throw fetchError || new Error("Failed to load ticket");

      return sortTicketMessages([ticket])[0];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to close ticket.");
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
