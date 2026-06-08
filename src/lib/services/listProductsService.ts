import { axiosInstance } from "../authService";

export async function createListProduct(data: { list_id: string; product_id: string }) {
  const res = await axiosInstance.post("/list-products", data);
  return res.data;
}

export async function getListProducts(list_id: string) {
  const res = await axiosInstance.get(`/list-products/${list_id}`);
  return res.data;
}