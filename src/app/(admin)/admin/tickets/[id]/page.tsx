"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/admin/StatusBadge";
import { mockTickets } from "../page";
import type { TicketStatus, TicketPriority } from "@/types";

const allStatuses: TicketStatus[] = ["open", "pending", "assigned", "in_progress", "fixed", "closed", "reopened"];
const allPriorities: TicketPriority[] = ["critical", "high", "medium", "low"];
const adminNames = ["Unassigned", "Ali Yıldız", "Deniz Kara", "Berk Şahin"];

const departmentLabels: Record<string, string> = {
  technical_support: "Technical Support",
  billing: "Billing",
  account: "Account",
  product_analysis: "Product Analysis",
  amazon_connection: "Amazon Connection",
  other: "Other",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const ticket = mockTickets.find((t) => t.id === id);

  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "open");
  const [priority, setPriority] = useState<TicketPriority>(ticket?.priority ?? "medium");
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo ?? "Unassigned");
  const [internalNote, setInternalNote] = useState("");
  const [reply, setReply] = useState("");

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-heading font-semibold text-lg">Ticket not found</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back link */}
      <button
        onClick={() => router.push("/admin/tickets")}
        className="flex items-center gap-1.5 text-muted text-sm hover:text-body transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Tickets
      </button>

      <div className="flex gap-6 items-start">
        {/* Left — 65% */}
        <div className="flex-[13] space-y-5 min-w-0">
          {/* Subject + meta */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-muted text-xs font-mono">#{ticket.id}</span>
              <StatusBadge status={status} />
            </div>
            <h1 className="text-heading font-semibold text-xl">{ticket.subject}</h1>
            <p className="text-muted text-sm mt-1">
              Submitted by <span className="text-body font-medium">{ticket.userName}</span> ·{" "}
              {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-heading font-semibold text-sm mb-2">Description</h2>
            <div className="bg-section-bg rounded-xl p-4 text-body text-sm leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-card-bg border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-heading font-semibold text-sm">Internal Notes</h2>
            <textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add a private note visible only to admins..."
              className="w-full bg-page-bg border border-border rounded-lg p-3 text-sm text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors resize-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInternalNote("")}
            >
              Save Note
            </Button>
          </div>

          {/* Reply to User */}
          <div className="bg-card-bg border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-heading font-semibold text-sm">Reply to User</h2>
            <textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply that will be sent to the user..."
              className="w-full bg-page-bg border border-border rounded-lg p-3 text-sm text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors resize-none"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setReply("")}
            >
              Send Reply
            </Button>
          </div>
        </div>

        {/* Right — 35% */}
        <div className="flex-[7] shrink-0">
          <div className="bg-card-bg border border-border rounded-xl p-4 space-y-4">
            <h2 className="text-heading font-semibold text-sm">Ticket Details</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-muted text-xs mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                >
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted text-xs mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                >
                  {allPriorities.map((p) => (
                    <option key={p} value={p} className="capitalize">{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted text-xs mb-1">Assigned To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                >
                  {adminNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted text-xs mb-1">Department</label>
                <p className="text-body text-sm px-3 py-2 bg-section-bg rounded-lg">
                  {departmentLabels[ticket.department] ?? ticket.department}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted text-xs mb-1">Created</label>
                  <p className="text-body text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <label className="block text-muted text-xs mb-1">User</label>
                  <p className="text-body text-sm">{ticket.userName}</p>
                </div>
              </div>
            </div>

            <Button variant="primary" size="sm">
              <span className="w-full text-center">Update</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
