import { createSlice, createAsyncThunk,  } from "@reduxjs/toolkit";
import {
  type MockUser,
  type MockOrder,
  type MockTransaction,
  type MockTicket,
  type MockSettings,
  dbGet,
  dbSet,
  getSettings,
} from "../mockData";

interface AdminState {
  users: MockUser[];
  orders: MockOrder[];
  transactions: MockTransaction[];
  tickets: MockTicket[];
  settings: MockSettings;
  stats: {
    totalUsers: number;
    totalOrdersToday: number;
    revenueToday: number;
    pendingOrders: number;
    activeServices: number;
    openTickets: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  orders: [],
  transactions: [],
  tickets: [],
  settings: getSettings(),
  stats: null,
  loading: false,
  error: null,
};

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export const fetchAdminData = createAsyncThunk(
  "admin/fetchData",
  async (_, { rejectWithValue }) => {
    await delay();
    try {
      const users = dbGet<MockUser[]>("smm_users");
      const orders = dbGet<MockOrder[]>("smm_orders");
      const transactions = dbGet<MockTransaction[]>("smm_transactions");
      const tickets = dbGet<MockTicket[]>("smm_tickets");
      const settings = getSettings();

      // Compute statistics
      const totalUsers = users.filter(u => u.role !== "admin").length;
      const totalOrdersToday = orders.length; // simulation
      const revenueToday = orders.reduce((sum, o) => sum + o.price, 0); // simulated total
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const activeServices = dbGet<any[]>("smm_services").filter(s => s.status === "active").length;
      const openTickets = tickets.filter(t => t.status === "open").length;

      return {
        users,
        orders,
        transactions,
        tickets,
        settings,
        stats: {
          totalUsers,
          totalOrdersToday,
          revenueToday: Number(revenueToday.toFixed(2)),
          pendingOrders,
          activeServices,
          openTickets,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load admin panel data");
    }
  }
);

export const adminAdjustBalance = createAsyncThunk(
  "admin/adjustBalance",
  async (
    { userId, amount, type }: { userId: string; amount: number; type: "add" | "deduct" },
    { rejectWithValue }
  ) => {
    await delay();
    const users = dbGet<MockUser[]>("smm_users");
    const uIdx = users.findIndex((u) => u.id === userId);
    if (uIdx === -1) return rejectWithValue("User not found.");

    const user = users[uIdx];
    let newBal = user.balance;

    if (type === "add") {
      newBal = Number((newBal + amount).toFixed(2));
    } else {
      if (newBal < amount) return rejectWithValue("User balance is less than deduction amount.");
      newBal = Number((newBal - amount).toFixed(2));
    }

    users[uIdx].balance = newBal;
    dbSet("smm_users", users);

    // Create balance adjustment ledger transaction
    const transactions = dbGet<MockTransaction[]>("smm_transactions");
    const newTx: MockTransaction = {
      id: `tx-${Math.floor(100 + Math.random() * 900)}`,
      user_id: userId,
      type: type === "add" ? "credit" : "debit",
      amount,
      balance_after: newBal,
      description: `Admin manual balance ${type === "add" ? "addition" : "deduction"}`,
      reference_id: "admin_manual",
      status: "success",
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    dbSet("smm_transactions", transactions);

    return { users, transactions };
  }
);

export const adminToggleBanUser = createAsyncThunk(
  "admin/toggleBan",
  async (userId: string, { rejectWithValue }) => {
    await delay();
    const users = dbGet<MockUser[]>("smm_users");
    const uIdx = users.findIndex((u) => u.id === userId);
    if (uIdx === -1) return rejectWithValue("User not found.");

    users[uIdx].status = users[uIdx].status === "active" ? "banned" : "active";
    dbSet("smm_users", users);
    return users;
  }
);

export const adminUpdateSettings = createAsyncThunk(
  "admin/updateSettings",
  async (settings: MockSettings, { rejectWithValue }) => {
    await delay();
    dbSet("smm_settings", settings);
    return settings;
  }
);

export const adminUpdateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: MockOrder["status"] },
    { rejectWithValue }
  ) => {
    await delay();
    const orders = dbGet<MockOrder[]>("smm_orders");
    const oIdx = orders.findIndex((o) => o.id === orderId);
    if (oIdx === -1) return rejectWithValue("Order not found.");

    orders[oIdx].status = status;
    orders[oIdx].updated_at = new Date().toISOString();
    dbSet("smm_orders", orders);
    return orders;
  }
);

export const adminBulkUpdateOrders = createAsyncThunk(
  "admin/bulkUpdateOrders",
  async (
    { orderIds, status }: { orderIds: string[]; status: MockOrder["status"] },
    { rejectWithValue }
  ) => {
    await delay();
    const orders = dbGet<MockOrder[]>("smm_orders");
    orderIds.forEach((id) => {
      const oIdx = orders.findIndex((o) => o.id === id);
      if (oIdx !== -1) {
        orders[oIdx].status = status;
        orders[oIdx].updated_at = new Date().toISOString();
      }
    });
    dbSet("smm_orders", orders);
    return orders;
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.orders = action.payload.orders;
        state.transactions = action.payload.transactions;
        state.tickets = action.payload.tickets;
        state.settings = action.payload.settings;
        state.stats = action.payload.stats;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(adminAdjustBalance.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.transactions = action.payload.transactions;
      })
      .addCase(adminToggleBanUser.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(adminUpdateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(adminBulkUpdateOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export default adminSlice.reducer;
