import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { loginService, registerService, LoginPayload, RegisterPayload, AuthResponse } from "./authService";

interface AuthState {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk("auth/login", async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await loginService(payload);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk("auth/register", async (payload: RegisterPayload, { rejectWithValue }) => {
  try {
    return await registerService(payload);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user ?? null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user ?? null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;