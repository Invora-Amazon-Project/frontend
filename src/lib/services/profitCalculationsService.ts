import { axiosInstance } from "../authService";
import type { SupplierProductRecord } from "./supplierProductsService";
import type { AmazonProductMetricRecord } from "./amazonProductMetricsService";

export interface ProfitCalculationRecord {
  id: string;
  supplier_product_id: string;
  amazon_metric_id: string;
  workspace_id: string;
  estimated_profit: string | null;
  roi: string | null;
  vat: string | null;
  customs: string | null;
  shipping_total: string | null;
  calculated_at: string;
  supplierProduct: SupplierProductRecord;
  amazonMetric: AmazonProductMetricRecord;
}

export interface CreateProfitCalculationPayload {
  supplier_product_id: string;
  amazon_metric_id: string;
  workspace_id: string;
  vat?: number;
  customs?: number;
  shipping_total?: number;
}

export async function createProfitCalculation(
  data: CreateProfitCalculationPayload
): Promise<ProfitCalculationRecord> {
  const res = await axiosInstance.post<ProfitCalculationRecord>("/profit-calculations", data);
  return res.data;
}

export async function getProfitCalculations(workspace_id: string): Promise<ProfitCalculationRecord[]> {
  const res = await axiosInstance.get<ProfitCalculationRecord[]>(`/profit-calculations/${workspace_id}`);
  return res.data;
}

export interface UpdateProfitCalculationPayload {
  vat?: number;
  customs?: number;
  shipping_total?: number;
}

export async function updateProfitCalculation(
  id: string,
  data: UpdateProfitCalculationPayload
): Promise<ProfitCalculationRecord> {
  const res = await axiosInstance.patch<ProfitCalculationRecord>(`/profit-calculations/${id}`, data);
  return res.data;
}
