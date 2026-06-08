import { axiosInstance } from "../authService";

export async function createAmazonProductMetric(data: { product_id: string; marketplace: string; buybox_price: number }) {
  const res = await axiosInstance.post("/amazon-product-metrics", data);
  return res.data;
}

export async function getAmazonProductMetrics(product_id: string) {
  const res = await axiosInstance.get(`/amazon-product-metrics/${product_id}`);
  return res.data;
}