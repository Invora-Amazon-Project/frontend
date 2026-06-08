import { axiosInstance } from "../authService";

export async function createOrder(data: { workspace_id: string; supplier_id: string }) {
  const res = await axiosInstance.post("/orders", data);
  return res.data;
}

export async function getOrders() {
  const res = await axiosInstance.get("/orders");
  return res.data;
}