import { axiosInstance } from "../authService";

export async function createOrderItem(data: { order_id: string; supplier_product_id: string; quantity: number }) {
  const res = await axiosInstance.post("/order-items", data);
  return res.data;
}

export async function getOrderItems(order_id: string) {
  const res = await axiosInstance.get(`/order-items/${order_id}`);
  return res.data;
}