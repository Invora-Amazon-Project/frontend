"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterTabs from "@/components/admin/FilterTabs";
import type { AdminUser, PlanName, UserStatus } from "@/types";
import {
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  type NewsletterSubscriber,
} from "@/lib/newsletterService";

const mockUsers: AdminUser[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com", plan: "pro", creditBalance: 340, status: "active", joinedDate: "2025-01-14", role: "user" },
  { id: "2", name: "Marcus Chen", email: "marcus.chen@example.com", plan: "team", creditBalance: 1200, status: "active", joinedDate: "2025-02-03", role: "user" },
  { id: "3", name: "Priya Nair", email: "priya.nair@example.com", plan: "starter", creditBalance: 80, status: "trial", joinedDate: "2025-05-20", role: "user" },
  { id: "4", name: "James Whitmore", email: "james.whitmore@example.com", plan: "pro", creditBalance: 0, status: "blocked", joinedDate: "2024-11-09", role: "user" },
  { id: "5", name: "Lena Fischer", email: "lena.fischer@example.com", plan: "starter", creditBalance: 45, status: "trial", joinedDate: "2025-06-01", role: "user" },
  { id: "6", name: "Omar Hassan", email: "omar.hassan@example.com", plan: "team", creditBalance: 870, status: "active", joinedDate: "2024-09-17", role: "user" },
  { id: "7", name: "Chloe Dupont", email: "chloe.dupont@example.com", plan: "pro", creditBalance: 210, status: "active", joinedDate: "2025-03-28", role: "user" },
  { id: "8", name: "Ravi Patel", email: "ravi.patel@example.com", plan: "starter", creditBalance: 15, status: "blocked", joinedDate: "2025-04-11", role: "user" },
];

const TABS = ["All", "Active", "Trial", "Blocked", "Waitlisted"];

const planStatusMap: Record<string, UserStatus> = {
  Active: "active",
  Trial: "trial",
  Blocked: "blocked",
};

const defaultForm = { name: "", email: "", plan: "starter" as PlanName, credits: 100 };

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [waitlist, setWaitlist] = useState<NewsletterSubscriber[]>([]);
  const [waitlistError, setWaitlistError] = useState(false);

  useEffect(() => {
    if (activeTab !== "Waitlisted") return;
    getNewsletterSubscribers()
      .then(setWaitlist)
      .catch(() => setWaitlistError(true));
  }, [activeTab]);

  const isWaitlistTab = activeTab === "Waitlisted";

  const filtered = mockUsers.filter((u) => {
    const matchesTab =
      activeTab === "All" || u.status === planStatusMap[activeTab];
    const matchesSearch =
      search.trim() === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredWaitlist = waitlist.filter(
    (w) => search.trim() === "" || w.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRemoveWaitlistSubscriber(id: string, email: string) {
    if (!window.confirm(`Remove ${email} from the waitlist?`)) return;
    try {
      await deleteNewsletterSubscriber(id);
      setWaitlist((prev) => prev.filter((w) => w.id !== id));
    } catch {
      window.alert("Failed to remove subscriber. Please try again.");
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setModalOpen(false);
    setForm(defaultForm);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-semibold text-xl">User Management</h1>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {isWaitlistTab ? (
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">User</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Subscribed At</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            ) : (
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">User</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Credits</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Status</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Joined</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {isWaitlistTab ? (
              <>
                {filteredWaitlist.map((sub, i) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors ${i % 2 === 0 ? "" : "bg-page-bg/40"}`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-heading font-medium">{sub.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {new Date(sub.subscribed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        className="text-rose text-sm hover:underline cursor-pointer"
                        onClick={() => handleRemoveWaitlistSubscriber(sub.id, sub.email)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {waitlistError && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-rose text-sm">
                      Failed to load waitlist subscribers.
                    </td>
                  </tr>
                )}
                {!waitlistError && filteredWaitlist.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-muted text-sm">
                      No waitlist subscribers match your search.
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <>
                {filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors ${i % 2 === 0 ? "" : "bg-page-bg/40"}`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-heading font-medium">{user.name}</p>
                      <p className="text-muted text-xs mt-0.5">{user.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-primary-light text-primary text-xs rounded-full px-2.5 py-0.5 capitalize">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-body">{user.creditBalance.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {new Date(user.joinedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button className="text-primary text-sm hover:underline">View</button>
                        <span className="text-border">|</span>
                        <button className="text-primary text-sm hover:underline">Edit</button>
                        <span className="text-border">|</span>
                        <button className="text-rose text-sm hover:underline">Block</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">
          {isWaitlistTab
            ? `Showing 1–${filteredWaitlist.length} of ${waitlist.length} waitlist subscribers`
            : `Showing 1–${filtered.length} of 48 users`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Prev</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <h2 className="text-heading font-semibold text-lg mb-5">Create User</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-body text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sarah Johnson"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-body text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-body text-sm font-medium mb-1.5">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value as PlanName })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div>
              <label className="block text-body text-sm font-medium mb-1.5">Initial Credits</label>
              <input
                type="number"
                min={0}
                required
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" size="md" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                Create
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
