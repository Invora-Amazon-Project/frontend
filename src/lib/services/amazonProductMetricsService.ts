import { axiosInstance } from "../authService";

export interface AmazonProductMetricRecord {
  id: string;
  product_id: string;
  marketplace: string;
  buybox_price: number;
  amazon_fee: number;
  fba_fee: number;
  sales_rank: number;
  roi_snapshot: number;
  updated_at: string;
}

export interface AmazonProductMetricSnapshots {
  latest: AmazonProductMetricRecord | null;
  history: AmazonProductMetricRecord[];
}

export async function createAmazonProductMetric(data: {
  product_id: string;
  marketplace: string;
  buybox_price: number;
}): Promise<AmazonProductMetricRecord> {
  const res = await axiosInstance.post<AmazonProductMetricRecord>("/amazon-product-metrics", data);
  return res.data;
}

export async function getAmazonProductMetrics(product_id: string): Promise<AmazonProductMetricSnapshots> {
  const res = await axiosInstance.get<AmazonProductMetricSnapshots>(`/amazon-product-metrics/${product_id}`);
  return res.data;
}

// Intentionally excludes product_id: update() validates ownership via the
// *existing* metric's product_id but doesn't validate a new one if sent (open
// IDOR bug, see Notion), so this client never sends it.
export interface AmazonProductMetricUpdatePayload {
  marketplace?: string;
  buybox_price?: number;
  amazon_fee?: number;
  fba_fee?: number;
  sales_rank?: number;
}

export async function updateAmazonProductMetric(
  id: string,
  data: AmazonProductMetricUpdatePayload
): Promise<AmazonProductMetricRecord> {
  const res = await axiosInstance.patch<AmazonProductMetricRecord>(`/amazon-product-metrics/${id}`, data);
  return res.data;
}