import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  type MockUser,
  type MockOrder,
  type MockTransaction,
  type MockTicket,
  type MockSettings,
  dbGet,
} from "../mockData";
import { supabase } from "../../utils/supabase";

interface AdminState {
  users: MockUser[];
  orders: MockOrder[];
  transactions: MockTransaction[];
  tickets: MockTicket[];
  settings: MockSettings | null;
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
  settings: null,
  stats: null,
  loading: false,
  error: null,
};

const mapProfileToUser = (profile: any): MockUser => {
  const isAdmin = !!profile.is_admin;
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    email: profile.email,
    isAdmin,
    role: isAdmin ? "admin" : "user",
    balance: Number(profile.balance || 0),
    api_key: profile.api_key || "",
    referral_code: profile.referral_code || "",
    referred_by: profile.referred_by || undefined,
    status: profile.status || "active",
    email_verified: true, // admin assumes verified
    created_at: profile.created_at || new Date().toISOString(),
  };
};

const sortTicketMessages = (tickets: any[]): MockTicket[] => {
  return tickets.map((t) => ({
    ...t,
    messages: (t.messages || []).sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  })) as MockTicket[];
};

export const fetchAdminData = createAsyncThunk(
  "admin/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Fetch profiles
      const { data: rawProfiles, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (userError) throw userError;
      const users = (rawProfiles || []).map(mapProfileToUser);

      // 2. Fetch orders
      const { data: rawOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderError) throw orderError;
      const orders = (rawOrders || []) as MockOrder[];

      // 3. Fetch transactions
      const { data: rawTransactions, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (txError) throw txError;
      const transactions = (rawTransactions || []) as MockTransaction[];

      // 4. Fetch tickets with messages
      const { data: rawTickets, error: ticketError } = await supabase
        .from("tickets")
        .select("*, messages:ticket_messages(*)")
        .order("last_updated", { ascending: false });
      if (ticketError) throw ticketError;
      const tickets = sortTicketMessages(rawTickets || []);

      // 5. Fetch site settings
      const { data: rawSettings, error: settingsError } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();
      
      let settings: MockSettings;
      if (settingsError || !rawSettings) {
        // Fallback default settings
        settings = {
          siteName: "Virtue",
          tagline: "Unbeatable Social Media Growth Supplier",
          contactEmail: "support@virtue.com",
          whatsappLink: "https://wa.me/1234567890",
          maintenanceMode: false,
          minOrderAmount: 100,
          registrationOpen: true,
          announcementBanner: "⚡ Mega Summer Sale: Get 10% bonus on all UPI/Crypto wallet deposits above ₹2000! ⚡",
          lowBalanceThreshold: 200,
        };
      } else {
        settings = {
          siteName: rawSettings.site_name,
          tagline: rawSettings.tagline,
          contactEmail: rawSettings.contact_email,
          whatsappLink: rawSettings.whatsapp_link,
          maintenanceMode: rawSettings.maintenance_mode,
          minOrderAmount: Number(rawSettings.min_order_amount),
          registrationOpen: rawSettings.registration_open,
          announcementBanner: rawSettings.announcement_banner,
          lowBalanceThreshold: Number(rawSettings.low_balance_threshold),
        };
      }

      // 6. Fetch services count from local storage
      const activeServicesCount = dbGet<any[]>("smm_services").filter(s => s.status === "active").length;

      // Compute statistics
      const totalUsers = users.filter((u) => u.role !== "admin").length;
      const totalOrdersToday = orders.length;
      const revenueToday = orders.reduce((sum, o) => sum + Number(o.price), 0);
      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const openTickets = tickets.filter((t) => t.status === "open").length;

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
          activeServices: activeServicesCount || 0,
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
    try {
      // 1. Fetch profile
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (fetchError || !profile) return rejectWithValue("User not found.");

      let newBal = Number(profile.balance);
      if (type === "add") {
        newBal = Number((newBal + amount).toFixed(2));
      } else {
        if (newBal < amount) return rejectWithValue("User balance is less than deduction amount.");
        newBal = Number((newBal - amount).toFixed(2));
      }

      // 2. Update balance in database
      const { error: balanceUpdateError } = await supabase
        .from("profiles")
        .update({ balance: newBal })
        .eq("id", userId);
      if (balanceUpdateError) throw balanceUpdateError;

      // 3. Create balance adjustment ledger transaction
      const txId = `tx-${Math.floor(100 + Math.random() * 900)}`;
      const newTx = {
        id: txId,
        user_id: userId,
        type: type === "add" ? "credit" : "debit",
        amount,
        balance_after: newBal,
        description: `Admin manual balance ${type === "add" ? "addition" : "deduction"}`,
        reference_id: "admin_manual",
        status: "success",
        created_at: new Date().toISOString(),
      };

      const { error: txInsertError } = await supabase
        .from("transactions")
        .insert(newTx);
      if (txInsertError) throw txInsertError;

      // 4. Fetch updated lists
      const { data: rawProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profilesError) throw profilesError;

      const { data: rawTransactions, error: txsError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (txsError) throw txsError;

      return {
        users: (rawProfiles || []).map(mapProfileToUser),
        transactions: (rawTransactions || []) as MockTransaction[],
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to adjust balance.");
    }
  }
);

export const adminToggleBanUser = createAsyncThunk(
  "admin/toggleBan",
  async (userId: string, { rejectWithValue }) => {
    try {
      // 1. Fetch user status
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", userId)
        .single();
      if (fetchError || !profile) return rejectWithValue("User not found.");

      const newStatus = profile.status === "active" ? "banned" : "active";

      // 2. Update status in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", userId);
      if (updateError) throw updateError;

      // 3. Retrieve all users
      const { data: rawProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profilesError) throw profilesError;

      return (rawProfiles || []).map(mapProfileToUser);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to toggle ban status.");
    }
  }
);

export const adminUpdateSettings = createAsyncThunk(
  "admin/updateSettings",
  async (settings: MockSettings, { rejectWithValue }) => {
    try {
      const dbSettings = {
        site_name: settings.siteName,
        tagline: settings.tagline,
        contact_email: settings.contactEmail,
        whatsapp_link: settings.whatsappLink,
        maintenance_mode: settings.maintenanceMode,
        min_order_amount: settings.minOrderAmount,
        registration_open: settings.registrationOpen,
        announcement_banner: settings.announcementBanner,
        low_balance_threshold: settings.lowBalanceThreshold,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: 1, ...dbSettings });
      if (error) throw error;

      return settings;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update site settings.");
    }
  }
);

export const adminUpdateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: MockOrder["status"] },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;

      const { data: rawOrders, error: orderFetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderFetchError) throw orderFetchError;

      return (rawOrders || []) as MockOrder[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update order status.");
    }
  }
);

export const adminBulkUpdateOrders = createAsyncThunk(
  "admin/bulkUpdateOrders",
  async (
    { orderIds, status }: { orderIds: string[]; status: MockOrder["status"] },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", orderIds);
      if (error) throw error;

      const { data: rawOrders, error: orderFetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderFetchError) throw orderFetchError;

      return (rawOrders || []) as MockOrder[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to bulk update orders.");
    }
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
