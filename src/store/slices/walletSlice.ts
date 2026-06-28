import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockTransaction } from "../mockData";
import { supabase } from "../../utils/supabase";
import { syncUserBalance } from "./authSlice";

interface WalletState {
  transactions: MockTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  transactions: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "wallet/fetchTransactions",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as MockTransaction[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load transactions");
    }
  }
);

export const addFunds = createAsyncThunk(
  "wallet/addFunds",
  async (
    {
      userId,
      amount,
      method,
    }: {
      userId: string;
      amount: number;
      method: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    if (amount < 100) return rejectWithValue("Minimum deposit is ₹100.");
    if (amount > 50000) return rejectWithValue("Maximum deposit is ₹50,000.");

    try {
      // 1. Fetch fresh profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId)
        .single();
      if (profileError || !profile) return rejectWithValue("User not found.");

      const newBalance = Number((Number(profile.balance) + amount).toFixed(2));

      // 2. Update balance in database
      const { error: balanceUpdateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId);
      if (balanceUpdateError) throw balanceUpdateError;

      // 3. Create transaction log in database
      const txId = `tx-${Math.floor(100 + Math.random() * 900)}`;
      const newTx = {
        id: txId,
        user_id: userId,
        type: "credit",
        amount,
        balance_after: newBalance,
        description: `Wallet recharge via ${method.toUpperCase()}`,
        reference_id: `pay_${method}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: "success",
        created_at: new Date().toISOString(),
      };

      const { error: txInsertError } = await supabase
        .from("transactions")
        .insert(newTx);
      if (txInsertError) throw txInsertError;

      // 4. Sync client state
      dispatch(syncUserBalance(newBalance));

      return newTx as MockTransaction;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to add funds.");
    }
  }
);

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<MockTransaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFunds.fulfilled, (state, action: PayloadAction<MockTransaction>) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default walletSlice.reducer;
