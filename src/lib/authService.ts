import axios from "axios";

const BASE_URL = "https://backend-2n7w.onrender.com";

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

export async function forgotPasswordService(payload: ForgotPasswordPayload): Promise<void> {
  await axiosInstance.post("/auth/forgot-password", payload);
}