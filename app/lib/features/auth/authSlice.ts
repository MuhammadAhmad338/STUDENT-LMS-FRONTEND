import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5053/api";

interface AuthState {
  user: { email: string; role: string } | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;

  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeAuthCookie() {
  if (typeof document === "undefined") return;

  document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
}

export const login = createAsyncThunk(
  "auth/login",
  async (
    payload: { email: string; password: string; role?: string },
    { rejectWithValue }
  ) => {
    const res = await fetch(`${API_URL}/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return rejectWithValue("Invalid email or password");

    const data = await res.json();
    const token = data.token ?? data.accessToken ?? data.jwt ?? null;

    if (!token) return rejectWithValue("Token not found in login response");

    setAuthCookie(token);

    return {
      email: payload.email,
      role: payload.role ?? "student",
    };
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    payload: {
      fullName: string;
      email: string;
      password: string;
      department?: string;
      role?: string;
    },
    { rejectWithValue }
  ) => {
    const res = await fetch(`${API_URL}/Auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return rejectWithValue("Registration failed");

    const data = await res.json();
    const token = data.token ?? data.accessToken ?? data.jwt ?? null;

    if (!token) return rejectWithValue("Token not found in signup response");

    setAuthCookie(token);

    return {
      email: payload.email,
      role: payload.role ?? "student",
    };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ email: string; role?: string }>
    ) => {
      state.user = {
        email: action.payload.email,
        role: action.payload.role ?? "student",
      };
      state.isAuthenticated = true;
      state.status = "idle";
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      removeAuthCookie();
    },
    setStatus: (state, action: PayloadAction<"idle" | "loading" | "failed">) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { loginSuccess, logout, setStatus } = authSlice.actions;
export default authSlice.reducer;