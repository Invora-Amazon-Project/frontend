import { axiosInstance } from "../authService";

export interface CanonicalProductRecord {
  id: string;
  asin: string;
  title: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  marketplace: string;
  created_at: string;
  updated_at: string;
}

export interface CanonicalProductPayload {
  asin: string;
  title: string;
  brand?: string;
  category?: string;
  image_url?: string;
  marketplace: string;
}

export interface GetCanonicalProductsParams {
  page?: number;
  limit?: number;
}

export interface PaginatedCanonicalProducts {
  data: CanonicalProductRecord[];
  total: number;
}

export async function getCanonicalProducts(
  params: GetCanonicalProductsParams = {}
): Promise<PaginatedCanonicalProducts> {
  const res = await axiosInstance.get<
    CanonicalProductRecord[] | { data: CanonicalProductRecord[]; total?: number }
  >("/canonical-products", { params });

  if (Array.isArray(res.data)) {
    return { data: res.data, total: res.data.length };
  }
  return { data: res.data.data, total: res.data.total ?? res.data.data.length };
}

export async function getCanonicalProductById(id: string): Promise<CanonicalProductRecord> {
  const res = await axiosInstance.get<CanonicalProductRecord>(`/canonical-products/${id}`);
  return res.data;
}

export async function createCanonicalProduct(
  data: CanonicalProductPayload
): Promise<CanonicalProductRecord> {
  const res = await axiosInstance.post<CanonicalProductRecord>("/canonical-products", data);
  return res.data;
}

export async function updateCanonicalProduct(
  id: string,
  data: Partial<CanonicalProductPayload>
): Promise<CanonicalProductRecord> {
  const res = await axiosInstance.patch<CanonicalProductRecord>(`/canonical-products/${id}`, data);
  return res.data;
}

export async function deleteCanonicalProduct(id: string): Promise<void> {
  await axiosInstance.delete(`/canonical-products/${id}`);
}
