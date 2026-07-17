"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import FilterTabs from "@/components/admin/FilterTabs";
import type { PlanName } from "@/types";
import {
  getNewsletterSubscribers,
  unsubscribeNewsletterSubscriber,
  type NewsletterSubscriber,
} from "@/lib/newsletterService";
import {
  getAdminUsers,
  type MembershipRole,
} from "@/lib/services/adminUsersService";

interface UserRow {
  id: string;
  name: string;
  email: string;
  joinedDate?: string;
  planName?: string;
  planPrice?: number;
  subscriptionStatus?: string;
}

const TABS = ["All", "Active", "Trial", "Blocked", "Waitlisted"];
const PAGE_SIZE = 10;

const statusTabMap: Record<string, string> = {
  Active: "active",
  Trial: "trial",
  Blocked: "blocked",
};

const ROLE_OPTIONS: { label: string; value: MembershipRole | "" }[] = [
  { label: "All Roles", value: "" },
  { label: "Owner", value: "OWNER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Staff", value: "STAFF" },
  { label: "Customer", value: "CUSTOMER" },
];

const defaultForm = { name: "", email: "", plan: "starter" as PlanName, credits: 100 };

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<MembershipRole | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [waitlist, setWaitlist] = useState<NewsletterSubscriber[]>([]);
  const [waitlistError, setWaitlistError] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(false);

  useEffect(() => {
    if (activeTab !== "Waitlisted") return;
    getNewsletterSubscribers()
      .then(setWaitlist)
      .catch(() => setWaitlistError(true));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Waitlisted") return;
    setIsLoadingUsers(true);
    setUsersError(false);

    getAdminUsers({
      page,
      limit: PAGE_SIZE,
      ...(roleFilter ? { role: roleFilter } : {}),
    })
      .then(({ data: list, total: serverTotal }) => {
        setTotal(serverTotal);
        const rows: UserRow[] = list.map((u) => {
          const subscription = u.subscriptions?.[0];
          return {
            id: u.id,
            name: u.name ?? u.email,
            email: u.email,
            joinedDate: u.created_at,
            planName: subscription?.plan?.name,
            planPrice: subscription?.plan?.price,
            subscriptionStatus: subscription?.status,
          };
        });
        setUsers(rows);
      })
      .catch(() => setUsersError(true))
      .finally(() => setIsLoadingUsers(false));
  }, [page, roleFilter, activeTab]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, activeTab]);

  const isWaitlistTab = activeTab === "Waitlisted";

  const filtered = users.filter((u) => {
    const matchesTab =
      activeTab === "All" ||
      u.subscriptionStatus?.toLowerCase() === statusTabMap[activeTab];
    const matchesSearch =
      search.trim() === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredWaitlist = waitlist.filter(
    (w) => search.trim() === "" || w.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, total);

  async function handleRemoveWaitlistSubscriber(id: string, email: string) {
    if (!window.confirm(`Remove ${email} from the waitlist?`)) return;
    try {
      await unsubscribeNewsletterSubscriber(email);
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex items-center gap-3">
          {!isWaitlistTab && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as MembershipRole | "")}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body outline-none focus:border-primary transition-colors"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors w-64"
          />
        </div>
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
                <th className="text-left px-5 py-3 text-muted font-medium">Price</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Subscription Status</th>
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
                      {user.planName ? (
                        <span className="bg-primary-light text-primary text-xs rounded-full px-2.5 py-0.5 capitalize">
                          {user.planName}
                        </span>
                      ) : (
                        <span className="text-muted text-xs italic">No plan</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-body">
                      {user.planPrice != null ? `$${user.planPrice.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {user.subscriptionStatus ? (
                        <span className="bg-section-bg text-muted text-xs rounded-full px-2.5 py-0.5 capitalize">
                          {user.subscriptionStatus}
                        </span>
                      ) : (
                        <span className="text-muted text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {user.joinedDate
                        ? new Date(user.joinedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
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
                {isLoadingUsers && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                      Loading users...
                    </td>
                  </tr>
                )}
                {!isLoadingUsers && usersError && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-rose text-sm">
                      Failed to load users.
                    </td>
                  </tr>
                )}
                {!isLoadingUsers && !usersError && filtered.length === 0 && (
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
            : `Showing ${pageStart}–${pageEnd} of ${total} users`}
        </p>
        {!isWaitlistTab && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <span className="text-muted text-sm px-1">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
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
