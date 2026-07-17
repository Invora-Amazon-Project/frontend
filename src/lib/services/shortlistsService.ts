import { axiosInstance } from "../authService";
import type { ProductRecord } from "./productsService";

export interface ShortlistRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ShortlistItemRecord {
  id: string;
  shortlist_id: string;
  product_id: string;
  added_at: string;
  product?: ProductRecord;
}

export interface ShortlistDetailRecord extends ShortlistRecord {
  items: ShortlistItemRecord[];
}

export async function getShortlists(): Promise<ShortlistRecord[]> {
  const res = await axiosInstance.get<ShortlistRecord[]>("/shortlists");
  return res.data;
}

export async function getShortlist(id: string): Promise<ShortlistDetailRecord> {
  const res = await axiosInstance.get<ShortlistDetailRecord>(`/shortlists/${id}`);
  return res.data;
}

// NOTE: POST /shortlists currently throws an uncaught Error (500) instead of a
// proper 403 when a user without an active/trial subscription hits the
// shortlist limit — see Notion feedback. We surface whatever message the
// backend sends (falls back to a generic message since a raw 500 has none).
export async function createShortlist(name: string): Promise<ShortlistRecord> {
  const res = await axiosInstance.post<ShortlistRecord>("/shortlists", { name });
  return res.data;
}

export async function updateShortlist(id: string, name: string): Promise<ShortlistRecord> {
  const res = await axiosInstance.patch<ShortlistRecord>(`/shortlists/${id}`, { name });
  return res.data;
}

export async function deleteShortlist(id: string): Promise<void> {
  await axiosInstance.delete(`/shortlists/${id}`);
}

export async function addShortlistItem(shortlistId: string, productId: string): Promise<ShortlistItemRecord> {
  const res = await axiosInstance.post<ShortlistItemRecord>(`/shortlists/${shortlistId}/items`, {
    product_id: productId,
  });
  return res.data;
}

// NOTE: backend doesn't check whether the item exists before deleting it —
// removing an already-removed item can throw an uncaught Prisma error (500)
// instead of a 404 — see Notion feedback.
export async function removeShortlistItem(shortlistId: string, productId: string): Promise<void> {
  await axiosInstance.delete(`/shortlists/${shortlistId}/items/${productId}`);
}
