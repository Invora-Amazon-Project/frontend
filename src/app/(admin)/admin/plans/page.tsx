"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import type { PlanConfig, PlanName, SupportLevel } from "@/types";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  type SubscriptionPlan,
  type SubscriptionPlanPayload,
} from "@/lib/services/subscriptionPlansService";

const EXPORT_OPTIONS = ["CSV", "Excel", "PDF"];
const SUPPORT_LEVELS: SupportLevel[] = ["Standard", "Prioritized", "Team Priority"];

// Backend plan seed uses title-case names ("Start"/"Pro"/"Team"); admin UI keys stay lowercase.
const BACKEND_PLAN_NAME: Record<PlanName, string> = {
  starter: "Start",
  pro: "Pro",
  team: "Team",
};

function toPlanConfig(name: PlanName, p: SubscriptionPlan): PlanConfig {
  return {
    name,
    price: p.price,
    trialDays: p.trial_days,
    monthlyCredits: p.monthly_credits,
    importLimit: p.product_limit,
    watchlistLimit: p.list_limit,
    apiLimit: p.api_limit,
    dailyPulseAccess: p.daily_pulse_access,
    exportOptions: p.export_options ?? [],
    supportLevel: (p.support_level as SupportLevel) ?? "Standard",
    annualDiscountPercent: p.annual_discount,
    includedTeamSeats: p.team_limit,
    isActive: p.is_active,
  };
}

function toPayload(planKey: PlanName, plan: PlanConfig): SubscriptionPlanPayload {
  return {
    name: BACKEND_PLAN_NAME[planKey],
    price: plan.price,
    annual_discount: plan.annualDiscountPercent,
    trial_days: plan.trialDays,
    monthly_credits: plan.monthlyCredits,
    product_limit: plan.importLimit,
    list_limit: plan.watchlistLimit,
    team_limit: plan.includedTeamSeats ?? 0,
    api_limit: plan.apiLimit,
    daily_pulse_access: plan.dailyPulseAccess,
    support_level: plan.supportLevel,
    export_options: plan.exportOptions,
    is_active: plan.isActive,
  };
}

const initialPlans: PlanConfig[] = [
  {
    name: "starter",
    price: 29,
    trialDays: 7,
    monthlyCredits: 200,
    importLimit: 100,
    watchlistLimit: 20,
    apiLimit: 100,
    dailyPulseAccess: false,
    exportOptions: ["CSV"],
    supportLevel: "Standard",
    annualDiscountPercent: 17.24,
    includedTeamSeats: 0,
    isActive: true,
  },
  {
    name: "pro",
    price: 79,
    trialDays: 14,
    monthlyCredits: 500,
    importLimit: 500,
    watchlistLimit: 100,
    apiLimit: 500,
    dailyPulseAccess: true,
    exportOptions: ["CSV", "Excel"],
    supportLevel: "Prioritized",
    annualDiscountPercent: 17.72,
    includedTeamSeats: 0,
    isActive: true,
  },
  {
    name: "team",
    price: 179,
    trialDays: 14,
    monthlyCredits: 2000,
    importLimit: 2000,
    watchlistLimit: 500,
    apiLimit: 2000,
    dailyPulseAccess: true,
    exportOptions: ["CSV", "Excel", "PDF"],
    supportLevel: "Team Priority",
    annualDiscountPercent: 16.76,
    includedTeamSeats: 3,
    isActive: true,
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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

function PlanCard({
  initial,
  planKey,
  existingId,
}: {
  initial: PlanConfig;
  planKey: PlanName;
  existingId: string | null;
}) {
  const [plan, setPlan] = useState<PlanConfig>(initial);
  const [id, setId] = useState<string | null>(existingId);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const annualMonthly = plan.price * (1 - plan.annualDiscountPercent / 100);
  const annualTotal = annualMonthly * 12;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const payload = toPayload(planKey, plan);
      if (id) {
        await updateSubscriptionPlan(id, payload);
      } else {
        const created = await createSubscriptionPlan(payload);
        setId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Changes could not be saved.");
    } finally {
      setSaving(false);
    }
  };

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
        {field("apiLimit", "API Limit", "number")}

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

        {/* Plan active toggle */}
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs">Plan Active</span>
          <Toggle
            checked={plan.isActive}
            onChange={() => setPlan({ ...plan, isActive: !plan.isActive })}
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
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saved && <span className="text-mint text-xs font-medium">Saved.</span>}
        {saveError && <span className="text-rose text-xs font-medium">{saveError}</span>}
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [backendPlans, setBackendPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSubscriptionPlans()
      .then((data) => {
        if (!cancelled) setBackendPlans(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Plans could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading font-semibold text-xl">Plan Management</h1>
        <p className="text-muted text-sm mt-1">Changes here affect plan limits for all users on each plan.</p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
          {loadError}
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading plans...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {initialPlans.map((defaultPlan) => {
            const existing = backendPlans.find(
              (p) => p.name.toLowerCase() === BACKEND_PLAN_NAME[defaultPlan.name].toLowerCase()
            );
            return (
              <PlanCard
                key={defaultPlan.name}
                planKey={defaultPlan.name}
                initial={existing ? toPlanConfig(defaultPlan.name, existing) : defaultPlan}
                existingId={existing?.id ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
