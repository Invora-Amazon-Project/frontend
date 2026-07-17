"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCurrentWorkspace } from "@/lib/workspaceSlice";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { current: workspace, loading: workspaceLoading } = useAppSelector((s) => s.workspace);

  // Default to open on desktop (lg+), closed on mobile/tablet
  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    if (!workspace && !workspaceLoading) dispatch(fetchCurrentWorkspace());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile/tablet backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      <div
        className={`flex flex-col flex-1 overflow-hidden transition-[filter] duration-300 ${
          sidebarOpen ? "blur-sm lg:blur-none pointer-events-none lg:pointer-events-auto" : ""
        }`}
      >
        <DashboardHeader onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto bg-page-bg p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
