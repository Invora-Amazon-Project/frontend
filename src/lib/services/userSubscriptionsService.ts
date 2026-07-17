import { axiosInstance } from "../authService";
import { SubscriptionPlan } from "./subscriptionPlansService";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  current_period_start?: string;
  trial_end?: string;
  renewal_date?: string;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

export interface CreateUserSubscriptionPayload {
  plan_id: string;
}

export async function createUserSubscription(
  data: CreateUserSubscriptionPayload
): Promise<UserSubscription> {
  const res = await axiosInstance.post<UserSubscription>("/user-subscriptions", data);
  return res.data;
}

export async function getUserSubscription(): Promise<UserSubscription> {
  const res = await axiosInstance.get<UserSubscription>("/user-subscriptions/me");
  const data = res.data;
  return {
    ...data,
    // Nested plan has the same `price`/`export_options` serialization quirks as /subscription-plans.
    plan: {
      ...data.plan,
      price: Number(data.plan.price),
      export_options: Array.isArray(data.plan.export_options) ? data.plan.export_options : [],
    },
  };
}
