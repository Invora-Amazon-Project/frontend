import { axiosInstance } from "../authService";

export interface ProductPayload {
  asin: string;
  upc?: string;
  ean?: string;
  brand?: string;
  model_number?: string;
  amazon_title?: string;
  image_url?: string;
  category?: string;
}

export interface ProductRecord {
  id: string;
  asin: string;
  upc: string | null;
  ean: string | null;
  brand: string | null;
  model_number: string | null;
  amazon_title: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export async function createProduct(data: ProductPayload): Promise<ProductRecord> {
  const res = await axiosInstance.post<ProductRecord>("/products", data);
  return res.data;
}

export interface ProductListResponse {
  data: ProductRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  brand?: string;
  category?: string;
}): Promise<ProductListResponse> {
  const res = await axiosInstance.get<ProductListResponse>("/products", { params });
  return res.data;
}

export async function getProductById(id: string): Promise<ProductRecord> {
  const res = await axiosInstance.get<ProductRecord>(`/products/${id}`);
  return res.data;
}

export type ProductUpdatePayload = Partial<ProductPayload>;

export async function updateProduct(id: string, data: ProductUpdatePayload): Promise<ProductRecord> {
  const res = await axiosInstance.patch<ProductRecord>(`/products/${id}`, data);
  return res.data;
}