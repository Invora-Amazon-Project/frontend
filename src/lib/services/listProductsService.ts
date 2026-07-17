import { axiosInstance } from "../authService";
import type { ProductRecord } from "./productsService";

export type ListProductMatchStatus =
  | "PENDING"
  | "AUTO_MATCHED"
  | "MANUALLY_MATCHED"
  | "REJECTED"
  | "NEEDS_REVIEW";

export interface ListProductMatch {
  id: string;
  list_product_id: string;
  canonical_product_id: string;
  match_status: ListProductMatchStatus;
  confidence_score: number | null;
  matched_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListProductRecord {
  id: string;
  list_id: string;
  product_id: string | null;
  row_number: number;
  raw_title: string;
  raw_data_json: Record<string, unknown> | null;
  match_status: ListProductMatchStatus;
  product: ProductRecord | null;
  matches: ListProductMatch[];
}

export async function getListProducts(list_id: string): Promise<ListProductRecord[]> {
  const res = await axiosInstance.get<ListProductRecord[]>(`/list-products/${list_id}`);
  return res.data;
}

export interface CreateListProductPayload {
  list_id: string;
  product_id?: string;
  row_number: number;
  raw_title: string;
  raw_data_json: Record<string, unknown>;
  match_status: ListProductMatchStatus;
}

export async function createListProduct(data: CreateListProductPayload): Promise<ListProductRecord> {
  const res = await axiosInstance.post<ListProductRecord>("/list-products", data);
  return res.data;
}
