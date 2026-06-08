import { axiosInstance } from "../authService";

export async function createSupplierList(data: { workspace_id: string }) {
  const res = await axiosInstance.post("/supplier-lists", data);
  return res.data;
}

export async function getSupplierLists(workspace_id: string) {
  const res = await axiosInstance.get(`/supplier-lists/${workspace_id}`);
  return res.data;
}