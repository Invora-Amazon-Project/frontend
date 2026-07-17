"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10.5" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "USERS & PLANS",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 15.5c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Plans",
        href: "/admin/plans",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="5" width="16" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="10.5" width="16" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="1" width="16" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        label: "Credits",
        href: "/admin/credits",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5v1m0 6v1M7 7.5a2 2 0 0 1 2-1.5h.5a1.5 1.5 0 0 1 0 3h-1a1.5 1.5 0 0 0 0 3H9a2 2 0 0 0 2-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Promo Codes",
        href: "/admin/promo-codes",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 2H3a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .293.707l6.5 6.5a1 1 0 0 0 1.414 0l5.5-5.5a1 1 0 0 0 0-1.414L9.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        label: "Tickets",
        href: "/admin/tickets",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1.5a2 2 0 0 0 0 3V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1.5a2 2 0 0 0 0-3V6Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 9h4M7 11.5h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2a5.5 5.5 0 0 0-5.5 5.5c0 2.5-1 4-1.5 4.5h14c-.5-.5-1.5-2-1.5-4.5A5.5 5.5 0 0 0 9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M7 12c0 1.105.895 2 2 2s2-.895 2-2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="10" width="3" height="1.5" rx="0.5" fill="currentColor" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        label: "Decision Rules",
        href: "/admin/decision-rules",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5h12M3 9h8M3 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        label: "Logs",
        href: "/admin/logs",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h10M4 7.5h10M4 11h7M4 14.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Monitoring",
        href: "/admin/monitoring",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 10L5 6.5l3 3 3-5 3 4 2-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        label: "Matching Review",
        href: "/admin/matching-review",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5.5" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12.5" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 6.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: "Canonical Products",
        href: "/admin/canonical-products",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 6.5h14M6.5 6.5V16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-brand flex flex-col z-40">
      <div className="px-6 py-6">
        <span className="block text-white font-semibold text-lg leading-tight">MarginLane</span>
        <span className="block text-xs mt-0.5" style={{ color: "#6b7bb5" }}>Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto pb-6">
        {sections.map((section) => (
          <div key={section.label} className="mt-4">
            <p className="px-6 mb-1 text-[10px] font-semibold tracking-widest" style={{ color: "#6b7bb5" }}>
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 mx-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
