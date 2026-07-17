import { axiosInstance } from "../authService";
import type { SupplierProductRecord } from "./supplierProductsService";

export interface OrderItemRecord {
  id: string;
  order_id: string;
  supplier_product_id: string;
  quantity: number;
  unit_price: string;
  supplierProduct: SupplierProductRecord;
}

export interface OrderItemMutationResult {
  item: OrderItemRecord;
  order_total_price: string;
}

export interface CreateOrderItemPayload {
  order_id: string;
  supplier_product_id: string;
  quantity: number;
  unit_price: number;
}

export async function createOrderItem(data: CreateOrderItemPayload): Promise<OrderItemMutationResult> {
  const res = await axiosInstance.post<OrderItemMutationResult>("/order-items", data);
  return res.data;
}

export async function getOrderItems(order_id: string): Promise<OrderItemRecord[]> {
  const res = await axiosInstance.get<OrderItemRecord[]>(`/order-items/${order_id}`);
  return res.data;
}

export interface UpdateOrderItemPayload {
  supplier_product_id?: string;
  quantity?: number;
  unit_price?: number;
}

export async function updateOrderItem(id: string, data: UpdateOrderItemPayload): Promise<OrderItemMutationResult> {
  const res = await axiosInstance.patch<OrderItemMutationResult>(`/order-items/${id}`, data);
  return res.data;
}

export interface DeleteOrderItemResult {
  deletedItem: OrderItemRecord;
  order_total_price: string;
}

export async function deleteOrderItem(id: string): Promise<DeleteOrderItemResult> {
  const res = await axiosInstance.delete<DeleteOrderItemResult>(`/order-items/${id}`);
  return res.data;
}
