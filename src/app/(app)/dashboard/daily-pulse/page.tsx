"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import AlertCard from "@/components/dashboard/AlertCard";
import EmptyState from "@/components/dashboard/EmptyState";
import type { DailyPulseAlert } from "@/types";

// TODO: Replace with real API call — GET /daily-pulse/alerts

const MOCK_ALERTS: DailyPulseAlert[] = [
  {
    id: "a1",
    signal: "stock_low_alert",
    productName: "OXO Good Grips 2-Piece Silicone Head Tong Set",
    asin: "B08XK3LMND",
    description: "Stock dropped to 14 units. At current sales velocity, you have ~5 days of inventory remaining.",
    createdAt: "2026-07-06T08:00:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p1",
  },
  {
    id: "a2",
    signal: "stock_low_alert",
    productName: "Nomader Collapsible Sports Water Bottle 22oz",
    asin: "B08ZTLMKPD",
    description: "Only 8 units left in FBA. Reorder lead time is 18 days — act now to avoid stockout.",
    createdAt: "2026-07-06T08:00:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p5",
  },
  {
    id: "a3",
    signal: "reorder_candidate",
    productName: "Royal Craft Wood Organic Bamboo Cutting Board",
    asin: "B07THGP5WK",
    description: "Consistent sales for 30 days. Based on velocity and lead time, optimal reorder point reached.",
    createdAt: "2026-07-05T08:00:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p2",
  },
  {
    id: "a4",
    signal: "watchlist_opportunity",
    productName: "Brieftons 5-Blade Spiralizer Heavy Duty",
    asin: "B00GRIR87U",
    description: "Price increased by 12% to $31.99. Your target ROI of 50% is now achievable. Consider ordering.",
    createdAt: "2026-07-06T06:30:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p10",
  },
  {
    id: "a5",
    signal: "watchlist_opportunity",
    productName: "Riveira Wooden Spoon Set 6-Piece Natural Teak",
    asin: "B07KF16JZL",
    description: "FBA seller count dropped from 4 to 2. Competition thinning — buy box win rate likely to increase.",
    createdAt: "2026-07-06T07:15:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p8",
  },
  {
    id: "a6",
    signal: "watchlist_opportunity",
    productName: "Lodge Cast Iron Skillet 10.25 Inch",
    asin: "B00G2XGC88",
    description: "New product match from your latest import. Score: 88 — Strong Opportunity. Price window is open.",
    createdAt: "2026-07-06T08:00:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p_new",
  },
  {
    id: "a7",
    signal: "profit_drop_alert",
    productName: "OXO Good Grips 2-Piece Silicone Head Tong Set",
    asin: "B08XK3LMND",
    description: "Buy box price fell from $18.99 to $15.49. Your ROI dropped from 40% to 24%. Review pricing strategy.",
    createdAt: "2026-07-06T05:00:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p1",
  },
  {
    id: "a8",
    signal: "amazon_risk_alert",
    productName: "Royal Craft Wood Organic Bamboo Cutting Board",
    asin: "B07THGP5WK",
    description: "Amazon went active on this listing. FBA seller competition increased — monitor buy box share closely.",
    createdAt: "2026-07-06T04:30:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p2",
  },
  {
    id: "a9",
    signal: "re_analysis_reminder",
    productName: "Riveira Wooden Spoon Set 6-Piece Natural Teak",
    asin: "B07KF16JZL",
    description: "Last analyzed 7 days ago. Market conditions may have changed — a fresh analysis is recommended.",
    createdAt: "2026-07-06T08:00:00Z",
    isSnoozed: false,
    isDismissed: false,
    productId: "p8",
  },
];

type TabKey = "all" | "stock" | "opportunities" | "risk" | "reminders";

interface SectionConfig {
  key: string;
  label: string;
  emoji: string;
  signals: DailyPulseAlert["signal"][];
}

const SECTIONS: SectionConfig[] = [
  { key: "stock",         label: "Stock & Reorder",    emoji: "🔴", signals: ["stock_low_alert", "reorder_candidate"] },
  { key: "opportunities", label: "Opportunities",       emoji: "🟢", signals: ["watchlist_opportunity"] },
  { key: "risk",          label: "Risk Alerts",         emoji: "🟠", signals: ["profit_drop_alert", "amazon_risk_alert"] },
  { key: "reminders",     label: "Reminders",           emoji: "🔵", signals: ["re_analysis_reminder"] },
];

function tabMatchesSignal(tab: TabKey, signal: DailyPulseAlert["signal"]): boolean {
  switch (tab) {
    case "stock":         return signal === "stock_low_alert" || signal === "reorder_candidate";
    case "opportunities": return signal === "watchlist_opportunity";
    case "risk":          return signal === "profit_drop_alert" || signal === "amazon_risk_alert";
    case "reminders":     return signal === "re_analysis_reminder";
    default:              return true;
  }
}

export default function DailyPulsePage() {
  const [alerts, setAlerts] = useState<DailyPulseAlert[]>(MOCK_ALERTS);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [pendingDismiss, setPendingDismiss] = useState<string | null>(null);

  const visibleAlerts = alerts.filter(
    (a) => !a.isDismissed && tabMatchesSignal(activeTab, a.signal)
  );

  const snoozedIds = new Set(alerts.filter((a) => a.isSnoozed).map((a) => a.id));

  const countForTab = (tab: TabKey) =>
    alerts.filter((a) => !a.isDismissed && tabMatchesSignal(tab, a.signal)).length;

  const handleAction = (action: string, alertId: string) => {
    if (action === "dismiss") {
      setPendingDismiss(alertId);
      return;
    }
    if (action === "snooze") {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isSnoozed: true } : a))
      );
      return;
    }
  };

  const confirmDismiss = () => {
    if (!pendingDismiss) return;
    setAlerts((prev) =>
      prev.map((a) => (a.id === pendingDismiss ? { ...a, isDismissed: true } : a))
    );
    setPendingDismiss(null);
  };

  const dismissAllRead = () => {
    setAlerts((prev) =>
      prev.map((a) => (a.isSnoozed ? a : { ...a, isDismissed: true }))
    );
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all",          label: `All (${countForTab("all")})` },
    { key: "stock",        label: `Stock Alerts (${countForTab("stock")})` },
    { key: "opportunities",label: `Opportunities (${countForTab("opportunities")})` },
    { key: "risk",         label: `Risk Alerts (${countForTab("risk")})` },
    { key: "reminders",    label: `Reminders (${countForTab("reminders")})` },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-heading font-semibold text-2xl">Daily Pulse</h1>
          <p className="text-muted text-sm mt-1">Your automated sourcing assistant. Updated daily.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted text-xs">Last updated: today at 08:00</span>
          <Button variant="ghost" size="sm" onClick={dismissAllRead}>
            Dismiss all read
          </Button>
        </div>
      </div>

      {/* Confirm dismiss modal */}
      {pendingDismiss && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setPendingDismiss(null)}>
          <div className="bg-card-bg border border-border rounded-xl p-6 w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-heading font-semibold text-base mb-2">Dismiss alert?</h3>
            <p className="text-muted text-sm mb-5">This alert will be removed from your Daily Pulse. You can always re-analyze the product manually.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setPendingDismiss(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={confirmDismiss}>Dismiss</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-5 overflow-x-auto">
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

      {/* Content */}
      {visibleAlerts.length === 0 ? (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          title="All caught up!"
          description="No alerts right now. Daily Pulse will notify you when something changes."
        />
      ) : (
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const sectionAlerts = visibleAlerts.filter((a) =>
              section.signals.includes(a.signal)
            );
            if (sectionAlerts.length === 0) return null;

            // Snoozed alerts go to the bottom of each section
            const unsnoozed = sectionAlerts.filter((a) => !snoozedIds.has(a.id));
            const snoozed   = sectionAlerts.filter((a) =>  snoozedIds.has(a.id));
            const ordered   = [...unsnoozed, ...snoozed];

            return (
              <div key={section.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-heading">
                    {section.emoji} {section.label}
                  </span>
                  <span className="bg-primary-light text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {sectionAlerts.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {ordered.map((alert) => (
                    <div key={alert.id} className={snoozedIds.has(alert.id) ? "opacity-50" : ""}>
                      {snoozedIds.has(alert.id) && (
                        <p className="text-muted text-xs mb-1 ml-1">Snoozed</p>
                      )}
                      <AlertCard alert={alert} onAction={handleAction} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
