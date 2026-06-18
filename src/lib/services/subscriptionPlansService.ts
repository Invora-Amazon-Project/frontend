import { axiosInstance } from "../authService";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  product_limit: number;
  list_limit: number;
  team_limit: number;
  api_limit: number;
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  price: number;
  product_limit: number;
  list_limit: number;
  team_limit: number;
  api_limit: number;
}

export async function createSubscriptionPlan(
  data: CreateSubscriptionPlanPayload
): Promise<SubscriptionPlan> {
  const res = await axiosInstance.post<SubscriptionPlan>("/subscription-plans", data);
  return res.data;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await axiosInstance.get<SubscriptionPlan[]>("/subscription-plans");
  return res.data;
}
