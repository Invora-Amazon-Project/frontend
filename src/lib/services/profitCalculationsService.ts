import { axiosInstance } from "../authService";

export async function createProfitCalculation(data: { workspace_id: string; supplier_product_id: string }) {
  const res = await axiosInstance.post("/profit-calculations", data);
  return res.data;
}

export async function getProfitCalculations(workspace_id: string) {
  const res = await axiosInstance.get(`/profit-calculations/${workspace_id}`);
  return res.data;
}