"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
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

type MessageSender = "user" | "support";

interface Attachment {
  name: string;
  size: number;
  url: string;
}

interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  relatedEntity?: {
    type: "product" | "order" | "import";
    id: string;
    label: string;
  };
  messages: Message[];
}

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

const mockTicket: TicketDetail = {
  id: "TK-004",
  title: "Cannot access dashboard after login",
  description:
    "After logging in with my email and password, I'm immediately redirected back to the login page. This started happening yesterday. I've tried clearing cache and using a different browser but the issue persists.",
  department: "technical_support",
  priority: "critical",
  status: "in_progress",
  createdAt: "May 17, 2026",
  updatedAt: "May 19, 2026",
  messages: [
    {
      id: "msg-1",
      sender: "user",
      content: "After logging in with my email and password, I'm immediately redirected back to the login page. This started happening yesterday.",
      timestamp: "May 17, 2026 · 10:42 AM",
      attachments: [
        { name: "screenshot-error.png", size: 204800, url: "#" },
      ],
    },
    {
      id: "msg-2",
      sender: "support",
      content: "Hi! Thanks for reaching out. We've been able to reproduce the issue on our end. It looks like it's related to a recent session token change. We're working on a fix and will update you shortly.",
      timestamp: "May 18, 2026 · 09:15 AM",
    },
    {
      id: "msg-3",
      sender: "user",
      content: "Thanks for the quick reply! Is there any workaround I can use in the meantime? It's blocking my daily workflow.",
      timestamp: "May 18, 2026 · 11:30 AM",
    },
    {
      id: "msg-4",
      sender: "support",
      content: "You can try logging in via an incognito window as a temporary workaround. We expect to have a fix deployed within 24 hours.",
      timestamp: "May 19, 2026 · 08:50 AM",
    },
  ],
};

export default function TicketDetailPage({ params: _params }: { params: { id: string } }) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockTicket.messages);
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>(mockTicket.status);
  const [isSending, setIsSending] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ticket = mockTicket;
  const isClosed = ticketStatus === "closed";

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);

    const newAttachments: Attachment[] = attachedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      url: "#",
    }));

    const msg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: newMessage.trim(),
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachments: newAttachments.length > 0 ? newAttachments : undefined,
    };

    // await fetch(`/api/tickets/${params.id}/messages`, {
    //   method: "POST",
    //   body: JSON.stringify({ content: newMessage }),
    // });

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setAttachedFiles([]);
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendMessage();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachedFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseTicket = async () => {
    // await fetch(`/api/tickets/${params.id}/status`, {
    //   method: "PATCH",
    //   body: JSON.stringify({ status: "closed" }),
    // });
    setTicketStatus("closed");
    setShowCloseConfirm(false);
  };

  const handleReopenTicket = async () => {
    // await fetch(`/api/tickets/${params.id}/status`, {
    //   method: "PATCH",
    //   body: JSON.stringify({ status: "reopened" }),
    // });
    setTicketStatus("reopened");
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
              <Badge variant={statusConfig[ticketStatus].variant}>
                {statusConfig[ticketStatus].label}
              </Badge>
            </div>
            <p className="text-sm text-body mt-4 leading-relaxed">{ticket.description}</p>
            {ticket.relatedEntity && (
              <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-section-bg border border-border rounded-lg w-fit">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" />
                </svg>
                <span className="text-xs text-muted">Related to:</span>
                <span className="text-xs font-medium text-body capitalize">{ticket.relatedEntity.type}</span>
                <span className="text-xs text-muted">—</span>
                <span className="text-xs text-primary">{ticket.relatedEntity.label}</span>
              </div>
            )}
          </div>

          <div className="bg-card-bg border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-section-bg">
              <p className="text-xs font-medium text-muted uppercase tracking-widest">Messages</p>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {messages.map((msg) => (
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
                    <span className="text-xs text-muted">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-body leading-relaxed pl-9">{msg.content}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <ul className="flex flex-col gap-1.5 mt-3 pl-9">
                      {msg.attachments.map((att, i) => (
                        <li key={i}>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-section-bg border border-border rounded-lg hover:border-primary transition-colors duration-150 group"
                          >
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#6B7BB5" strokeWidth="1.5">
                              <rect x="2" y="1" width="10" height="12" rx="1.5" />
                              <path d="M4 5h6M4 7.5h6M4 10h4" />
                            </svg>
                            <span className="text-xs text-body group-hover:text-primary transition-colors duration-150">{att.name}</span>
                            <span className="text-xs text-muted">({(att.size / 1024).toFixed(0)} KB)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
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
                {attachedFiles.length > 0 && (
                  <ul className="flex flex-col gap-1.5 mt-2">
                    {attachedFiles.map((file, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-page-bg border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#6B7BB5" strokeWidth="1.5">
                            <rect x="2" y="1" width="10" height="12" rx="1.5" />
                            <path d="M4 5h6M4 7.5h6M4 10h4" />
                          </svg>
                          <span className="text-xs text-body truncate max-w-48">{file.name}</span>
                          <span className="text-xs text-muted">({(file.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          className="text-muted hover:text-heading transition-colors duration-150 cursor-pointer"
                        >
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 2l8 8M10 2L2 10" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors duration-150 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 2v8M4 6l4-4 4 4" />
                        <path d="M2 12h12" />
                      </svg>
                      Attach file
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                    <span className="text-xs text-muted">⌘ + Enter to send</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    Send reply
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
                <Badge variant={statusConfig[ticketStatus].variant}>
                  {statusConfig[ticketStatus].label}
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
                <span className="text-sm text-body">{ticket.createdAt}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Last updated</span>
                <span className="text-sm text-body">{ticket.updatedAt}</span>
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