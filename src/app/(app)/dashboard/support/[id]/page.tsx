"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { BadgeVariant } from "@/types";
import {
  getSupportTicketById,
  addSupportTicketMessage,
  updateSupportTicketStatus,
  type SupportTicketDetail,
  type TicketDepartment,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/services/supportTicketsService";

const departmentConfig: Record<TicketDepartment, { label: string; variant: BadgeVariant }> = {
  technical_support: { label: "Technical Support", variant: "danger" },
  billing:           { label: "Billing",            variant: "warning" },
  account:           { label: "Account",            variant: "info" },
  product_analysis:  { label: "Product Analysis",   variant: "default" },
  amazon_connection: { label: "Amazon Connection",  variant: "info" },
  other:             { label: "Other",              variant: "default" },
};

const priorityConfig: Record<TicketPriority, { label: string; variant: BadgeVariant }> = {
  low:      { label: "Low",      variant: "default" },
  medium:   { label: "Medium",   variant: "warning" },
  high:     { label: "High",     variant: "danger" },
  critical: { label: "Critical", variant: "danger" },
};

const statusConfig: Record<TicketStatus, { label: string; variant: BadgeVariant }> = {
  open:        { label: "Open",        variant: "default" },
  pending:     { label: "Pending",     variant: "warning" },
  assigned:    { label: "Assigned",    variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  fixed:       { label: "Fixed",       variant: "success" },
  closed:      { label: "Closed",      variant: "default" },
  reopened:    { label: "Reopened",    variant: "danger" },
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const ticketId = params.id;

  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const loadTicket = useCallback(() => {
    return getSupportTicketById(ticketId)
      .then((data) => {
        setTicket(data);
        setLoadError("");
      })
      .catch(() => setLoadError("This ticket could not be loaded."))
      .finally(() => setIsLoading(false));
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-sm text-muted">Loading ticket...</p>
      </div>
    );
  }

  if (loadError || !ticket) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-sm text-danger">{loadError || "Ticket not found."}</p>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      await addSupportTicketMessage(ticketId, newMessage.trim());
      setNewMessage("");
      await loadTicket();
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendMessage();
  };

  const handleCloseTicket = async () => {
    await updateSupportTicketStatus(ticketId, "closed");
    setShowCloseConfirm(false);
    await loadTicket();
  };

  const handleReopenTicket = async () => {
    await updateSupportTicketStatus(ticketId, "reopened");
    await loadTicket();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button
        onClick={() => router.push("/dashboard/support")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Support
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-card-bg border border-border rounded-2xl px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-heading">{ticket.title}</h1>
                <p className="text-xs text-muted mt-1">#{ticket.id}</p>
              </div>
              <Badge variant={statusConfig[ticket.status].variant}>
                {statusConfig[ticket.status].label}
              </Badge>
            </div>
            <p className="text-sm text-body mt-4 leading-relaxed">{ticket.description}</p>
            {ticket.relatedEntityType && (
              <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-section-bg border border-border rounded-lg w-fit">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" />
                </svg>
                <span className="text-xs text-muted">Related to:</span>
                <span className="text-xs font-medium text-body capitalize">{ticket.relatedEntityType}</span>
                <span className="text-xs text-muted">—</span>
                <span className="text-xs text-primary">{ticket.relatedEntityLabel}</span>
              </div>
            )}
          </div>

          <div className="bg-card-bg border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-section-bg">
              <p className="text-xs font-medium text-muted uppercase tracking-widest">Messages</p>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {ticket.messages.map((msg) => (
                <div key={msg.id} className="px-6 py-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        msg.sender === "support" ? "bg-primary-light text-primary" : "bg-section-bg text-body"
                      }`}>
                        {msg.sender === "support" ? "ML" : "U"}
                      </div>
                      <span className="text-sm font-medium text-heading">
                        {msg.sender === "support" ? "MarginLane Support" : "You"}
                      </span>
                    </div>
                    <span className="text-xs text-muted">{formatTimestamp(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-body leading-relaxed pl-9">{msg.content}</p>
                </div>
              ))}
            </div>

            {!isClosed ? (
              <div className="px-6 py-5 border-t border-border bg-section-bg">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary transition-colors duration-150 placeholder:text-placeholder resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted">⌘ + Enter to send</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? "Sending..." : "Send reply"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 border-t border-border bg-section-bg">
                <p className="text-xs text-muted text-center">
                  This ticket is closed.{" "}
                  <button onClick={handleReopenTicket} className="text-primary hover:underline cursor-pointer">
                    Reopen ticket
                  </button>{" "}
                  if you need further assistance.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-64 flex flex-col gap-4">
          <div className="bg-card-bg border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-section-bg">
              <p className="text-xs font-medium text-muted uppercase tracking-widest">Ticket Info</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Status</span>
                <Badge variant={statusConfig[ticket.status].variant}>
                  {statusConfig[ticket.status].label}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Priority</span>
                <Badge variant={priorityConfig[ticket.priority].variant}>
                  {priorityConfig[ticket.priority].label}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Department</span>
                <Badge variant={departmentConfig[ticket.department].variant}>
                  {departmentConfig[ticket.department].label}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Created</span>
                <span className="text-sm text-body">{formatTimestamp(ticket.created_at)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Last updated</span>
                <span className="text-sm text-body">{formatTimestamp(ticket.updated_at)}</span>
              </div>
            </div>
            {!isClosed && (
              <div className="px-5 pb-5">
                {!showCloseConfirm ? (
                  <button
                    onClick={() => setShowCloseConfirm(true)}
                    className="w-full text-xs text-muted hover:text-danger border border-border hover:border-danger rounded-lg px-3 py-2 transition-colors duration-150 cursor-pointer"
                  >
                    Close ticket
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 p-3 bg-section-bg border border-border rounded-lg">
                    <p className="text-xs text-body text-center">Mark this ticket as resolved?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCloseConfirm(false)}
                        className="flex-1 text-xs text-muted border border-border rounded-lg px-3 py-1.5 hover:border-primary transition-colors duration-150 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCloseTicket}
                        className="flex-1 text-xs text-white bg-danger rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity duration-150 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}