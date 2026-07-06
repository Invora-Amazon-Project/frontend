import { axiosInstance } from "@/lib/authService";

export interface NewsletterSubscribePayload {
  email: string;
  source?: string;
}

export async function subscribeNewsletterService(
  payload: NewsletterSubscribePayload
): Promise<void> {
  await axiosInstance.post("/newsletter-subscribers", payload);
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
