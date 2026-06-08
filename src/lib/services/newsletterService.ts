import { axiosInstance } from "../authService";

export async function createNewsletterSubscriber(data: { email: string }) {
  const res = await axiosInstance.post("/newsletter-subscribers", data);
  return res.data;
}

export async function getNewsletterSubscribers() {
  const res = await axiosInstance.get("/newsletter-subscribers");
  return res.data;
}

export async function getNewsletterSubscriberById(id: string) {
  const res = await axiosInstance.get(`/newsletter-subscribers/${id}`);
  return res.data;
}

export async function deleteNewsletterSubscriber(id: string) {
  const res = await axiosInstance.delete(`/newsletter-subscribers/${id}`);
  return res.data;
}