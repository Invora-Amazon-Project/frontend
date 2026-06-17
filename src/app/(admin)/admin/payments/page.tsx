"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterTabs from "@/components/admin/FilterTabs";
import type { PaymentRecord, PaymentStatus } from "@/types";

const mockPayments: PaymentRecord[] = [
  { id: "PAY-001", userId: "U-2", userName: "Marcus Chen", plan: "team", amount: 149, status: "paid", date: "2025-06-01", invoiceUrl: "#", nextBillingDate: "2025-07-01" },
  { id: "PAY-002", userId: "U-7", userName: "Chloe Dupont", plan: "pro", amount: 49, status: "paid", date: "2025-06-01", invoiceUrl: "#", nextBillingDate: "2025-07-01" },
  { id: "PAY-003", userId: "U-4", userName: "James Whitmore", plan: "pro", amount: 49, status: "failed", date: "2025-06-01", invoiceUrl: undefined, nextBillingDate: undefined },
  { id: "PAY-004", userId: "U-6", userName: "Omar Hassan", plan: "team", amount: 149, status: "paid", date: "2025-06-01", invoiceUrl: "#", nextBillingDate: "2025-07-01" },
  { id: "PAY-005", userId: "U-1", userName: "Sarah Johnson", plan: "pro", amount: 49, status: "paid", date: "2025-06-01", invoiceUrl: "#", nextBillingDate: "2025-07-01" },
  { id: "PAY-006", userId: "U-9", userName: "Tomáš Novák", plan: "starter", amount: 19, status: "refunded", date: "2025-05-28", invoiceUrl: "#", nextBillingDate: undefined },
  { id: "PAY-007", userId: "U-10", userName: "Yuki Tanaka", plan: "team", amount: 149, status: "paid", date: "2025-05-01", invoiceUrl: "#", nextBillingDate: "2025-06-01" },
  { id: "PAY-008", userId: "U-11", userName: "Amara Diallo", plan: "starter", amount: 19, status: "failed", date: "2025-05-15", invoiceUrl: undefined, nextBillingDate: undefined },
  { id: "PAY-009", userId: "U-12", userName: "Carlos Ruiz", plan: "pro", amount: 49, status: "paid", date: "2025-05-01", invoiceUrl: "#", nextBillingDate: "2025-06-01" },
  { id: "PAY-010", userId: "U-13", userName: "Nina Petrova", plan: "team", amount: 149, status: "refunded", date: "2025-04-20", invoiceUrl: "#", nextBillingDate: undefined },
];

const TABS = ["All", "Paid", "Failed", "Refunded"];

const tabStatusMap: Record<string, PaymentStatus | null> = {
  All: null,
  Paid: "paid",
  Failed: "failed",
  Refunded: "refunded",
};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = mockPayments.filter((p) => {
    const tabStatus = tabStatusMap[activeTab];
    const matchesTab = tabStatus === null || p.status === tabStatus;
    const matchesFrom = !fromDate || p.date >= fromDate;
    const matchesTo = !toDate || p.date <= toDate;
    return matchesTab && matchesFrom && matchesTo;
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Revenue"
          value="$12,480"
          subtitle="June 2025"
          color="mint"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 5v1m0 6v1M7 7.5A2 2 0 0 1 9 6h.5a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 0 0 3H9.5A2 2 0 0 0 11.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          title="Failed This Month"
          value="5"
          subtitle="Needs attention"
          color="rose"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5.5 11l1.5-1.5L5.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <StatCard
          title="Active Trials"
          value="23"
          subtitle="Ends within 7 days: 8"
          color="peach"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex items-center gap-2">
          <label className="text-muted text-xs">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body outline-none focus:border-primary transition-colors"
          />
          <label className="text-muted text-xs">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-section-bg">
              <th className="text-left px-5 py-3 text-muted font-medium">User</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Plan</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Status</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Date</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Next Billing</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-heading font-medium">{p.userName}</p>
                  <p className="text-muted text-xs mt-0.5">{p.userId}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="bg-primary-light text-primary text-xs rounded-full px-2.5 py-0.5 capitalize">
                    {p.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-heading font-medium">${p.amount}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                  {new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                  {p.nextBillingDate
                    ? new Date(p.nextBillingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : <span className="italic">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Invoice
                    </Button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose hover:bg-rose-bg transition-colors">
                      Refund
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">
                  No payments match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
