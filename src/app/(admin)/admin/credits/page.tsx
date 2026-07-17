"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { CreditTransaction, CreditTransactionType, AdminUser } from "@/types";
import { getSubscriptionPlans } from "@/lib/services/subscriptionPlansService";

const mockUsers: AdminUser[] = [
  { id: "U-1", name: "Sarah Johnson", email: "sarah.johnson@example.com", plan: "pro", creditBalance: 340, status: "active", joinedDate: "2025-01-14", role: "user" },
  { id: "U-2", name: "Marcus Chen", email: "marcus.chen@example.com", plan: "team", creditBalance: 1200, status: "active", joinedDate: "2025-02-03", role: "user" },
  { id: "U-3", name: "Priya Nair", email: "priya.nair@example.com", plan: "starter", creditBalance: 80, status: "trial", joinedDate: "2025-05-20", role: "user" },
  { id: "U-6", name: "Omar Hassan", email: "omar.hassan@example.com", plan: "team", creditBalance: 870, status: "active", joinedDate: "2024-09-17", role: "user" },
];

const mockTransactions: CreditTransaction[] = [
  { id: "TX-001", userId: "U-1", userName: "Sarah Johnson", type: "add", amount: 100, reason: "Monthly plan refill", date: "2025-06-01T08:00:00Z" },
  { id: "TX-002", userId: "U-2", userName: "Marcus Chen", type: "consume", amount: 50, reason: "Product analysis batch", date: "2025-06-03T10:14:00Z" },
  { id: "TX-003", userId: "U-3", userName: "Priya Nair", type: "add", amount: 50, reason: "Trial bonus credits", date: "2025-06-04T09:30:00Z" },
  { id: "TX-004", userId: "U-6", userName: "Omar Hassan", type: "consume", amount: 200, reason: "Bulk import — 400 ASINs", date: "2025-06-05T14:22:00Z" },
  { id: "TX-005", userId: "U-1", userName: "Sarah Johnson", type: "refund", amount: 30, reason: "Analysis failed — system error", date: "2025-06-06T11:05:00Z" },
  { id: "TX-006", userId: "U-2", userName: "Marcus Chen", type: "add", amount: 500, reason: "Plan upgrade bonus", date: "2025-06-07T16:45:00Z" },
  { id: "TX-007", userId: "U-3", userName: "Priya Nair", type: "consume", amount: 10, reason: "Single ASIN analysis", date: "2025-06-08T09:00:00Z" },
  { id: "TX-008", userId: "U-6", userName: "Omar Hassan", type: "add", amount: 300, reason: "Admin manual top-up", date: "2025-06-09T13:10:00Z" },
  { id: "TX-009", userId: "U-1", userName: "Sarah Johnson", type: "consume", amount: 20, reason: "Supplier match run", date: "2025-06-10T15:30:00Z" },
  { id: "TX-010", userId: "U-2", userName: "Marcus Chen", type: "refund", amount: 100, reason: "Duplicate charge — billing error", date: "2025-06-11T10:00:00Z" },
];

const typePill: Record<CreditTransactionType, string> = {
  add: "bg-mint-bg text-mint",
  consume: "bg-primary-light text-primary",
  refund: "bg-peach-bg text-peach",
};

export default function CreditsPage() {
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<AdminUser | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addAmount, setAddAmount] = useState<number>(0);
  const [addReason, setAddReason] = useState("");
  const [planCreditLimit, setPlanCreditLimit] = useState<Record<string, number>>({});

  useEffect(() => {
    getSubscriptionPlans()
      .then((plans) => {
        const map: Record<string, number> = {};
        plans.forEach((p) => { map[p.name.toLowerCase()] = p.monthly_credits; });
        setPlanCreditLimit(map);
      })
      .catch(() => setPlanCreditLimit({}));
  }, []);

  function handleFind() {
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === searchEmail.trim().toLowerCase()
    );
    if (user) {
      setFoundUser(user);
      setNotFound(false);
      setShowAddForm(false);
    } else {
      setFoundUser(null);
      setNotFound(true);
    }
  }

  function handleConfirmAdd() {
    setShowAddForm(false);
    setAddAmount(0);
    setAddReason("");
  }

  return (
    <div className="space-y-6">
      {/* User Credit Lookup */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-base mb-5">User Credit Lookup</h2>

        {/* Search row */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 max-w-sm">
            <Input
              label="User Email"
              type="email"
              placeholder="Search user by email..."
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setFoundUser(null);
                setNotFound(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleFind()}
            />
          </div>
          <Button variant="outline" size="md" onClick={handleFind}>
            Find User
          </Button>
        </div>

        {/* Not found */}
        {notFound && (
          <p className="mt-4 text-rose text-sm">No user found with that email address.</p>
        )}

        {/* Found user card */}
        {foundUser && (
          <div className="mt-5 border border-border rounded-xl p-5 bg-page-bg space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-heading font-semibold text-base">{foundUser.name}</p>
                <p className="text-muted text-sm">{foundUser.email}</p>
                <span className="mt-1.5 inline-block bg-primary-light text-primary text-xs rounded-full px-2.5 py-0.5 capitalize">
                  {foundUser.plan}
                </span>
              </div>
              <div className="text-right">
                <p className="text-heading font-bold text-2xl">{foundUser.creditBalance.toLocaleString()}</p>
                <p className="text-muted text-sm">of {(planCreditLimit[foundUser.plan] ?? 0).toLocaleString()} plan credits</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary" size="sm" onClick={() => setShowAddForm((v) => !v)}>
                Add Credits
              </Button>
              <Button variant="outline" size="sm">
                Remove Credits
              </Button>
              <Button variant="ghost" size="sm">
                View History
              </Button>
            </div>

            {/* Inline Add Credits form */}
            {showAddForm && (
              <div className="border border-border rounded-lg p-4 bg-card-bg space-y-3">
                <p className="text-heading font-medium text-sm">Add Credits to {foundUser.name}</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="w-32">
                    <Input
                      label="Amount"
                      type="number"
                      min={1}
                      value={addAmount || ""}
                      onChange={(e) => setAddAmount(Number(e.target.value))}
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <Input
                      label="Reason"
                      type="text"
                      value={addReason}
                      onChange={(e) => setAddReason(e.target.value)}
                      placeholder="e.g. Manual top-up"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleConfirmAdd}>
                    Confirm
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Credit Transactions */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-base mb-5">All Credit Transactions</h2>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">User</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Type</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Amount</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Reason</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-heading font-medium">{tx.userName}</p>
                    <p className="text-muted text-xs mt-0.5">{tx.userId}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${typePill[tx.type]}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold ${tx.type === "consume" ? "text-rose" : "text-mint"}`}>
                      {tx.type === "consume" ? "−" : "+"}{tx.amount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body max-w-[240px]">
                    <span className="truncate block">{tx.reason}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                    {new Date(tx.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
