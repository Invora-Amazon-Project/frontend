import { axiosInstance } from "../authService";

export async function createSubscriptionPlan(data: { name: string; price: number }) {
  const res = await axiosInstance.post("/subscription-plans", data);
  return res.data;
}

export async function getSubscriptionPlans() {
  const res = await axiosInstance.get("/subscription-plans");
  return res.data;
}