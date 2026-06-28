import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockOrder, type MockService, dbGet } from "../mockData";
import { supabase } from "../../utils/supabase";
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

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as MockOrder[];
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
    try {
      // 1. Fetch fresh user profile
      const { data: profile, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (userError || !profile) return rejectWithValue("User not found.");

      // 2. Fetch fresh service details from frontend / local storage
      const services = dbGet<MockService[]>("smm_services");
      const service = services.find((s) => s.id === serviceId);
      if (!service) return rejectWithValue("Selected service was not found.");

      // Validation checks
      if (!link.trim()) return rejectWithValue("Target link / URL is required.");
      if (quantity < service.min_qty) return rejectWithValue(`Minimum quantity is ${service.min_qty}.`);
      if (quantity > service.max_qty) return rejectWithValue(`Maximum quantity is ${service.max_qty}.`);

      const orderPrice = Number(((quantity / 1000) * service.rate).toFixed(2));

      // if (Number(profile.balance) < orderPrice) {
      //   return rejectWithValue("Insufficient wallet balance. Please add funds to proceed.");
      // }

      const newBalance = Number((Number(profile.balance) - orderPrice).toFixed(2));

      // 3. Place order via SMMXPERT external API
      let providerOrderId = `ord-${Math.floor(10000 + Math.random() * 90000)}`;
      const apiKey = import.meta.env.VITE_SMMXPERT_API_KEY;

      if (apiKey && apiKey !== "YOUR_SMMXPERT_API_KEY") {
        try {
          const params = new URLSearchParams();
          params.append("key", apiKey);
          params.append("action", "add");
          params.append("service", serviceId);
          params.append("url", link);
          params.append("quantity", String(quantity));

          const apiResponse = await fetch("https://smmxpert.com/api/v2", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
          });

          const apiResult = await apiResponse.json();
          if (apiResult && apiResult.error) {
            return rejectWithValue(`API Provider Error: ${apiResult.error}`);
          }
          if (apiResult && apiResult.order) {
            providerOrderId = String(apiResult.order);
          }
        } catch (err: any) {
          return rejectWithValue(`Failed to contact SMM provider: ${err.message || err}`);
        }
      } else {
        console.warn("VITE_SMMXPERT_API_KEY is not configured. Using mock order ID fallback.");
      }

      // 4. Deduct user balance in Database
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId);
      if (balanceError) throw balanceError;

      // 5. Create Order record
      const newOrder = {
        id: providerOrderId,
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

      const { error: orderInsertError } = await supabase
        .from("orders")
        .insert(newOrder);
      if (orderInsertError) throw orderInsertError;

      // 5. Create Debit Transaction record
      const txId = `tx-${Math.floor(100 + Math.random() * 900)}`;
      const newTx = {
        id: txId,
        user_id: userId,
        type: "debit",
        amount: orderPrice,
        balance_after: newBalance,
        description: `Paid for Order #${providerOrderId} (${service.name})`,
        reference_id: providerOrderId,
        status: "success",
        created_at: new Date().toISOString(),
      };

      const { error: txInsertError } = await supabase
        .from("transactions")
        .insert(newTx);
      if (txInsertError) throw txInsertError;

      // Sync user balance in client-side state
      dispatch(syncUserBalance(newBalance));

      return newOrder as MockOrder;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to place order.");
    }
  }
);

export const cancelPendingOrder = createAsyncThunk(
  "orders/cancel",
  async (orderId: string, { dispatch, rejectWithValue }) => {
    try {
      // 1. Fetch fresh order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      if (orderError || !order) return rejectWithValue("Order not found.");

      if (order.status !== "pending") {
        return rejectWithValue("Only pending orders can be cancelled.");
      }

      // 2. Fetch fresh profile for refund
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", order.user_id)
        .single();
      if (profileError || !profile) return rejectWithValue("User profile not found.");

      const newBalance = Number((Number(profile.balance) + Number(order.price)).toFixed(2));

      // 3. Update order status to cancelled
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (updateOrderError) throw updateOrderError;

      // 4. Refund balance in DB
      const { error: refundError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", order.user_id);
      if (refundError) throw refundError;

      // 5. Create refund transaction log
      const txId = `tx-${Math.floor(100 + Math.random() * 900)}`;
      const newTx = {
        id: txId,
        user_id: order.user_id,
        type: "credit",
        amount: Number(order.price),
        balance_after: newBalance,
        description: `Refund for Cancelled Order #${orderId}`,
        reference_id: orderId,
        status: "success",
        created_at: new Date().toISOString(),
      };

      const { error: txError } = await supabase
        .from("transactions")
        .insert(newTx);
      if (txError) throw txError;

      // Sync state balance in UI navbar
      dispatch(syncUserBalance(newBalance));

      return orderId;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to cancel order.");
    }
  }
);

export const requestRefill = createAsyncThunk(
  "orders/refill",
  async (orderId: string, { rejectWithValue }) => {
    try {
      // 1. Fetch order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      if (orderError || !order) return rejectWithValue("Order not found.");

      if (order.status !== "completed") {
        return rejectWithValue("Only completed orders can be refilled.");
      }

      // Mark as completed but simulate refill status by updating in-progress
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (updateError) throw updateError;

      return {
        ...order,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      } as MockOrder;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to request refill.");
    }
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
