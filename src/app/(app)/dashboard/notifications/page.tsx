"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import type { UserNotification, NotificationType } from "@/types";

// TODO: Replace with real API call — GET /notifications

const MOCK_NOTIFICATIONS: UserNotification[] = [
  {
    id: "n1",
    type: "opportunity",
    title: "New strong opportunity detected",
    message: "Brieftons 5-Blade Spiralizer price increased 12% — your target ROI of 50% is now achievable.",
    isRead: false,
    createdAt: "2026-07-06T08:00:00Z",
    linkTo: "/dashboard/analysis/p10",
  },
  {
    id: "n2",
    type: "stock",
    title: "Low stock warning",
    message: "Nomader Collapsible Sports Water Bottle has only 8 units left. Estimated stockout in 5 days.",
    isRead: false,
    createdAt: "2026-07-06T07:45:00Z",
    linkTo: "/dashboard/inventory",
  },
  {
    id: "n3",
    type: "risk",
    title: "Profit margin dropped",
    message: "OXO Good Grips Tong Set buy box price fell to $15.49. ROI dropped from 40% to 24%.",
    isRead: false,
    createdAt: "2026-07-06T07:00:00Z",
    linkTo: "/dashboard/daily-pulse",
  },
  {
    id: "n4",
    type: "order",
    title: "Order shipped",
    message: "Order #ORD-2026-004 from Shanghai Source Co. has been shipped. Tracking: SH9281763CN.",
    isRead: false,
    createdAt: "2026-07-05T14:20:00Z",
    linkTo: "/dashboard/orders",
  },
  {
    id: "n5",
    type: "billing",
    title: "Subscription renewal upcoming",
    message: "Your Pro plan renews in 7 days on July 13, 2026. Ensure your payment method is up to date.",
    isRead: false,
    createdAt: "2026-07-05T09:00:00Z",
    linkTo: "/manage-plan",
  },
  {
    id: "n6",
    type: "credit",
    title: "Analysis credits running low",
    message: "You have 12 analysis credits remaining this month. Upgrade your plan to get more.",
    isRead: true,
    createdAt: "2026-07-04T11:30:00Z",
    linkTo: "/manage-plan",
  },
  {
    id: "n7",
    type: "ticket",
    title: "Support ticket reply received",
    message: "Your ticket #TKT-1041 has a new reply from the Invora support team.",
    isRead: true,
    createdAt: "2026-07-03T16:00:00Z",
    linkTo: "/dashboard/support",
  },
  {
    id: "n8",
    type: "admin_announcement",
    title: "New feature: Bulk reorder",
    message: "You can now select multiple inventory items and place reorders in a single action from the Inventory page.",
    isRead: true,
    createdAt: "2026-07-02T10:00:00Z",
  },
];

type TabKey = "all" | "opportunity" | "stock" | "risk" | "order" | "billing" | "system";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "opportunity", label: "Opportunities" },
  { key: "stock",       label: "Stock" },
  { key: "risk",        label: "Risk" },
  { key: "order",       label: "Orders" },
  { key: "billing",     label: "Billing" },
  { key: "system",      label: "System" },
];

function tabMatchesType(tab: TabKey, type: NotificationType): boolean {
  if (tab === "all") return true;
  if (tab === "system") return type === "credit" || type === "ticket" || type === "admin_announcement";
  return type === tab;
}

interface IconConfig {
  bg: string;
  text: string;
  icon: React.ReactNode;
}

function getIconConfig(type: NotificationType): IconConfig {
  switch (type) {
    case "opportunity":
      return {
        bg: "bg-mint-bg",
        text: "text-mint",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ),
      };
    case "stock":
      return {
        bg: "bg-peach-bg",
        text: "text-peach",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      };
    case "risk":
      return {
        bg: "bg-rose-bg",
        text: "text-rose",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      };
    case "order":
      return {
        bg: "bg-primary-light",
        text: "text-primary",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        ),
      };
    case "billing":
      return {
        bg: "bg-peach-bg",
        text: "text-peach",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      };
    case "credit":
      return {
        bg: "bg-primary-light",
        text: "text-primary",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
      };
    case "ticket":
      return {
        bg: "bg-section-bg",
        text: "text-muted",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      };
    case "admin_announcement":
      return {
        bg: "bg-section-bg",
        text: "text-muted",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l19-9-9 19-2-8-8-2z" />
          </svg>
        ),
      };
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date("2026-07-06T12:00:00Z");
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  return `${diffDay} days ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const visible = notifications.filter((n) => tabMatchesType(activeTab, n.type));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-heading font-semibold text-2xl">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-rose-bg text-rose text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-body"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            }
            title="No notifications"
            description="You're all caught up."
          />
        </div>
      ) : (
        <div className="bg-card-bg border border-border rounded-xl overflow-hidden mt-0">
          {visible.map((notification, idx) => {
            const config = getIconConfig(notification.type);
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-section-bg transition-colors ${
                  idx < visible.length - 1 ? "border-b border-border" : ""
                } ${!notification.isRead ? "bg-primary-light/20" : ""}`}
              >
                {/* Unread dot */}
                <div className="shrink-0 mt-2 w-2 flex justify-center">
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full block" />
                  )}
                </div>

                {/* Icon circle */}
                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config.bg} ${config.text}`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-body text-sm font-medium leading-snug">{notification.title}</p>
                  <p className="text-muted text-sm mt-0.5 leading-snug">{notification.message}</p>
                  <p className="text-muted text-xs mt-1">{formatTimestamp(notification.createdAt)}</p>
                </div>

                {/* View link */}
                <div className="shrink-0 ml-2 mt-1">
                  {notification.linkTo ? (
                    <a
                      href={notification.linkTo}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (notification.linkTo === "/manage-plan") {
                          sessionStorage.setItem("manage-plan-from", "/dashboard/notifications");
                        }
                      }}
                      className="text-primary text-xs font-medium hover:underline whitespace-nowrap"
                    >
                      View →
                    </a>
                  ) : (
                    <span className="w-10 inline-block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
