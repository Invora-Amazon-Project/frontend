"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAppDispatch } from "@/lib/hooks";
import { logoutUser } from "@/lib/authSlice";
import { getMeService } from "@/lib/authService";

const PATH_TITLES: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/daily-pulse": "Daily Pulse",
  "/dashboard/import": "Import Products",
  "/dashboard/analysis": "Product Analysis",
  "/dashboard/watchlist": "Watchlist",
  "/dashboard/orders": "Orders",
  "/dashboard/inventory": "Inventory & Reorder",
  "/dashboard/suppliers": "Suppliers",
  "/dashboard/notifications": "Notifications",
  "/dashboard/support": "Support",
  "/dashboard/settings": "Settings",
};

const HAS_UNREAD = true;

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const title = PATH_TITLES[pathname] ?? "Dashboard";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    getMeService()
      .then((user) => {
        setFirstName(user.first_name ?? "");
        setLastName(user.last_name ?? "");
      })
      .catch(() => {
        setFirstName("");
        setLastName("");
      });
  }, []);

  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <header className="bg-card-bg border-b border-border h-16 w-full px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 text-muted hover:text-heading transition-colors rounded-lg hover:bg-section-bg cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-heading font-semibold text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/import">
          <Button variant="primary" size="sm">
            Import Products
          </Button>
        </Link>

        <div className="w-px h-6 bg-border" />

        <Link
          href="/dashboard/notifications"
          className="relative p-1.5 text-muted hover:text-heading transition-colors rounded-lg hover:bg-section-bg cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {HAS_UNREAD && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose rounded-full" />
          )}
        </Link>

        <Link
          href="/dashboard/settings"
          className="w-8 h-8 rounded-full bg-primary-light text-primary text-sm font-semibold flex items-center justify-center select-none cursor-pointer"
        >
          {firstName.trim() || lastName.trim() ? (
            initials
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="p-1.5 text-muted hover:text-rose transition-colors rounded-lg hover:bg-section-bg cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
