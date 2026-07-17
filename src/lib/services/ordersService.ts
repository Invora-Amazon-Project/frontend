import { axiosInstance } from "../authService";
import type { SupplierRecord } from "./suppliersService";

export type OrderStatus = "DRAFT" | "PENDING" | "COMPLETED" | "CANCELLED";

export interface OrderRecord {
  id: string;
  workspace_id: string;
  total_price: string;
  status: OrderStatus;
  created_at: string;
  supplier: SupplierRecord;
  user: { id: string; email: string };
  orderItems: { id: string; order_id: string; supplier_product_id: string; quantity: number; unit_price: string }[];
}

export interface CreateOrderPayload {
  workspace_id: string;
  supplier_id: string;
  status: OrderStatus;
  total_price?: number;
}

export async function createOrder(data: CreateOrderPayload): Promise<OrderRecord> {
  const res = await axiosInstance.post<OrderRecord>("/orders", data);
  return res.data;
}

export async function getOrders(workspace_id: string): Promise<OrderRecord[]> {
  const res = await axiosInstance.get<OrderRecord[]>("/orders", { params: { workspace_id } });
  return res.data;
}

export interface UpdateOrderPayload {
  supplier_id?: string;
  status?: OrderStatus;
}

export async function updateOrder(id: string, data: UpdateOrderPayload): Promise<OrderRecord> {
  const res = await axiosInstance.patch<OrderRecord>(`/orders/${id}`, data);
  return res.data;
}
