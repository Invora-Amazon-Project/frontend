import { axiosInstance } from "../authService";

export async function createSupplier(data: { name: string; email?: string; website?: string; country?: string }) {
  const res = await axiosInstance.post("/suppliers", data);
  return res.data;
}

export async function getSuppliers() {
  const res = await axiosInstance.get("/suppliers");
  return res.data;
}