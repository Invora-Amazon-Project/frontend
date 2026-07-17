"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import AlertCard from "@/components/dashboard/AlertCard";
import type { DailyPulseAlert, ImportSession, InventoryItem } from "@/types";
import { getUserSubscription, type UserSubscription } from "@/lib/services/userSubscriptionsService";
import { getOrders, type OrderRecord } from "@/lib/services/ordersService";
import { getMeService } from "@/lib/authService";
import { useAppSelector } from "@/lib/hooks";

// TODO: Replace with real API call — GET /dashboard/summary

const MOCK_ALERTS: DailyPulseAlert[] = [
  {
    id: "a1",
    signal: "stock_low_alert",
    productName: "Silicone Kitchen Tongs Set",
    asin: "B08XK3LMND",
    description: "Only 6 units remaining. Estimated stock-out in 4 days based on current velocity.",
    createdAt: "2026-07-06T08:15:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p1",
  },
  {
    id: "a2",
    signal: "watchlist_opportunity",
    productName: "Bamboo Cutting Board Large",
    asin: "B07THGP5WK",
    description: "Amazon has gone out of stock. Buy Box is now open — ROI at 54%.",
    createdAt: "2026-07-06T07:40:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p2",
  },
  {
    id: "a3",
    signal: "profit_drop_alert",
    productName: "Stainless Steel Mixing Bowls 5-Pack",
    asin: "B09NQZRVKP",
    description: "Buy Box price dropped by $3.20. Margin fell from 28% to 19%.",
    createdAt: "2026-07-06T06:55:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p3",
  },
];

const MOCK_IMPORTS: ImportSession[] = [
  {
    id: "i1",
    supplierName: "Guangzhou HomeGoods Co.",
    fileName: "summer_catalog_2026.xlsx",
    uploadedAt: "2026-07-05T14:22:00Z",
    status: "completed",
    totalProducts: 312,
    readProducts: 308,
    errorRows: 4,
    duplicates: 11,
    matchedByUpc: 241,
    matchedByName: 57,
    unmatched: 10,
    creditsUsed: 308,
  },
  {
    id: "i2",
    supplierName: "TopWholesale EU",
    fileName: "kitchen_items_jul.csv",
    uploadedAt: "2026-07-04T09:10:00Z",
    status: "partial",
    totalProducts: 180,
    readProducts: 162,
    errorRows: 18,
    duplicates: 5,
    matchedByUpc: 130,
    matchedByName: 22,
    unmatched: 10,
    creditsUsed: 162,
  },
  {
    id: "i3",
    supplierName: "NovaTrade Wholesale",
    fileName: "outdoor_products_v2.xlsx",
    uploadedAt: "2026-07-02T16:45:00Z",
    status: "completed",
    totalProducts: 95,
    readProducts: 95,
    errorRows: 0,
    duplicates: 3,
    matchedByUpc: 88,
    matchedByName: 4,
    unmatched: 3,
    creditsUsed: 95,
  },
];

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "inv1",
    productName: "Silicone Kitchen Tongs Set",
    asin: "B08XK3LMND",
    currentStock: 6,
    minimumStockLevel: 30,
    estimatedStockEndDate: "2026-07-10",
    isReorderCandidate: true,
    roi: 38,
  },
  {
    id: "inv2",
    productName: "Mesh Laundry Bags 6-Pack",
    asin: "B07QQMVWWG",
    currentStock: 12,
    minimumStockLevel: 40,
    estimatedStockEndDate: "2026-07-14",
    isReorderCandidate: true,
    roi: 44,
  },
  {
    id: "inv3",
    productName: "Collapsible Water Bottle 750ml",
    asin: "B08ZTLMKPD",
    currentStock: 9,
    minimumStockLevel: 25,
    estimatedStockEndDate: "2026-07-12",
    isReorderCandidate: true,
    roi: 51,
  },
];

const OPPORTUNITY_FEED = [
  { name: "Bamboo Cutting Board Large", change: "Amazon out of stock — Buy Box open", badge: "Opportunity", time: "2h ago" },
  { name: "Cast Iron Skillet 10 inch", change: "ROI increased to 42% after price drop", badge: "ROI Up", time: "4h ago" },
  { name: "Silicone Baking Mat Set", change: "FBA seller count dropped from 9 → 4", badge: "Less Competition", time: "5h ago" },
  { name: "Stainless Steel Water Bottle", change: "Buy Box price up $4.50 this week", badge: "Price Up", time: "8h ago" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function matchRate(session: ImportSession) {
  const matched = session.matchedByUpc + session.matchedByName;
  return Math.round((matched / session.readProducts) * 100);
}

function ImportStatusBadge({ status }: { status: ImportSession["status"] }) {
  const styles: Record<ImportSession["status"], string> = {
    completed: "bg-mint-bg text-mint",
    partial: "bg-peach-bg text-peach",
    processing: "bg-primary-light text-primary",
    failed: "bg-rose-bg text-rose",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function DashboardPage() {
  const workspaceId = useAppSelector((s) => s.workspace.current?.id);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    getUserSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, []);

  useEffect(() => {
    getMeService()
      .then((user) => {
        const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
        setUserName(name);
      })
      .catch(() => setUserName(""));
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    getOrders(workspaceId)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [workspaceId]);

  const draftCount = orders.filter((o) => o.status === "DRAFT").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  const handleAlertAction = (action: string, alertId: string) => {
    // TODO: Replace with real API call — POST /alerts/:id/:action
    console.log("alert action:", action, alertId);
  };

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-heading font-semibold text-2xl">
          Good morning{userName ? `, ${userName}` : ""} 👋
        </h1>
        <p className="text-muted text-sm mt-1">Here&apos;s what needs your attention today.</p>
      </div>

      {/* Block 1 — Today's Actions */}
      <div className="bg-card-bg border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-heading font-semibold text-base">Today&apos;s Actions</h2>
            <span className="bg-rose-bg text-rose text-xs font-medium px-2 py-0.5 rounded-full">
              3 alerts
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_ALERTS.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onAction={handleAlertAction} />
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Link href="/dashboard/daily-pulse" className="text-primary text-sm hover:underline">
            View all alerts →
          </Link>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Opportunity Feed */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-heading font-semibold text-base">Opportunity Feed</h2>
                <span className="flex items-center gap-1 text-mint text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-mint inline-block" />
                  Live
                </span>
              </div>
              <Link href="/dashboard/watchlist" className="text-primary text-sm hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {OPPORTUNITY_FEED.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body text-sm font-medium truncate">{item.name}</p>
                    <p className="text-muted text-xs mt-0.5">{item.change}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="bg-mint-bg text-mint text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {item.badge}
                    </span>
                    <span className="text-muted text-xs">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Imports */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading font-semibold text-base">Recent Imports</h2>
              <Link href="/dashboard/import">
                <Button variant="outline" size="sm">Import new list →</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_IMPORTS.map((session) => (
                <div key={session.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body text-sm font-medium truncate">{session.supplierName}</p>
                    <p className="text-muted text-xs mt-0.5 truncate">{session.fileName}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {session.readProducts} products · {matchRate(session)}% matched
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <ImportStatusBadge status={session.status} />
                    <span className="text-muted text-xs">{formatDate(session.uploadedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Inventory & Reorder */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading font-semibold text-base">Inventory &amp; Reorder</h2>
              <Link href="/dashboard/inventory" className="text-primary text-sm hover:underline">
                View all inventory →
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_INVENTORY.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-muted text-xs mt-0.5 font-mono">{item.asin}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-rose-bg text-rose text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.currentStock} left
                    </span>
                    <Link href="/dashboard/orders">
                      <Button variant="outline" size="sm">Reorder</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom half-half row */}
          <div className="grid grid-cols-2 gap-6">

            {/* Orders mini widget */}
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h2 className="text-heading font-semibold text-base mb-4">Orders</h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs">Draft</span>
                  <span className="bg-peach-bg text-peach text-sm font-bold px-2 py-0.5 rounded-lg">{draftCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs">Pending</span>
                  <span className="bg-primary-light text-primary text-sm font-bold px-2 py-0.5 rounded-lg">{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs">Completed</span>
                  <span className="bg-mint-bg text-mint text-sm font-bold px-2 py-0.5 rounded-lg">{completedCount}</span>
                </div>
              </div>

              <div className="mt-4">
                <Link href="/dashboard/orders" className="text-primary text-sm hover:underline">
                  View orders →
                </Link>
              </div>
            </div>

            {/* Credits & Plan widget */}
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-heading font-semibold text-base">Plan</h2>
                <span className="bg-primary-light text-primary rounded-full px-3 py-1 text-xs font-medium capitalize">
                  {subscription ? `${subscription.plan.name} Plan` : "—"}
                </span>
              </div>

              <p className="text-muted text-xs mb-1">Credits Used</p>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-body text-xs font-medium">420 / 1,000</span>
              </div>
              <div className="bg-section-bg h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }} />
              </div>

              <p className="text-peach text-xs mt-3">Trial ends in 7 days</p>

              <Link
                href="/manage-plan"
                onClick={() => sessionStorage.setItem("manage-plan-from", "/dashboard")}
                className="block mt-3"
              >
                <Button variant="primary" size="sm" className="w-full">
                  Upgrade Plan
                </Button>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
