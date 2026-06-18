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
  user_id: string;
  plan_id: string;
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_end?: string;
  renewal_date?: string;
}

export async function createUserSubscription(
  data: CreateUserSubscriptionPayload
): Promise<UserSubscription> {
  const res = await axiosInstance.post<UserSubscription>("/user-subscriptions", data);
  return res.data;
}

export async function getUserSubscription(user_id: string): Promise<UserSubscription> {
  const res = await axiosInstance.get<UserSubscription>(`/user-subscriptions/${user_id}`);
  return res.data;
}
