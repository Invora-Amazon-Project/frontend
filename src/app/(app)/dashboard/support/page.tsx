"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TicketModal from "@/components/ui/TicketModal";
import type { BadgeVariant } from "@/types";
import {
  getSupportTickets,
  type SupportTicket,
  type TicketDepartment,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/services/supportTicketsService";

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

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadTickets = useCallback(() => {
    return getSupportTickets()
      .then((data) => {
        setTickets(data);
        setError("");
      })
      .catch(() => setError("Destek talepleri yüklenirken bir hata oluştu."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

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

      {isLoading ? (
        <p className="text-sm text-muted">Loading tickets...</p>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-muted">You haven&apos;t submitted any support tickets yet.</p>
      ) : (
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
              {tickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                  className={`cursor-pointer hover:bg-section-bg transition-colors duration-150 ${
                    index !== tickets.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-heading">
                      {ticket.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted">#{ticket.id}</span>
                      {ticket.relatedEntityType && (
                        <>
                          <span className="text-xs text-border">·</span>
                          <span className="text-xs text-muted capitalize">
                            {ticket.relatedEntityType}:
                          </span>
                          <span className="text-xs text-primary truncate max-w-36">
                            {ticket.relatedEntityLabel}
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
                  <td className="px-5 py-4 text-sm text-muted">
                    {new Date(ticket.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={loadTickets}
      />
    </div>
  );
}
