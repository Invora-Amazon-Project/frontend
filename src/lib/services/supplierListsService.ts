import { axiosInstance } from "../authService";

export type SupplierListStatus = "processing" | "completed" | "failed" | "partial";

export interface SupplierListRecord {
  id: string;
  supplier_id: string;
  workspace_id: string;
  uploaded_by_user_id: string;
  source_type: string;
  file_url: string | null;
  status: SupplierListStatus;
  is_current: boolean;
  uploaded_at: string;
  supplier?: { id: string; name: string };
}

export async function createSupplierList(data: { workspace_id: string }) {
  const res = await axiosInstance.post("/supplier-lists", data);
  return res.data;
}

export async function getSupplierLists(workspace_id: string): Promise<SupplierListRecord[]> {
  const res = await axiosInstance.get<SupplierListRecord[]>(`/supplier-lists/${workspace_id}`);
  return res.data;
}

export async function getCurrentSupplierList(
  workspace_id: string,
  supplier_id: string
): Promise<SupplierListRecord | null> {
  const res = await axiosInstance.get<SupplierListRecord | null>(
    `/supplier-lists/${workspace_id}/current/${supplier_id}`
  );
  return res.data;
}

export async function deleteSupplierList(id: string, workspace_id: string): Promise<void> {
  await axiosInstance.delete(`/supplier-lists/${id}`, { params: { workspace_id } });
}

export interface ColumnMappingEntry {
  originalColumn: string;
  mappedField: string;
  confidence?: "high" | "low";
}

export interface SupplierListPreview {
  totalRows: number;
  headers: string[];
  preview: Record<string, string>[];
  mapping: ColumnMappingEntry[];
  validation?: { isValid: boolean; missingRequired: string[]; missingOneOf: string[] };
}

export async function previewSupplierList(file: File): Promise<SupplierListPreview> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post<SupplierListPreview>("/supplier-lists/preview", formData);
  return res.data;
}

export interface SupplierListImportResult {
  success: boolean;
  message: string;
  listId: string;
  status: SupplierListStatus;
}

export async function importSupplierList(params: {
  file: File;
  workspace_id: string;
  supplier_id: string;
  mapping: { originalColumn: string; mappedField: string }[];
}): Promise<SupplierListImportResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("workspace_id", params.workspace_id);
  formData.append("supplier_id", params.supplier_id);
  formData.append("mapping", JSON.stringify(params.mapping));
  const res = await axiosInstance.post<SupplierListImportResult>("/supplier-lists/import", formData);
  return res.data;
}
