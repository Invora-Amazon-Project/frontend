"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { DecisionRule } from "@/types";

const initialRules: DecisionRule[] = [
  { id: "DR-1", criterion: "ROI", weight: 25, isActive: true, description: "Profitability strength" },
  { id: "DR-2", criterion: "Profit Margin", weight: 20, isActive: true, description: "Unit profit and price flexibility" },
  { id: "DR-3", criterion: "Monthly Sales", weight: 15, isActive: true, description: "Demand strength" },
  { id: "DR-4", criterion: "Amazon Active", weight: 15, isActive: true, description: "Risk: Amazon is selling this product" },
  { id: "DR-5", criterion: "FBA Seller Count", weight: 10, isActive: true, description: "Competition density" },
  { id: "DR-6", criterion: "Price Stability", weight: 10, isActive: true, description: "Price drop risk trend" },
  { id: "DR-7", criterion: "Rating / Review", weight: 5, isActive: true, description: "Product trust and sales potential" },
];

type Threshold = { label: string; colorClass: string; dotClass: string; min: number; max: number };

const initialThresholds: Threshold[] = [
  { label: "Strong Opportunity", colorClass: "bg-mint-bg text-mint", dotClass: "bg-mint", min: 80, max: 100 },
  { label: "Review Carefully", colorClass: "bg-primary-light text-primary", dotClass: "bg-primary", min: 60, max: 79 },
  { label: "Risky", colorClass: "bg-peach-bg text-peach", dotClass: "bg-peach", min: 40, max: 59 },
  { label: "Avoid", colorClass: "bg-rose-bg text-rose", dotClass: "bg-rose", min: 0, max: 39 },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

export default function DecisionRulesPage() {
  const [rules, setRules] = useState<DecisionRule[]>(initialRules);
  const [thresholds, setThresholds] = useState<Threshold[]>(initialThresholds);

  const totalWeight = rules.reduce((sum, r) => sum + (r.isActive ? r.weight : 0), 0);

  function updateRule(id: string, patch: Partial<DecisionRule>) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function updateThreshold(index: number, patch: Partial<Threshold>) {
    setThresholds((ts) => ts.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  return (
    <div className="space-y-6">
      {/* Page intro */}
      <div>
        <h1 className="text-heading font-semibold text-xl">Decision Rules</h1>
        <p className="text-muted text-sm mt-1">
          These rules control the MarginLane Score engine. Total weight must equal 100.
        </p>
      </div>

      {/* Score Label Thresholds */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-sm mb-4">Score Label Thresholds</h2>
        <div className="space-y-3">
          {thresholds.map((t, i) => (
            <div key={t.label} className="flex items-center gap-4">
              <div className={`flex items-center gap-2 w-48 shrink-0 px-2.5 py-1 rounded-full ${t.colorClass}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${t.dotClass}`} />
                <span className="text-xs font-medium">{t.label}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Min</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={t.min}
                  onChange={(e) => updateThreshold(i, { min: Number(e.target.value) })}
                  className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors text-center"
                />
                <span>Max</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={t.max}
                  onChange={(e) => updateThreshold(i, { max: Number(e.target.value) })}
                  className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Criteria */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        {/* Section title row with live weight counter */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading font-semibold text-sm">Scoring Criteria</h2>
          <span className={`text-sm font-semibold ${totalWeight === 100 ? "text-mint" : "text-rose"}`}>
            Total: {totalWeight} / 100
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-4 py-3 text-muted font-medium w-12">On</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Criterion</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Description</th>
                <th className="text-left px-4 py-3 text-muted font-medium w-24">Weight</th>
                <th className="text-left px-4 py-3 text-muted font-medium w-36">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const pct = totalWeight > 0 ? Math.round((rule.weight / totalWeight) * 100) : 0;
                return (
                  <tr
                    key={rule.id}
                    className={`border-b border-border last:border-0 transition-colors ${rule.isActive ? "hover:bg-section-bg/50" : "opacity-50 bg-page-bg/40"}`}
                  >
                    <td className="px-4 py-3.5">
                      <Toggle
                        checked={rule.isActive}
                        onChange={() => updateRule(rule.id, { isActive: !rule.isActive })}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-heading font-medium">{rule.criterion}</td>
                    <td className="px-4 py-3.5 text-muted">{rule.description}</td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={rule.weight}
                        disabled={!rule.isActive}
                        onChange={(e) => updateRule(rule.id, { weight: Number(e.target.value) })}
                        className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors text-center disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-primary-light overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${rule.isActive ? pct : 0}%` }}
                          />
                        </div>
                        <span className="text-muted text-xs w-7 text-right">{rule.isActive ? pct : 0}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <Button variant="primary" size="sm">
            Save Rules
          </Button>
        </div>
      </div>
    </div>
  );
}
