import { axiosInstance } from "../authService";

export async function createProduct(data: { asin?: string; upc?: string; brand?: string }) {
  const res = await axiosInstance.post("/products", data);
  return res.data;
}

export async function getProducts() {
  const res = await axiosInstance.get("/products");
  return res.data;
}

export async function getProductById(id: string) {
  const res = await axiosInstance.get(`/products/${id}`);
  return res.data;
}