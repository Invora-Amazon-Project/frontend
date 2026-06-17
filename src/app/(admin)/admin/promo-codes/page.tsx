"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import type { PromoCode, PlanName, DiscountType } from "@/types";

const ALL_PLANS: PlanName[] = ["starter", "pro", "team"];

const mockPromos: PromoCode[] = [
  { id: "P-001", code: "SUMMER25", discountType: "percentage", discountValue: 25, validPlans: ["pro", "team"], usageCount: 38, usageLimit: 100, expiryDate: "2025-08-31", isActive: true },
  { id: "P-002", code: "FLAT10", discountType: "fixed", discountValue: 10, validPlans: ["starter"], usageCount: 12, usageLimit: 50, expiryDate: "2025-07-15", isActive: true },
  { id: "P-003", code: "WELCOME50", discountType: "percentage", discountValue: 50, validPlans: ["starter", "pro", "team"], usageCount: 50, usageLimit: 50, expiryDate: "2025-06-01", isActive: false },
  { id: "P-004", code: "TEAMDEAL", discountType: "percentage", discountValue: 15, validPlans: ["team"], usageCount: 7, usageLimit: 30, expiryDate: "2025-09-30", isActive: true },
  { id: "P-005", code: "SPRING20", discountType: "percentage", discountValue: 20, validPlans: ["pro"], usageCount: 30, usageLimit: 30, expiryDate: "2025-05-01", isActive: false },
  { id: "P-006", code: "SAVE15", discountType: "fixed", discountValue: 15, validPlans: ["pro", "team"], usageCount: 4, usageLimit: 20, expiryDate: "2025-12-31", isActive: true },
];

function formatDiscount(code: PromoCode): string {
  return code.discountType === "percentage"
    ? `${code.discountValue}%`
    : `$${code.discountValue} off`;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const defaultForm = {
  code: "",
  discountType: "percentage" as DiscountType,
  discountValue: 10,
  validPlans: [] as PlanName[],
  usageLimit: 50,
  expiryDate: "",
};

export default function PromoCodesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  function togglePlan(plan: PlanName) {
    setForm((f) => ({
      ...f,
      validPlans: f.validPlans.includes(plan)
        ? f.validPlans.filter((p) => p !== plan)
        : [...f.validPlans, plan],
    }));
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
        <h1 className="text-heading font-semibold text-xl">Promo Codes</h1>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          Create Promo Code
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-section-bg">
              <th className="text-left px-5 py-3 text-muted font-medium">Code</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Discount</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Valid Plans</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Usage</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Expiry</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Status</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockPromos.map((promo) => (
              <tr key={promo.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono text-sm bg-section-bg rounded px-2 py-0.5 text-heading">
                    {promo.code}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-body font-medium">{formatDiscount(promo)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {promo.validPlans.map((plan) => (
                      <span
                        key={plan}
                        className="bg-primary-light text-primary text-xs rounded-full px-2 py-0.5 capitalize"
                      >
                        {plan}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted text-sm">
                  {promo.usageCount} / {promo.usageLimit}
                </td>
                <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                  {new Date(promo.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={promo.isActive ? "active" : "closed"} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <button className="text-peach text-sm hover:underline">Deactivate</button>
                    <span className="text-border">|</span>
                    <button className="text-rose text-sm hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Promo Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setForm(defaultForm); }}>
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <h2 className="text-heading font-semibold text-lg mb-5">Create Promo Code</h2>
          <form onSubmit={handleCreate} className="space-y-4">

            {/* Code + Generate */}
            <div>
              <label className="block text-body text-xs font-medium mb-1.5">Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER25"
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-mono bg-page-bg text-heading placeholder:text-placeholder outline-none focus:border-primary transition-colors uppercase"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, code: generateCode() })}
                  className="px-3 py-2 text-xs font-medium border border-border rounded-lg text-body bg-section-bg hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Discount Type toggle + Value */}
            <div>
              <label className="block text-body text-xs font-medium mb-1.5">Discount</label>
              <div className="flex gap-2 items-center">
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "percentage" })}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${form.discountType === "percentage" ? "bg-primary text-white" : "bg-card-bg text-body hover:bg-section-bg"}`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "fixed" })}
                    className={`px-3 py-2 text-sm font-medium transition-colors border-l border-border ${form.discountType === "fixed" ? "bg-primary text-white" : "bg-card-bg text-body hover:bg-section-bg"}`}
                  >
                    $ fixed
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                  className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                />
                <span className="text-muted text-sm">{form.discountType === "percentage" ? "%" : "USD"}</span>
              </div>
            </div>

            {/* Valid Plans */}
            <div>
              <label className="block text-body text-xs font-medium mb-2">Valid Plans</label>
              <div className="flex gap-3">
                {ALL_PLANS.map((plan) => (
                  <label key={plan} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.validPlans.includes(plan)}
                      onChange={() => togglePlan(plan)}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-body text-sm capitalize">{plan}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-body text-xs font-medium mb-1.5">Usage Limit</label>
              <input
                type="number"
                required
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                className="w-32 border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-body text-xs font-medium mb-1.5">Expiry Date</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" size="md" onClick={() => { setModalOpen(false); setForm(defaultForm); }}>
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
