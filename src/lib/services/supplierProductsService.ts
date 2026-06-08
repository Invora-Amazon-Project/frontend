import { axiosInstance } from "../authService";

export async function createSupplierProduct(data: { supplier_id: string; product_id: string; cost_price: number }) {
  const res = await axiosInstance.post("/supplier-products", data);
  return res.data;
}

export async function getSupplierProducts() {
  const res = await axiosInstance.get("/supplier-products");
  return res.data;
}