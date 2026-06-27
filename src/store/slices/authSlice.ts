import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type MockUser, dbGet, dbSet, getActiveUser, setActiveUser } from "../mockData";

interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: getActiveUser(),
  isAuthenticated: !!getActiveUser(),
  loading: false,
  error: null,
};

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ emailOrUsername, password: _password }: { emailOrUsername: string; password: string }, { rejectWithValue }) => {
    await delay();
    const users = dbGet<MockUser[]>("smm_users");
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
          u.username.toLowerCase() === emailOrUsername.toLowerCase())
    );

    if (!user) {
      return rejectWithValue("Invalid credentials. Try 'user@smm.com' or 'admin@smm.com'.");
    }

    if (user.status === "banned") {
      return rejectWithValue("Your account has been suspended. Please contact support.");
    }

    // Simulate password validation (for mock purposes, we allow any password for initial user or admin)
    setActiveUser(user);
    return user;
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      fullName,
      email,
      username,
      password: _password,
      referredBy,
    }: {
      fullName: string;
      email: string;
      username: string;
      password: string;
      referredBy?: string;
    },
    { rejectWithValue }
  ) => {
    await delay();
    const users = dbGet<MockUser[]>("smm_users");
    
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return rejectWithValue("An account with this email address already exists.");
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return rejectWithValue("This username is already taken.");
    }

    const newUser: MockUser = {
      id: `u-${Math.random().toString(36).substring(2, 9)}`,
      name: fullName,
      email,
      username,
      role: "user",
      balance: 0.00,
      api_key: `smm_live_${Math.random().toString(36).substring(2, 20)}`,
      referral_code: `REF${Math.floor(1000 + Math.random() * 9000)}`,
      referred_by: referredBy || undefined,
      email_verified: false,
      status: "active",
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    dbSet("smm_users", users);
    
    // Automatically log in the user (or simulate sending verification email)
    setActiveUser(newUser);
    return newUser;
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ name, email, username }: { name: string; email: string; username: string }, { getState, rejectWithValue }) => {
    await delay();
    const state = getState() as { auth: AuthState };
    if (!state.auth.user) return rejectWithValue("Not logged in");

    const users = dbGet<MockUser[]>("smm_users");
    const userIdx = users.findIndex((u) => u.id === state.auth.user!.id);
    if (userIdx === -1) return rejectWithValue("User not found");

    // Check unique email/username
    const otherEmail = users.find((u) => u.id !== state.auth.user!.id && u.email.toLowerCase() === email.toLowerCase());
    if (otherEmail) return rejectWithValue("Email is already taken by another account.");

    const otherUsername = users.find((u) => u.id !== state.auth.user!.id && u.username.toLowerCase() === username.toLowerCase());
    if (otherUsername) return rejectWithValue("Username is already taken.");

    users[userIdx].name = name;
    users[userIdx].email = email;
    users[userIdx].username = username;

    dbSet("smm_users", users);
    setActiveUser(users[userIdx]);
    return users[userIdx];
  }
);

export const regenerateApiKey = createAsyncThunk(
  "auth/regenerateApiKey",
  async (_, { getState, rejectWithValue }) => {
    await delay();
    const state = getState() as { auth: AuthState };
    if (!state.auth.user) return rejectWithValue("Not logged in");

    const users = dbGet<MockUser[]>("smm_users");
    const userIdx = users.findIndex((u) => u.id === state.auth.user!.id);
    if (userIdx === -1) return rejectWithValue("User not found");

    const newKey = `smm_live_${Math.random().toString(36).substring(2, 20)}`;
    users[userIdx].api_key = newKey;

    dbSet("smm_users", users);
    setActiveUser(users[userIdx]);
    return newKey;
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    await delay();
    // Simulate updating password successfully
    return true;
  }
);

export const verifyEmailToken = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    await delay(1500); // give it slightly longer to feel like a real verification redirect
    if (token === "invalid" || token.includes("expired")) {
      return rejectWithValue("This verification token is invalid or has expired.");
    }
    return true;
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    await delay();
    const users = dbGet<MockUser[]>("smm_users");
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      return rejectWithValue("No account associated with this email address was found.");
    }
    return true;
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPass: _newPass }: { token: string; newPass: string }, { rejectWithValue }) => {
    await delay();
    if (token === "invalid" || token.includes("expired")) {
      return rejectWithValue("The password reset link is invalid or expired.");
    }
    return true;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      setActiveUser(null);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    syncUserBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.balance = action.payload;
        setActiveUser(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<MockUser>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<MockUser>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Profile updates
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<MockUser>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // API Key
      .addCase(regenerateApiKey.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.user) state.user.api_key = action.payload;
      });
  },
});

export const { logoutUser, clearAuthError, syncUserBalance } = authSlice.actions;
export default authSlice.reducer;
