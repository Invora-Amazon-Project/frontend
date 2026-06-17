"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type JobStatus = "pending" | "dismissed";

interface FailedJob {
  id: string;
  jobType: string;
  errorMessage: string;
  timestamp: string;
  status: JobStatus;
}

const initialJobs: FailedJob[] = [
  { id: "J-001", jobType: "ASIN Analysis", errorMessage: "TypeError: Cannot read property 'price' of undefined", timestamp: "2025-06-15T11:04:33Z", status: "pending" },
  { id: "J-002", jobType: "Daily Pulse Report", errorMessage: "Amazon SP-API 429 Too Many Requests", timestamp: "2025-06-15T11:22:11Z", status: "pending" },
  { id: "J-003", jobType: "Bulk Import Score", errorMessage: "Database write timeout after 30s", timestamp: "2025-06-15T12:05:48Z", status: "pending" },
  { id: "J-004", jobType: "Supplier Match", errorMessage: "External API returned 503 Service Unavailable", timestamp: "2025-06-15T13:01:09Z", status: "pending" },
];

const rateLimits = [
  { label: "Catalog API", pct: 67, fillClass: "bg-peach" },
  { label: "Pricing API", pct: 34, fillClass: "bg-mint" },
  { label: "Inventory API", pct: 89, fillClass: "bg-rose" },
];

function StatusDot({ color }: { color: "mint" | "peach" | "rose" | "muted" }) {
  const cls: Record<string, string> = {
    mint: "bg-mint",
    peach: "bg-peach",
    rose: "bg-rose",
    muted: "bg-muted",
  };
  return <span className={`w-3 h-3 rounded-full shrink-0 ${cls[color]}`} />;
}

export default function MonitoringPage() {
  const [jobs, setJobs] = useState<FailedJob[]>(initialJobs);

  const activeJobs = jobs.filter((j) => j.status === "pending");

  function dismissJob(id: string) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "dismissed" } : j)));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-semibold text-xl">Monitoring</h1>
        <span className="text-muted text-xs italic">Auto-refreshes every 60s</span>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Amazon SP-API */}
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <p className="text-heading font-semibold text-sm mb-3">Amazon SP-API</p>
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="mint" />
            <span className="text-mint font-semibold text-sm">Connected</span>
          </div>
          <p className="text-muted text-xs">Last ping: 2 min ago</p>
        </div>

        {/* Worker Queue */}
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <p className="text-heading font-semibold text-sm mb-3">Worker Queue</p>
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="peach" />
            <span className="text-heading font-semibold text-sm">14 jobs pending</span>
          </div>
          <p className="text-muted text-xs">3 workers active</p>
        </div>

        {/* Daily Analyses */}
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <p className="text-heading font-semibold text-sm mb-3">Daily Analyses</p>
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="mint" />
            <span className="text-heading font-semibold text-sm">842 today</span>
          </div>
          <p className="text-muted text-xs">↑ 12% vs yesterday</p>
        </div>

        {/* Error Rate */}
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <p className="text-heading font-semibold text-sm mb-3">Error Rate</p>
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="peach" />
            <span className="text-heading font-semibold text-sm">1.8%</span>
          </div>
          <p className="text-muted text-xs">Last 24 hours</p>
        </div>
      </div>

      {/* Rate Limit Section */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-sm mb-5">Amazon SP-API Rate Limit Usage</h2>
        <div className="space-y-4">
          {rateLimits.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-body text-sm">{item.label}</span>
                <span className="text-muted text-xs font-medium">{item.pct}% used</span>
              </div>
              <div className="w-full h-2 bg-section-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.fillClass}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failed Jobs Section */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-heading font-semibold text-sm">Failed Jobs</h2>
          <span className="bg-rose-bg text-rose text-xs font-semibold rounded-full px-2 py-0.5">
            {activeJobs.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Job Type</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Error Message</th>
                <th className="text-left px-5 py-3 text-muted font-medium whitespace-nowrap">Timestamp</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job) => (
                <tr key={job.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5 text-heading font-medium whitespace-nowrap">{job.jobType}</td>
                  <td className="px-5 py-3.5 text-body max-w-[360px]">
                    <span className="line-clamp-1 font-mono text-xs">{job.errorMessage}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs font-mono whitespace-nowrap">
                    {new Date(job.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
                    {new Date(job.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Retry</Button>
                      <Button variant="ghost" size="sm" onClick={() => dismissJob(job.id)}>Dismiss</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeJobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted text-sm">
                    No failed jobs — all systems running normally.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
