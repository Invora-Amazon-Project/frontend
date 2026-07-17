import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  loginService,
  registerService,
  forgotPasswordService,
  resetPasswordService,
  logoutService,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from "./authService";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "./tokenStorage";

interface AuthState {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  forgotPasswordLoading: boolean;
  forgotPasswordError: string | null;
  forgotPasswordSuccess: boolean;
  resetPasswordLoading: boolean;
  resetPasswordError: string | null;
  resetPasswordSuccess: boolean;
}

const storedTokens = getStoredTokens();

const initialState: AuthState = {
  user: null,
  accessToken: storedTokens.accessToken,
  refreshToken: storedTokens.refreshToken,
  loading: false,
  error: null,
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
};

function extractErrorMessage(err: AxiosError<{ message?: string }>): string {
  return err.response?.data?.message ?? err.message;
}

export const login = createAsyncThunk("auth/login", async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await loginService(payload);
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
  }
});

export const register = createAsyncThunk("auth/register", async (payload: RegisterPayload, { rejectWithValue }) => {
  try {
    return await registerService(payload);
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      return await forgotPasswordService(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      await resetPasswordService(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err as AxiosError<{ message?: string }>));
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { dispatch, getState }) => {
  try {
    const refreshToken = (getState() as { auth: AuthState }).auth.refreshToken;
    if (refreshToken) {
      await logoutService({ refreshToken });
    }
  } finally {
    dispatch(logout());
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
      clearStoredTokens();
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      setStoredTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    clearError(state) {
      state.error = null;
    },
    clearForgotPasswordState(state) {
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    clearResetPasswordState(state) {
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
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
        setStoredTokens(action.payload.accessToken, action.payload.refreshToken);
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
        setStoredTokens(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload as string;
      });
  },
});

export const { logout, setTokens, clearError, clearForgotPasswordState, clearResetPasswordState } =
  authSlice.actions;
export default authSlice.reducer;