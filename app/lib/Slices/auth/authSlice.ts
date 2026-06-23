import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5053/api";

interface AuthState {
  user: { email: string; role: string; id?: number } | null;
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
    try {
      const res = await axios.post(`${API_URL}/Auth/login`, payload);

      const data = res.data;
      const token = data.token ?? data.accessToken ?? data.jwt ?? null;
      const rawUserId =
        data.userId ??
        data.id ??
        data.studentId ??
        data.user?.id ??
        data.user?.studentId ??
        null;
      const parsedUserId = rawUserId != null ? Number(rawUserId) : NaN;
      const userId = Number.isFinite(parsedUserId) ? parsedUserId : undefined;

      if (!token) {
        return rejectWithValue("Token not found in login response");
      }

      setAuthCookie(token);

      return {
        email: payload.email,
        role: payload.role ?? "student",
        id: userId
      };
    } catch (error) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Invalid email or password"
          : "Invalid email or password"
      );
    }
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
    try {
      const res = await axios.post(`${API_URL}/Auth/signup`, payload, {
        timeout: 10000,
      });

      const data = res.data;
      let token = data.token ?? data.accessToken ?? data.jwt ?? null;
      let rawUserId =
        data.userId ??
        data.id ??
        data.studentId ??
        data.user?.id ??
        data.user?.studentId ??
        null;

      // If the backend doesn't return a login token on signup, perform an automatic background login call
      if (!token) {
        try {
          const loginRes = await axios.post(`${API_URL}/Auth/login`, {
            email: payload.email,
            password: payload.password,
            role: payload.role ?? "Student",
          });
          const loginData = loginRes.data;
          token = loginData.token ?? loginData.accessToken ?? loginData.jwt ?? null;
          rawUserId =
            loginData.userId ??
            loginData.id ??
            loginData.studentId ??
            loginData.user?.id ??
            loginData.user?.studentId ??
            null;
        } catch (loginErr) {
          return rejectWithValue("Signup succeeded, but automatic login failed. Please sign in manually.");
        }
      }

      const parsedUserId = rawUserId != null ? Number(rawUserId) : NaN;
      const userId = Number.isFinite(parsedUserId) ? parsedUserId : undefined;

      if (!token) {
        return rejectWithValue("Token not found in authentication response");
      }

      setAuthCookie(token);

      return {
        email: payload.email,
        role: payload.role ?? "student",
        id: userId,
      };
    } catch (error) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Registration failed"
          : "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ email: string; role?: string; id?: number }>
    ) => {
      state.user = {
        email: action.payload.email,
        role: action.payload.role ?? "student",
        id: action.payload.id,
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