import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockOrder, type MockUser, type MockTransaction, type MockService, dbGet, dbSet } from "../mockData";
import { syncUserBalance } from "./authSlice";

interface OrdersState {
  orders: MockOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (userId: string, { rejectWithValue }) => {
    await delay();
    try {
      const orders = dbGet<MockOrder[]>("smm_orders");
      return orders.filter((o) => o.user_id === userId);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch orders");
    }
  }
);

export const placeOrder = createAsyncThunk(
  "orders/placeOrder",
  async (
    {
      userId,
      serviceId,
      link,
      quantity,
    }: {
      userId: string;
      serviceId: string;
      link: string;
      quantity: number;
    },
    { dispatch, rejectWithValue }
  ) => {
    await delay();
    
    // Read fresh DB states
    const users = dbGet<MockUser[]>("smm_users");
    const services = dbGet<MockService[]>("smm_services");
    const orders = dbGet<MockOrder[]>("smm_orders");
    const transactions = dbGet<MockTransaction[]>("smm_transactions");

    const userIdx = users.findIndex((u) => u.id === userId);
    if (userIdx === -1) return rejectWithValue("User not found.");

    const user = users[userIdx];
    const service = services.find((s) => s.id === serviceId);

    if (!service) return rejectWithValue("Selected service was not found.");
    if (!link.trim()) return rejectWithValue("Target link / URL is required.");
    if (quantity < service.min_qty) return rejectWithValue(`Minimum quantity is ${service.min_qty}.`);
    if (quantity > service.max_qty) return rejectWithValue(`Maximum quantity is ${service.max_qty}.`);

    const orderPrice = Number(((quantity / 1000) * service.rate).toFixed(2));

    if (user.balance < orderPrice) {
      return rejectWithValue("Insufficient wallet balance. Please add funds to proceed.");
    }

    // Deduct user balance
    const oldBalance = user.balance;
    const newBalance = Number((oldBalance - orderPrice).toFixed(2));
    users[userIdx].balance = newBalance;
    dbSet("smm_users", users);

    // Create Order
    const newOrder: MockOrder = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: userId,
      service_id: serviceId,
      link,
      quantity,
      start_count: 0,
      remains: quantity,
      status: "pending",
      price: orderPrice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.unshift(newOrder); // Add to beginning
    dbSet("smm_orders", orders);

    // Create Debit Transaction
    const newTx: MockTransaction = {
      id: `tx-${Math.floor(100 + Math.random() * 900)}`,
      user_id: userId,
      type: "debit",
      amount: orderPrice,
      balance_after: newBalance,
      description: `Paid for Order #${newOrder.id} (${service.name})`,
      reference_id: newOrder.id,
      status: "success",
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    dbSet("smm_transactions", transactions);

    // Sync state balance in UI navbar
    dispatch(syncUserBalance(newBalance));

    return newOrder;
  }
);

export const cancelPendingOrder = createAsyncThunk(
  "orders/cancel",
  async (orderId: string, { dispatch, rejectWithValue }) => {
    await delay();
    const orders = dbGet<MockOrder[]>("smm_orders");
    const oIdx = orders.findIndex((o) => o.id === orderId);
    if (oIdx === -1) return rejectWithValue("Order not found.");

    const order = orders[oIdx];
    if (order.status !== "pending") {
      return rejectWithValue("Only pending orders can be cancelled.");
    }

    orders[oIdx].status = "cancelled";
    orders[oIdx].updated_at = new Date().toISOString();
    dbSet("smm_orders", orders);

    // Refund user
    const users = dbGet<MockUser[]>("smm_users");
    const uIdx = users.findIndex((u) => u.id === order.user_id);
    if (uIdx !== -1) {
      const newBal = Number((users[uIdx].balance + order.price).toFixed(2));
      users[uIdx].balance = newBal;
      dbSet("smm_users", users);

      // Create credit refund tx
      const transactions = dbGet<MockTransaction[]>("smm_transactions");
      const newTx: MockTransaction = {
        id: `tx-${Math.floor(100 + Math.random() * 900)}`,
        user_id: order.user_id,
        type: "credit",
        amount: order.price,
        balance_after: newBal,
        description: `Refund for Cancelled Order #${order.id}`,
        reference_id: order.id,
        status: "success",
        created_at: new Date().toISOString(),
      };
      transactions.unshift(newTx);
      dbSet("smm_transactions", transactions);

      dispatch(syncUserBalance(newBal));
    }

    return orderId;
  }
);

export const requestRefill = createAsyncThunk(
  "orders/refill",
  async (orderId: string, { rejectWithValue }) => {
    await delay();
    const orders = dbGet<MockOrder[]>("smm_orders");
    const order = orders.find((o) => o.id === orderId);
    if (!order) return rejectWithValue("Order not found.");
    if (order.status !== "completed") {
      return rejectWithValue("Only completed orders can be refilled.");
    }

    // Mark as refilling (simulated status update in logs)
    order.status = "in_progress";
    order.updated_at = new Date().toISOString();
    dbSet("smm_orders", orders);
    return order;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action: PayloadAction<MockOrder[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<MockOrder>) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelPendingOrder.fulfilled, (state, action: PayloadAction<string>) => {
        const order = state.orders.find((o) => o.id === action.payload);
        if (order) {
          order.status = "cancelled";
        }
      })
      .addCase(requestRefill.fulfilled, (state, action: PayloadAction<MockOrder>) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
      });
  },
});

export default ordersSlice.reducer;
