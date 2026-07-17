import { axiosInstance } from "../authService";
import type { CanonicalProductRecord } from "./canonicalProductsService";

export type MatchStatus = "pending" | "confirmed" | "rejected";

export interface ListProductSummary {
  id: string;
  list_id: string;
  product_id: string | null;
  row_number: number;
  raw_title: string;
  raw_data_json: Record<string, string> | null;
  match_status: MatchStatus;
}

export interface AmazonMatchRecord {
  id: string;
  list_product_id: string;
  canonical_product_id: string;
  match_status: MatchStatus;
  confidence_score: number;
  matched_by: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  listProduct?: ListProductSummary;
  canonicalProduct?: CanonicalProductRecord;
}

export interface GetAmazonMatchesParams {
  page?: number;
  limit?: number;
  match_status?: MatchStatus;
}

export interface PaginatedAmazonMatches {
  data: AmazonMatchRecord[];
  total: number;
}

export async function getAmazonMatches(
  params: GetAmazonMatchesParams = {}
): Promise<PaginatedAmazonMatches> {
  const res = await axiosInstance.get<AmazonMatchRecord[] | { data: AmazonMatchRecord[]; total?: number }>(
    "/amazon-matches",
    { params }
  );

  if (Array.isArray(res.data)) {
    return { data: res.data, total: res.data.length };
  }
  return { data: res.data.data, total: res.data.total ?? res.data.data.length };
}

export async function updateAmazonMatch(
  id: string,
  data: { match_status?: MatchStatus; canonical_product_id?: string }
): Promise<AmazonMatchRecord> {
  const res = await axiosInstance.patch<AmazonMatchRecord>(`/amazon-matches/${id}`, data);
  return res.data;
}

export async function deleteAmazonMatch(id: string): Promise<void> {
  await axiosInstance.delete(`/amazon-matches/${id}`);
}
