import axios from "axios";

const BASE_URL = "https://backend-2n7w.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
  };
}

export async function loginService(payload: LoginPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>("/auth/login", payload);
  return res.data;
}

export async function registerService(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  ok: boolean;
  /** DEV ONLY: e-posta servisi entegre edilene kadar backend bunu doğrudan döner. */
  resetToken?: string;
}

export async function forgotPasswordService(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  const res = await axiosInstance.post<ForgotPasswordResponse>("/auth/forgot-password", payload);
  return res.data;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export async function resetPasswordService(payload: ResetPasswordPayload): Promise<void> {
  await axiosInstance.post("/auth/reset-password", payload);
}

export interface RefreshPayload {
  refreshToken: string;
}

export async function refreshTokenService(payload: RefreshPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>("/auth/refresh", payload);
  return res.data;
}

export interface LogoutPayload {
  refreshToken: string;
}

export async function logoutService(payload: LogoutPayload): Promise<void> {
  await axiosInstance.post("/auth/logout", payload);
}

export interface CurrentUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  default_marketplace: string | null;
  default_currency: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
}

export async function getMeService(): Promise<CurrentUser> {
  const res = await axiosInstance.get<CurrentUser>("/auth/me");
  return res.data;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  default_marketplace?: string;
  default_currency?: string;
}

export async function updateProfileService(
  payload: UpdateProfilePayload
): Promise<CurrentUser> {
  const res = await axiosInstance.patch<CurrentUser>("/auth/profile", payload);
  return res.data;
}
