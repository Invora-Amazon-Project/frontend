"use client";

import StatCard from "@/components/admin/StatCard";
import Link from "next/link";

const logEntries = [
  { id: 1, severity: "info", description: "New user registered: sarah.johnson@example.com", time: "2 min ago" },
  { id: 2, severity: "error", description: "Payment failed for user ID #4821 — Stripe declined", time: "14 min ago" },
  { id: 3, severity: "warning", description: "User #3302 has exceeded daily analysis limit", time: "31 min ago" },
  { id: 4, severity: "info", description: "Admin action: Promo code SUMMER25 created", time: "1 hr ago" },
  { id: 5, severity: "error", description: "Amazon API connection timeout for user #2190", time: "2 hr ago" },
  { id: 6, severity: "info", description: "Plan upgraded: user #1047 moved from Starter → Pro", time: "3 hr ago" },
];

const severityDot: Record<string, string> = {
  info: "bg-mint",
  warning: "bg-peach",
  error: "bg-rose",
};

const quickActions = [
  {
    label: "Add User",
    href: "/admin/users",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.5" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 17c0-3.314 2.91-6 6.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 12v5M12.5 14.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Send Notification",
    href: "/admin/notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2a6 6 0 0 0-6 6c0 2.8-1.1 4.4-1.7 5H17.7c-.6-.6-1.7-2.2-1.7-5a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 16c0 1.105.895 2 2 2s2-.895 2-2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Add Credits",
    href: "/admin/credits",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v1m0 6v1M8 8.5A2.5 2.5 0 0 1 10 7h.5a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3h.5A2.5 2.5 0 0 0 13 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Create Promo",
    href: "/admin/promo-codes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 2.5H3.5a1 1 0 0 0-1 1V11a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l6-6a1 1 0 0 0 0-1.414l-7-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="6.5" cy="7.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "View Logs",
    href: "/admin/logs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5h12M4 9h12M4 13h8M4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "System Monitor",
    href: "/admin/monitoring",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 11.5L6 7l3.5 3.5 3.5-6 3.5 4.5 2-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="1,284"
          subtitle="+12 this week"
          color="primary"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="10.5" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          }
        />
        <StatCard
          title="Open Tickets"
          value="37"
          subtitle="8 high priority"
          color="rose"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1.5a2 2 0 0 0 0 3V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1.5a2 2 0 0 0 0-3V6Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 9h4M7 11.5h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          title="Failed Payments"
          value="5"
          subtitle="Last 30 days"
          color="peach"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5" />
              <rect x="4" y="10" width="3" height="1.5" rx="0.5" fill="currentColor" />
            </svg>
          }
        />
        <StatCard
          title="System Health"
          value="98.2%"
          subtitle="All services running"
          color="mint"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 10L5 6.5l3 3 3-5 3 4 2-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* Bottom two-column section */}
      <div className="flex gap-6">
        {/* Recent Activity — 60% */}
        <div className="flex-[3] bg-card-bg border border-border rounded-xl p-5">
          <h2 className="text-heading font-semibold text-base mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {logEntries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${severityDot[entry.severity]}`} />
                  <span className="text-body text-sm leading-snug">{entry.description}</span>
                </div>
                <span className="text-muted text-xs shrink-0 mt-0.5">{entry.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions — 40% */}
        <div className="flex-[2] bg-card-bg border border-border rounded-xl p-5">
          <h2 className="text-heading font-semibold text-base mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 bg-card-bg border border-border rounded-xl p-4 text-center hover:border-primary hover:bg-primary-light transition-colors"
              >
                <span className="text-muted">{action.icon}</span>
                <span className="text-body text-xs font-medium leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
