import axios from "axios";
import { axiosInstance } from "@/lib/authService";

const BASE_URL = "https://backend-2n7w.onrender.com";

export interface NewsletterSubscribePayload {
  email: string;
  source?: string;
}

export async function subscribeNewsletterService(
  payload: NewsletterSubscribePayload
): Promise<void> {
  await axios.post(`${BASE_URL}/newsletter-subscribers`, payload, {
    headers: { "Content-Type": "application/json" },
  });
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  source: string | null;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const res = await axiosInstance.get<NewsletterSubscriber[]>("/newsletter-subscribers");
  return res.data;
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  await axiosInstance.delete(`/newsletter-subscribers/${id}`);
}
