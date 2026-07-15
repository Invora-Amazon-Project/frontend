import { axiosInstance } from "../authService";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: string;
  trial_end?: string;
  renewal_date?: string;
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
  return res.data;
}
