"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { NotificationMessage, NotificationTarget, PlanName } from "@/types";

const mockHistory: NotificationMessage[] = [
  { id: "N-001", target: "all", subject: "Platform maintenance on June 15", body: "", sentAt: "2025-06-12T10:00:00Z", deliveredCount: 1284 },
  { id: "N-002", target: "by_plan", targetPlan: "pro", subject: "New Pro feature: Daily Pulse alerts", body: "", sentAt: "2025-06-10T14:30:00Z", deliveredCount: 412 },
  { id: "N-003", target: "trial_only", subject: "Your trial ends in 3 days — upgrade now", body: "", sentAt: "2025-06-08T09:00:00Z", deliveredCount: 97 },
  { id: "N-004", target: "by_plan", targetPlan: "team", subject: "Team plan bulk import limit increased", body: "", sentAt: "2025-06-05T11:15:00Z", deliveredCount: 88 },
  { id: "N-005", target: "single_user", targetUserId: "U-4", subject: "Your account has been reviewed", body: "", sentAt: "2025-06-03T16:45:00Z", deliveredCount: 1 },
  { id: "N-006", target: "all", subject: "Invora v2.1 is live — see what's new", body: "", sentAt: "2025-05-28T08:00:00Z", deliveredCount: 1201 },
];

const targetOptions: { label: string; value: NotificationTarget }[] = [
  { label: "All Users", value: "all" },
  { label: "By Plan", value: "by_plan" },
  { label: "Trial Only", value: "trial_only" },
  { label: "Single User", value: "single_user" },
];

const targetPills: Record<NotificationTarget, string> = {
  all: "bg-primary-light text-primary",
  by_plan: "bg-peach-bg text-peach",
  trial_only: "bg-mint-bg text-mint",
  single_user: "bg-section-bg text-muted",
};

const targetLabels: Record<NotificationTarget, string> = {
  all: "All Users",
  by_plan: "By Plan",
  trial_only: "Trial Only",
  single_user: "Single User",
};

function formatTarget(n: NotificationMessage): string {
  if (n.target === "by_plan" && n.targetPlan) return `Plan: ${n.targetPlan.charAt(0).toUpperCase() + n.targetPlan.slice(1)}`;
  if (n.target === "single_user" && n.targetUserId) return `User ${n.targetUserId}`;
  return targetLabels[n.target];
}

export default function NotificationsPage() {
  const [target, setTarget] = useState<NotificationTarget>("all");
  const [plan, setPlan] = useState<PlanName>("starter");
  const [userEmail, setUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function handleSend() {
    setSubject("");
    setBody("");
    setUserEmail("");
  }

  return (
    <div className="space-y-6">
      {/* Send Notification */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-base mb-5">Send New Notification</h2>

        <div className="space-y-5">
          {/* Target selector */}
          <div>
            <label className="block text-xs font-medium text-body mb-2">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {targetOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTarget(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    target === opt.value
                      ? "bg-primary text-white border-primary"
                      : "bg-card-bg text-body border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional sub-fields */}
          {target === "by_plan" && (
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Select Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as PlanName)}
                className="border border-border rounded-lg px-3 py-2.5 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors w-48"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="team">Team</option>
              </select>
            </div>
          )}

          {target === "single_user" && (
            <Input
              label="User Email"
              type="email"
              placeholder="user@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          )}

          {/* Subject */}
          <Input
            label="Subject"
            type="text"
            placeholder="e.g. Important platform update"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-body">Message Body</label>
            <textarea
              rows={5}
              placeholder="Write your notification message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary transition-colors placeholder:text-placeholder resize-none min-h-[120px]"
            />
          </div>

          <div>
            <Button variant="primary" size="md" onClick={handleSend}>
              Send Now
            </Button>
          </div>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-base mb-5">Sent Notifications</h2>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Target</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Subject</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Sent At</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Delivered</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${targetPills[n.target]}`}>
                      {formatTarget(n)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body max-w-[280px]">
                    <span className="truncate block">{n.subject}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(n.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                    {new Date(n.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5 text-body">
                    {n.deliveredCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-primary text-sm hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
