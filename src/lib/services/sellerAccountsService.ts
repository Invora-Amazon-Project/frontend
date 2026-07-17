import { axiosInstance } from "../authService";

export interface SellerAccountRecord {
  id: string;
  seller_id: string;
  marketplace_id: string;
  is_active: boolean;
  created_at: string;
}

export async function getSellerAccounts(): Promise<SellerAccountRecord[]> {
  const res = await axiosInstance.get<SellerAccountRecord[]>("/seller-accounts");
  return res.data;
}

export async function getSellerAccount(id: string): Promise<SellerAccountRecord> {
  const res = await axiosInstance.get<SellerAccountRecord>(`/seller-accounts/${id}`);
  return res.data;
}

// NOTE: Intentionally excludes seller_id/marketplace_id — the backend's
// UpdateSellerAccountDto doesn't exclude them like it should, and changing
// marketplace_id can hit a unique-constraint bug that surfaces as a wrong
// error type. This client never sends either field, see Notion feedback.
export interface SellerAccountUpdatePayload {
  is_active?: boolean;
}

export async function updateSellerAccount(
  id: string,
  data: SellerAccountUpdatePayload
): Promise<SellerAccountRecord> {
  const res = await axiosInstance.patch<SellerAccountRecord>(`/seller-accounts/${id}`, data);
  return res.data;
}

export async function deleteSellerAccount(id: string): Promise<void> {
  await axiosInstance.delete(`/seller-accounts/${id}`);
}
