import { axiosInstance } from "../authService";

export type TicketDepartment =
  | "technical_support"
  | "billing"
  | "account"
  | "product_analysis"
  | "amazon_connection"
  | "other";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type TicketStatus =
  | "open"
  | "pending"
  | "assigned"
  | "in_progress"
  | "fixed"
  | "closed"
  | "reopened";

export type RelatedEntityType = "product" | "order" | "import";

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  relatedEntityLabel?: string;
}

export interface TicketMessage {
  id: string;
  sender: "user" | "support";
  content: string;
  created_at: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: TicketMessage[];
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  department: TicketDepartment;
  priority: TicketPriority;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  relatedEntityLabel?: string;
}

export async function createSupportTicket(data: CreateTicketPayload) {
  const res = await axiosInstance.post<SupportTicket>("/support-tickets", data);
  return res.data;
}

export async function getSupportTickets() {
  const res = await axiosInstance.get<SupportTicket[]>("/support-tickets");
  return res.data;
}

export async function getSupportTicketById(id: string) {
  const res = await axiosInstance.get<SupportTicketDetail>(`/support-tickets/${id}`);
  return res.data;
}

export async function addSupportTicketMessage(id: string, content: string) {
  const res = await axiosInstance.post<TicketMessage>(`/support-tickets/${id}/messages`, {
    content,
  });
  return res.data;
}

export async function updateSupportTicketStatus(id: string, status: TicketStatus) {
  const res = await axiosInstance.patch<SupportTicket>(`/support-tickets/${id}/status`, {
    status,
  });
  return res.data;
}
