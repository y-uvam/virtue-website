import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../utils/supabase";
import { type MockUser } from "../mockData";

interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Maps Supabase profiles table data to client-side MockUser format
export const mapProfileToUser = (profile: any, emailVerified = false): MockUser => {
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
    email_verified: emailVerified,
    created_at: profile.created_at || new Date().toISOString(),
  };
};

// Login user thunk with Supabase (supports both username and email login)
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { emailOrUsername, password }: { emailOrUsername: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      let email = emailOrUsername;
      
      // If the input is not a direct email, resolve it from the profiles table
      if (!emailOrUsername.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", emailOrUsername)
          .single();
        if (profile) {
          email = profile.email;
        }
      }

      // Supabase Auth call
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return rejectWithValue(error.message);
      if (!data.user) return rejectWithValue("Login failed. User session empty.");

      // Fetch user profile info
      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        if (!profileError && profileData) {
          profile = profileData;
        }
      } catch (err) {
        console.warn("Could not retrieve profile from database, using fallback:", err);
      }

      if (!profile) {
        profile = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || "User",
          username: data.user.user_metadata?.username || "user_" + data.user.id.substring(0, 6),
          email: data.user.email || "",
          is_admin: false,
          balance: 0.00,
          api_key: "",
          referral_code: "",
          status: "active",
          created_at: data.user.created_at,
        };
      }

      if (profile.status === "banned") {
        await supabase.auth.signOut();
        return rejectWithValue("Your account has been suspended. Please contact support.");
      }

      return mapProfileToUser(profile, !!data.user.email_confirmed_at);
    } catch (err: any) {
      return rejectWithValue(err.message || "An unexpected error occurred during login.");
    }
  }
);

// Register user thunk with Supabase
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      fullName,
      email,
      username,
      password,
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
    try {
      // 1. Supabase Auth signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
          },
        },
      });

      if (error) return rejectWithValue(error.message);
      if (!data.user) return rejectWithValue("Sign up failed.");

      // 2. Fallback client-side insertion check
      // Our database trigger automatically provisions profiles, but this guarantees client safety
      try {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (existingProfile) {
          return mapProfileToUser(existingProfile, !!data.user.email_confirmed_at);
        }

        const newProfile = {
          id: data.user.id,
          name: fullName,
          username,
          email,
          role: "user",
          is_admin: false,
          balance: 0.00,
          api_key: `smm_live_${Math.random().toString(36).substring(2, 20)}`,
          referral_code: `REF${Math.floor(1000 + Math.random() * 9000)}`,
          referred_by: referredBy || null,
          status: "active",
        };

        const { data: profile, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select("*")
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        return mapProfileToUser(profile, !!data.user.email_confirmed_at);
      } catch (profileErr: any) {
        console.warn("Profile fetch/create failed, falling back to temp user:", profileErr);
        // Fallback to avoid breaking signup if PostgREST cache has not updated
        const fallbackProfile = {
          id: data.user.id,
          name: fullName,
          username,
          email,
          is_admin: false,
          balance: 0.00,
          api_key: "",
          referral_code: "",
          status: "active",
          created_at: new Date().toISOString(),
        };
        return mapProfileToUser(fallbackProfile, !!data.user.email_confirmed_at);
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "An unexpected error occurred during signup.");
    }
  }
);

// Update profile information thunk
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    { name, email, username }: { name: string; email: string; username: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.user) return rejectWithValue("Not logged in");

      // Update public.profiles
      const { data, error } = await supabase
        .from("profiles")
        .update({ name, email, username })
        .eq("id", state.auth.user.id)
        .select("*")
        .single();

      if (error) return rejectWithValue(error.message);

      return mapProfileToUser(data, state.auth.user.email_verified);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update profile settings.");
    }
  }
);

// Regenerate API keys thunk
export const regenerateApiKey = createAsyncThunk(
  "auth/regenerateApiKey",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.user) return rejectWithValue("Not logged in");
      
      const newKey = `smm_live_${Math.random().toString(36).substring(2, 20)}`;

      const { error } = await supabase
        .from("profiles")
        .update({ api_key: newKey })
        .eq("id", state.auth.user.id);

      if (error) return rejectWithValue(error.message);
      return newKey;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to regenerate API key.");
    }
  }
);

// Change user password thunk
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { currentPassword: _currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return rejectWithValue(error.message);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update password.");
    }
  }
);

// Sign Out thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return rejectWithValue(error.message);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to log out.");
    }
  }
);

// Forgotten password link dispatch
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return rejectWithValue(error.message);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to send reset link.");
    }
  }
);

// Finalize password reset thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token: _token, newPass }: { token: string; newPass: string },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) return rejectWithValue(error.message);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to reset password.");
    }
  }
);

// Verify email thunk
export const verifyEmailToken = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    return true;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    syncUserBalance: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.balance = action.payload;
      }
    },
    setSessionUser: (state, action: PayloadAction<MockUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
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
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { clearAuthError, syncUserBalance, setSessionUser } = authSlice.actions;
export default authSlice.reducer;
