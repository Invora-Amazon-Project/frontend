"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterTabs from "@/components/admin/FilterTabs";
import type { Ticket, TicketDepartment, TicketPriority, TicketStatus } from "@/types";

export const mockTickets: Ticket[] = [
  { id: "TK-0042", subject: "Cannot connect Amazon seller account", description: "I've been trying to link my Amazon seller account for 3 days but keep getting an auth error.", userId: "U-1", userName: "Sarah Johnson", department: "amazon_connection", priority: "high", status: "open", createdAt: "2025-06-10T09:14:00Z", assignedTo: undefined },
  { id: "TK-0041", subject: "Incorrect credit deduction on Pro plan", description: "My credits dropped by 200 after running a single analysis — plan should only deduct 10.", userId: "U-2", userName: "Marcus Chen", department: "billing", priority: "critical", status: "in_progress", createdAt: "2025-06-09T14:32:00Z", assignedTo: "Ali Yıldız" },
  { id: "TK-0040", subject: "Export to Excel not working", description: "The Export button shows a spinner but never downloads the file.", userId: "U-3", userName: "Priya Nair", department: "technical_support", priority: "medium", status: "pending", createdAt: "2025-06-08T11:05:00Z", assignedTo: "Deniz Kara" },
  { id: "TK-0039", subject: "Request to upgrade trial to Pro manually", description: "My card keeps failing but I'd like to pay via bank transfer instead.", userId: "U-4", userName: "James Whitmore", department: "account", priority: "low", status: "open", createdAt: "2025-06-07T16:48:00Z", assignedTo: undefined },
  { id: "TK-0038", subject: "Product analysis scores seem wrong", description: "The opportunity score for ASIN B09XYZ is 92 but the product has only 4 reviews.", userId: "U-5", userName: "Lena Fischer", department: "product_analysis", priority: "high", status: "assigned", createdAt: "2025-06-06T08:20:00Z", assignedTo: "Berk Şahin" },
  { id: "TK-0037", subject: "Dashboard is blank after login", description: "After logging in I see a white screen with no content. Tried Chrome and Firefox.", userId: "U-6", userName: "Omar Hassan", department: "technical_support", priority: "critical", status: "in_progress", createdAt: "2025-06-05T13:55:00Z", assignedTo: "Ali Yıldız" },
  { id: "TK-0036", subject: "How do I cancel my subscription?", description: "I need to downgrade to free tier before my next billing date.", userId: "U-7", userName: "Chloe Dupont", department: "billing", priority: "low", status: "closed", createdAt: "2025-06-04T10:10:00Z", assignedTo: "Deniz Kara" },
  { id: "TK-0035", subject: "Supplier contact info not saved", description: "I add a supplier and fill in contact details but they disappear after refresh.", userId: "U-8", userName: "Ravi Patel", department: "other", priority: "medium", status: "fixed", createdAt: "2025-06-03T15:30:00Z", assignedTo: "Berk Şahin" },
];

const TABS = ["All", "Open", "In Progress", "Pending", "Closed"];

const tabStatusMap: Record<string, TicketStatus | null> = {
  All: null,
  Open: "open",
  "In Progress": "in_progress",
  Pending: "pending",
  Closed: "closed",
};

const priorityStyles: Record<TicketPriority, string> = {
  critical: "bg-rose-bg text-rose",
  high: "bg-peach-bg text-peach",
  medium: "bg-primary-light text-primary",
  low: "bg-section-bg text-muted",
};

const departmentLabels: Record<TicketDepartment, string> = {
  technical_support: "Technical Support",
  billing: "Billing",
  account: "Account",
  product_analysis: "Product Analysis",
  amazon_connection: "Amazon Connection",
  other: "Other",
};

const allDepartments: TicketDepartment[] = [
  "technical_support", "billing", "account", "product_analysis", "amazon_connection", "other",
];
const allPriorities: TicketPriority[] = ["critical", "high", "medium", "low"];

export default function TicketsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const openCount = mockTickets.filter((t) => t.status === "open").length;

  const filtered = mockTickets.filter((t) => {
    const tabStatus = tabStatusMap[activeTab];
    const matchesTab = tabStatus === null || t.status === tabStatus;
    const matchesDept = deptFilter === "all" || t.department === deptFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesTab && matchesDept && matchesPriority;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-heading font-semibold text-xl">Ticket Management</h1>
        <span className="bg-rose-bg text-rose rounded-full px-2 py-0.5 text-xs font-medium">
          {openCount} open
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Departments</option>
            {allDepartments.map((d) => (
              <option key={d} value={d}>{departmentLabels[d]}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Priorities</option>
            {allPriorities.map((p) => (
              <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-section-bg">
              <th className="text-left px-4 py-3 text-muted font-medium">ID</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Subject</th>
              <th className="text-left px-4 py-3 text-muted font-medium">User</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Department</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Priority</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Created</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Assigned To</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                <td className="px-4 py-3.5 text-muted text-xs font-mono">#{ticket.id}</td>
                <td className="px-4 py-3.5 max-w-[200px]">
                  <p className="text-heading font-medium truncate">{ticket.subject}</p>
                </td>
                <td className="px-4 py-3.5 text-body">{ticket.userName}</td>
                <td className="px-4 py-3.5 text-muted text-xs">{departmentLabels[ticket.department]}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityStyles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3.5 text-muted text-xs whitespace-nowrap">
                  {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3.5 text-body text-sm">
                  {ticket.assignedTo ?? <span className="text-muted italic">Unassigned</span>}
                </td>
                <td className="px-4 py-3.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted text-sm">
                  No tickets match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
