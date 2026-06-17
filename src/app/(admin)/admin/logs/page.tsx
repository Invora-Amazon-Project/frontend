"use client";

import { useState } from "react";
import FilterTabs from "@/components/admin/FilterTabs";
import type { LogEntry, LogType, LogSeverity } from "@/types";

const mockLogs: LogEntry[] = [
  { id: "L-001", timestamp: "2025-06-15T08:02:11Z", userId: "U-1", userName: "Sarah Johnson", type: "login", description: "Successful login from Chrome/Windows", ipAddress: "185.23.44.12", severity: "info" },
  { id: "L-002", timestamp: "2025-06-15T08:15:34Z", userId: "U-4", userName: "James Whitmore", type: "login", description: "Failed login attempt — wrong password (3rd attempt)", ipAddress: "91.108.4.56", severity: "warning" },
  { id: "L-003", timestamp: "2025-06-15T09:00:00Z", userId: "U-2", userName: "Marcus Chen", type: "payment", description: "Payment processed — Pro plan $49/month via Stripe", ipAddress: "178.22.11.3", severity: "info" },
  { id: "L-004", timestamp: "2025-06-15T09:11:22Z", userId: "U-3", userName: "James Whitmore", type: "payment", description: "Payment failed — card declined (Stripe code: card_declined)", ipAddress: "91.108.4.56", severity: "error" },
  { id: "L-005", timestamp: "2025-06-15T09:45:07Z", userId: "U-6", userName: "Omar Hassan", type: "credit", description: "Admin credited 300 credits manually — reason: top-up request", ipAddress: "10.0.0.1", severity: "info" },
  { id: "L-006", timestamp: "2025-06-15T10:02:55Z", userId: "U-2", userName: "Marcus Chen", type: "import", description: "Bulk ASIN import completed — 400 products, 12 failed rows", ipAddress: "178.22.11.3", severity: "warning" },
  { id: "L-007", timestamp: "2025-06-15T10:30:18Z", userId: "U-1", userName: "Sarah Johnson", type: "analysis", description: "Product analysis run — ASIN B09XK2 scored 87 (Strong Opportunity)", ipAddress: "185.23.44.12", severity: "info" },
  { id: "L-008", timestamp: "2025-06-15T11:04:33Z", userId: "U-3", userName: "Priya Nair", type: "amazon_api", description: "Amazon SP-API call failed — rate limit exceeded (429)", ipAddress: "204.11.56.78", severity: "error" },
  { id: "L-009", timestamp: "2025-06-15T11:22:49Z", userId: undefined, userName: undefined, type: "error", description: "Unhandled exception in /api/products/bulk-score — TypeError: Cannot read property of undefined", ipAddress: "internal", severity: "error" },
  { id: "L-010", timestamp: "2025-06-15T12:00:01Z", userId: "admin", userName: "Admin", type: "admin_action", description: "Promo code SUMMER25 created — 25% off, limit 100 uses, expires 2025-08-31", ipAddress: "10.0.0.1", severity: "info" },
  { id: "L-011", timestamp: "2025-06-15T12:34:17Z", userId: "U-8", userName: "Ravi Patel", type: "security", description: "Account blocked after 5 consecutive failed login attempts", ipAddress: "103.44.22.9", severity: "warning" },
  { id: "L-012", timestamp: "2025-06-15T13:10:05Z", userId: "U-7", userName: "Chloe Dupont", type: "analysis", description: "Daily Pulse report generated — 14 watchlist products updated", ipAddress: "92.18.77.4", severity: "info" },
];

const TABS = ["All", "Login", "Payment", "Credit", "Import", "Analysis", "Amazon API", "Error", "Admin Action", "Security"];

const tabTypeMap: Record<string, LogType | null> = {
  All: null,
  Login: "login",
  Payment: "payment",
  Credit: "credit",
  Import: "import",
  Analysis: "analysis",
  "Amazon API": "amazon_api",
  Error: "error",
  "Admin Action": "admin_action",
  Security: "security",
};

const severityDot: Record<LogSeverity, string> = {
  info: "bg-mint",
  warning: "bg-peach",
  error: "bg-rose",
};

const severityLabel: Record<LogSeverity, string> = {
  info: "Info",
  warning: "Warning",
  error: "Error",
};

function buildPayload(log: LogEntry): string {
  return JSON.stringify(
    {
      id: log.id,
      timestamp: log.timestamp,
      type: log.type,
      severity: log.severity,
      description: log.description,
      userId: log.userId ?? null,
      userName: log.userName ?? null,
      ipAddress: log.ipAddress ?? null,
    },
    null,
    2
  );
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockLogs.filter((log) => {
    const tabType = tabTypeMap[activeTab];
    const matchesTab = tabType === null || log.type === tabType;
    const logDate = log.timestamp.slice(0, 10);
    const matchesFrom = !fromDate || logDate >= fromDate;
    const matchesTo = !toDate || logDate <= toDate;
    return matchesTab && matchesFrom && matchesTo;
  });

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-5">
      <h1 className="text-heading font-semibold text-xl">Logs</h1>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="overflow-x-auto">
          <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
              <th className="text-left px-5 py-3 text-muted font-medium">Timestamp</th>
              <th className="text-left px-5 py-3 text-muted font-medium">User</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Type</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Description</th>
              <th className="text-left px-5 py-3 text-muted font-medium">IP Address</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Severity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <>
                  <tr
                    key={log.id}
                    onClick={() => toggleExpand(log.id)}
                    className={`border-b border-border cursor-pointer transition-colors ${isExpanded ? "bg-section-bg" : "hover:bg-section-bg/50"}`}
                  >
                    <td className="px-5 py-3 text-muted text-xs font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
                      {new Date(log.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-5 py-3">
                      {log.userName ? (
                        <>
                          <p className="text-body font-medium">{log.userName}</p>
                          <p className="text-muted text-xs">{log.userId}</p>
                        </>
                      ) : (
                        <span className="text-muted text-xs italic">System</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-section-bg text-body text-xs rounded px-2 py-0.5">
                        {log.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-body max-w-[300px]">
                      <span className="line-clamp-1">{log.description}</span>
                    </td>
                    <td className="px-5 py-3 text-muted text-xs font-mono">
                      {log.ipAddress ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${severityDot[log.severity]}`} />
                        <span className="text-body text-xs">{severityLabel[log.severity]}</span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${log.id}-expanded`} className="border-b border-border bg-section-bg">
                      <td colSpan={6} className="px-5 py-3">
                        <pre className="bg-page-bg border border-border rounded-lg p-3 text-xs font-mono text-body overflow-x-auto whitespace-pre">
                          {buildPayload(log)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                  No log entries match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
