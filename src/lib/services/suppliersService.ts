import { axiosInstance } from "../authService";

export interface SupplierPayload {
  workspace_id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  currency?: string;
  moq?: number;
  paymentTerms?: string;
  shippingTerms?: string;
  notes?: string;
}

export interface SupplierRecord {
  id: string;
  workspace_id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  currency: string | null;
  moq: number | null;
  paymentTerms: string | null;
  shippingTerms: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupplierStatistics {
  lastUploadedDate: string | null;
  matchedProducts: number;
  profitableProducts: number;
  totalOrders: number;
  averageRoi: number;
}

export interface SupplierDetail extends SupplierRecord {
  statistics: SupplierStatistics;
}

export async function getSuppliers(workspaceId: string): Promise<SupplierRecord[]> {
  const res = await axiosInstance.get<SupplierRecord[]>("/suppliers", {
    params: { workspace_id: workspaceId },
  });
  return res.data;
}

export async function getSupplier(id: string, workspaceId: string): Promise<SupplierDetail> {
  const res = await axiosInstance.get<SupplierDetail>(`/suppliers/${id}`, {
    params: { workspace_id: workspaceId },
  });
  return res.data;
}

export async function createSupplier(data: SupplierPayload): Promise<SupplierRecord> {
  const res = await axiosInstance.post<SupplierRecord>("/suppliers", data);
  return res.data;
}

export async function updateSupplier(
  id: string,
  data: Partial<SupplierPayload> & { workspace_id: string }
): Promise<SupplierRecord> {
  const res = await axiosInstance.patch<SupplierRecord>(`/suppliers/${id}`, data);
  return res.data;
}

export async function deleteSupplier(id: string, workspaceId: string): Promise<void> {
  await axiosInstance.delete(`/suppliers/${id}`, {
    params: { workspace_id: workspaceId },
  });
}
