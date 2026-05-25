"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TicketModal from "@/components/ui/TicketModal";
import type { BadgeVariant } from "@/types";

type TicketDepartment =
  | "technical_support"
  | "billing"
  | "account"
  | "product_analysis"
  | "amazon_connection"
  | "other";

type TicketPriority = "low" | "medium" | "high" | "critical";

type TicketStatus =
  | "open"
  | "pending"
  | "assigned"
  | "in_progress"
  | "fixed"
  | "closed"
  | "reopened";

interface Ticket {
  id: string;
  title: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  date: string;
  relatedEntity?: {
    type: "product" | "order" | "import";
    id: string;
    label: string;
  };
}

const departmentConfig: Record<
  TicketDepartment,
  { label: string; variant: BadgeVariant }
> = {
  technical_support: { label: "Technical Support", variant: "danger" },
  billing: { label: "Billing", variant: "warning" },
  account: { label: "Account", variant: "info" },
  product_analysis: { label: "Product Analysis", variant: "default" },
  amazon_connection: { label: "Amazon Connection", variant: "info" },
  other: { label: "Other", variant: "default" },
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; variant: BadgeVariant }
> = {
  low: { label: "Low", variant: "default" },
  medium: { label: "Medium", variant: "warning" },
  high: { label: "High", variant: "danger" },
  critical: { label: "Critical", variant: "danger" },
};

const statusConfig: Record<
  TicketStatus,
  { label: string; variant: BadgeVariant }
> = {
  open: { label: "Open", variant: "default" },
  pending: { label: "Pending", variant: "warning" },
  assigned: { label: "Assigned", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  fixed: { label: "Fixed", variant: "success" },
  closed: { label: "Closed", variant: "default" },
  reopened: { label: "Reopened", variant: "danger" },
};

// Backend hazır olduğunda API'den gelecek
const mockTickets: Ticket[] = [
  {
    id: "TK-005",
    title: "Amazon connection keeps disconnecting",
    department: "amazon_connection",
    priority: "high",
    status: "assigned",
    date: "May 20, 2026",
    relatedEntity: {
      type: "import",
      id: "IMP-012",
      label: "Nike Supplier List",
    },
  },
  {
    id: "TK-004",
    title: "Cannot access dashboard after login",
    department: "technical_support",
    priority: "critical",
    status: "in_progress",
    date: "May 17, 2026",
  },
  {
    id: "TK-003",
    title: "Charged twice for Pro plan",
    department: "billing",
    priority: "high",
    status: "pending",
    date: "May 14, 2026",
  },
  {
    id: "TK-002",
    title: "Add bulk export for sourcing lists",
    department: "product_analysis",
    priority: "medium",
    status: "open",
    date: "May 10, 2026",
    relatedEntity: {
      type: "product",
      id: "ASIN-B08XYZ",
      label: "Nike Air Max 90",
    },
  },
  {
    id: "TK-001",
    title: "Product search returning wrong results",
    department: "technical_support",
    priority: "low",
    status: "fixed",
    date: "May 5, 2026",
  },
];

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Support</h1>
          <p className="text-sm text-muted mt-1">
            Track and manage your support requests.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
        >
          New ticket
        </Button>
      </div>

      <div className="bg-card-bg border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-section-bg border-b border-border">
              <th className="text-left text-xs font-medium text-muted uppercase tracking-widest px-5 py-3">
                Ticket
              </th>
              <th className="text-left text-xs font-medium text-muted uppercase tracking-widest px-5 py-3">
                Department
              </th>
              <th className="text-left text-xs font-medium text-muted uppercase tracking-widest px-5 py-3">
                Priority
              </th>
              <th className="text-left text-xs font-medium text-muted uppercase tracking-widest px-5 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted uppercase tracking-widest px-5 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                className={`cursor-pointer hover:bg-section-bg transition-colors duration-150 ${
                  index !== mockTickets.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-heading">
                    {ticket.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted">#{ticket.id}</span>
                    {ticket.relatedEntity && (
                      <>
                        <span className="text-xs text-border">·</span>
                        <span className="text-xs text-muted capitalize">
                          {ticket.relatedEntity.type}:
                        </span>
                        <span className="text-xs text-primary truncate max-w-36">
                          {ticket.relatedEntity.label}
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={departmentConfig[ticket.department].variant}>
                    {departmentConfig[ticket.department].label}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={priorityConfig[ticket.priority].variant}>
                    {priorityConfig[ticket.priority].label}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={statusConfig[ticket.status].variant}>
                    {statusConfig[ticket.status].label}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-sm text-muted">{ticket.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
