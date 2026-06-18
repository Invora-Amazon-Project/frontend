"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { PlanConfig, PlanName, SupportLevel } from "@/types";

const EXPORT_OPTIONS = ["CSV", "Excel", "PDF"];
const SUPPORT_LEVELS: SupportLevel[] = ["Standard", "Prioritized", "Team Priority"];

const initialPlans: PlanConfig[] = [
  {
    name: "starter",
    price: 29,
    trialDays: 7,
    monthlyCredits: 200,
    importLimit: 100,
    watchlistLimit: 20,
    dailyPulseAccess: false,
    exportOptions: ["CSV"],
    supportLevel: "Standard",
    annualDiscountPercent: 17.24,
  },
  {
    name: "pro",
    price: 79,
    trialDays: 14,
    monthlyCredits: 500,
    importLimit: 500,
    watchlistLimit: 100,
    dailyPulseAccess: true,
    exportOptions: ["CSV", "Excel"],
    supportLevel: "Prioritized",
    annualDiscountPercent: 17.72,
  },
  {
    name: "team",
    price: 179,
    trialDays: 14,
    monthlyCredits: 2000,
    importLimit: 2000,
    watchlistLimit: 500,
    dailyPulseAccess: true,
    exportOptions: ["CSV", "Excel", "PDF"],
    supportLevel: "Team Priority",
    annualDiscountPercent: 16.76,
    includedTeamSeats: 3,
  },
];

const planBadge: Record<PlanName, string> = {
  starter: "bg-section-bg text-muted",
  pro: "bg-primary-light text-primary",
  team: "bg-mint-bg text-mint",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

function PlanCard({ initial }: { initial: PlanConfig }) {
  const [plan, setPlan] = useState<PlanConfig>(initial);
  const annualMonthly = plan.price * (1 - plan.annualDiscountPercent / 100);
  const annualTotal = annualMonthly * 12;

  function field(key: keyof PlanConfig, label: string, type: "number" | "text") {
    return (
      <div>
        <label className="block text-muted text-xs mb-1">{label}</label>
        <input
          type={type}
          value={plan[key] as string | number}
          onChange={(e) =>
            setPlan({ ...plan, [key]: type === "number" ? Number(e.target.value) : e.target.value })
          }
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
        />
      </div>
    );
  }

  function toggleExport(opt: string) {
    setPlan((p) => ({
      ...p,
      exportOptions: p.exportOptions.includes(opt)
        ? p.exportOptions.filter((o) => o !== opt)
        : [...p.exportOptions, opt],
    }));
  }

  return (
    <div className="bg-card-bg border border-border rounded-xl p-6 flex flex-col gap-5">
      {/* Card header */}
      <div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${planBadge[plan.name]}`}>
          {plan.name}
        </span>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-heading font-bold text-2xl">${plan.price}</span>
          <span className="text-muted text-sm">/month</span>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3 flex-1">
        {field("price", "Price (USD)", "number")}
        {field("annualDiscountPercent", "Annual Discount (%)", "number")}
        <p className="text-muted text-xs -mt-2">
          Annual billing: ${annualMonthly.toFixed(2)}/mo · ${annualTotal.toFixed(2)}/year
        </p>

        {field("trialDays", "Trial Days", "number")}
        {field("monthlyCredits", "Monthly Credits", "number")}
        {field("importLimit", "Import Limit", "number")}
        {field("watchlistLimit", "Watchlist Limit", "number")}

        {plan.name === "team" && (
          <div>
            <label className="block text-muted text-xs mb-1">Included Team Seats</label>
            <input
              type="number"
              min={1}
              value={plan.includedTeamSeats ?? 3}
              onChange={(e) =>
                setPlan({ ...plan, includedTeamSeats: Number(e.target.value) })
              }
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
            />
          </div>
        )}

        {/* Daily Pulse toggle */}
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs">Daily Pulse Access</span>
          <Toggle
            checked={plan.dailyPulseAccess}
            onChange={() => setPlan({ ...plan, dailyPulseAccess: !plan.dailyPulseAccess })}
          />
        </div>

        <div>
          <label className="block text-muted text-xs mb-1.5">Support Level</label>
          <select
            value={plan.supportLevel}
            onChange={(e) =>
              setPlan({ ...plan, supportLevel: e.target.value as SupportLevel })
            }
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {SUPPORT_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Export options */}
        <div>
          <label className="block text-muted text-xs mb-1.5">Export Options</label>
          <div className="flex gap-3">
            {EXPORT_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={plan.exportOptions.includes(opt)}
                  onChange={() => toggleExport(opt)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span className="text-body text-xs">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Button variant="primary" size="sm">
        Save Changes
      </Button>
    </div>
  );
}

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading font-semibold text-xl">Plan Management</h1>
        <p className="text-muted text-sm mt-1">Changes here affect plan limits for all users on each plan.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {initialPlans.map((plan) => (
          <PlanCard key={plan.name} initial={plan} />
        ))}
      </div>
    </div>
  );
}
