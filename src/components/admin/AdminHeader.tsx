"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/plans": "Plans",
  "/admin/credits": "Credits",
  "/admin/promo-codes": "Promo Codes",
  "/admin/tickets": "Tickets",
  "/admin/notifications": "Notifications",
  "/admin/payments": "Payments",
  "/admin/decision-rules": "Decision Rules",
  "/admin/logs": "Logs",
  "/admin/monitoring": "Monitoring",
  "/admin/matching-review": "Matching Review",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin";

  return (
    <header className="h-16 bg-card-bg border-b border-border flex items-center justify-between px-6 w-full">
      <h1 className="text-heading font-semibold text-lg">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="text-muted hover:text-heading transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 2a6 6 0 0 0-6 6c0 2.8-1.1 4.4-1.7 5H17.7c-.6-.6-1.7-2.2-1.7-5a6 6 0 0 0-6-6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M8 16c0 1.105.895 2 2 2s2-.895 2-2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-border" />

        <span className="text-body text-sm font-medium">Admin</span>

        <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-semibold select-none">
          A
        </div>
      </div>
    </header>
  );
}
