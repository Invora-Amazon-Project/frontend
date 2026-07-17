import { axiosInstance } from "../authService";

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  price: number;
  annual_discount: number;
  trial_days: number;
  monthly_credits: number;
  product_limit: number;
  list_limit: number;
  team_limit: number;
  api_limit: number;
  daily_pulse_access: boolean;
  support_level: string;
  export_options: string[];
  is_active: boolean;
}

export interface SubscriptionPlanPayload {
  name: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  price: number;
  annual_discount: number;
  trial_days: number;
  monthly_credits: number;
  product_limit: number;
  list_limit: number;
  team_limit: number;
  api_limit: number;
  daily_pulse_access: boolean;
  support_level: string;
  export_options: string[];
  is_active: boolean;
}

export async function createSubscriptionPlan(
  data: SubscriptionPlanPayload
): Promise<SubscriptionPlan> {
  const res = await axiosInstance.post<SubscriptionPlan>("/subscription-plans", data);
  return res.data;
}

export async function updateSubscriptionPlan(
  id: string,
  data: Partial<SubscriptionPlanPayload>
): Promise<SubscriptionPlan> {
  const res = await axiosInstance.patch<SubscriptionPlan>(`/subscription-plans/${id}`, data);
  return res.data;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await axiosInstance.get<SubscriptionPlan[]>("/subscription-plans");
  // Backend returns `price` as a string (Decimal serialization) and
  // `export_options` typed as a generic object in its schema — normalize both here.
  return res.data.map((plan) => ({
    ...plan,
    price: Number(plan.price),
    export_options: Array.isArray(plan.export_options) ? plan.export_options : [],
  }));
}
