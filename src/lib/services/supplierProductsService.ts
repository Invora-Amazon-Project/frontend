import { axiosInstance } from "../authService";
import type { ProductRecord } from "./productsService";

export interface SupplierProductPayload {
  supplier_id: string;
  product_id: string;
  supplier_sku?: string;
  cost_price: number;
  currency: string;
  stock: number;
  moq: number;
  shipping_cost?: number;
}

export interface SupplierProductRecord {
  id: string;
  supplier_id: string;
  product_id: string;
  supplier_sku: string | null;
  cost_price: string;
  currency: string;
  stock: number;
  moq: number;
  shipping_cost: string | null;
  created_at: string;
  updated_at: string;
  supplier?: { id: string; name: string };
  product?: ProductRecord;
}

export async function createSupplierProduct(
  data: SupplierProductPayload,
  workspace_id: string
): Promise<SupplierProductRecord> {
  const res = await axiosInstance.post<SupplierProductRecord>("/supplier-products", data, {
    params: { workspace_id },
  });
  return res.data;
}

export async function getSupplierProducts(
  workspace_id: string,
  params?: { page?: number; limit?: number }
): Promise<SupplierProductRecord[]> {
  const res = await axiosInstance.get<SupplierProductRecord[]>("/supplier-products", {
    params: { workspace_id, ...params },
  });
  return res.data;
}

// Intentionally excludes supplier_id/product_id: the backend doesn't validate
// those FKs on update (open bug, see Notion), so this client only ever edits
// the commercial fields on an existing supplier-product link.
export interface SupplierProductUpdatePayload {
  supplier_sku?: string;
  cost_price?: number;
  currency?: string;
  stock?: number;
  moq?: number;
  shipping_cost?: number;
}

export async function updateSupplierProduct(
  id: string,
  data: SupplierProductUpdatePayload,
  workspace_id: string
): Promise<SupplierProductRecord> {
  const res = await axiosInstance.patch<SupplierProductRecord>(`/supplier-products/${id}`, data, {
    params: { workspace_id },
  });
  return res.data;
}
