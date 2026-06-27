import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockTransaction, type MockUser, dbGet, dbSet } from "../mockData";
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

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const fetchTransactions = createAsyncThunk(
  "wallet/fetchTransactions",
  async (userId: string, { rejectWithValue }) => {
    await delay();
    try {
      const transactions = dbGet<MockTransaction[]>("smm_transactions");
      return transactions.filter((tx) => tx.user_id === userId);
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
    await delay(1200); // slightly longer delay to simulate external Razorpay gateway callback
    
    if (amount < 100) return rejectWithValue("Minimum deposit is ₹100.");
    if (amount > 50000) return rejectWithValue("Maximum deposit is ₹50,000.");

    try {
      const users = dbGet<MockUser[]>("smm_users");
      const transactions = dbGet<MockTransaction[]>("smm_transactions");
      
      const uIdx = users.findIndex((u) => u.id === userId);
      if (uIdx === -1) return rejectWithValue("User not found.");

      const oldBalance = users[uIdx].balance;
      const newBalance = Number((oldBalance + amount).toFixed(2));
      users[uIdx].balance = newBalance;
      dbSet("smm_users", users);

      // Create transaction
      const newTx: MockTransaction = {
        id: `tx-${Math.floor(100 + Math.random() * 900)}`,
        user_id: userId,
        type: "credit",
        amount,
        balance_after: newBalance,
        description: `Wallet recharge via ${method.toUpperCase()}`,
        reference_id: `pay_${method}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: "success",
        created_at: new Date().toISOString(),
      };

      transactions.unshift(newTx);
      dbSet("smm_transactions", transactions);

      dispatch(syncUserBalance(newBalance));
      return newTx;
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
