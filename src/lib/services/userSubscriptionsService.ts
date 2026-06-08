import { axiosInstance } from "../authService";

export async function createUserSubscription(data: { user_id: string; plan_id: string }) {
  const res = await axiosInstance.post("/user-subscriptions", data);
  return res.data;
}

export async function getUserSubscription(user_id: string) {
  const res = await axiosInstance.get(`/user-subscriptions/${user_id}`);
  return res.data;
}