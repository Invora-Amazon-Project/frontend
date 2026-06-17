"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterTabs from "@/components/admin/FilterTabs";

type MatchStatus = "pending" | "confirmed" | "overridden" | "rejected";
type FlaggedBy = "User" | "System";

interface MatchRecord {
  id: string;
  supplierProduct: string;
  brand: string;
  asin: string;
  confidence: number;
  flaggedBy: FlaggedBy;
  date: string;
  status: MatchStatus;
}

interface CorrectionRecord {
  id: string;
  originalAsin: string;
  correctedAsin: string;
  correctedBy: string;
  date: string;
  supplierProduct: string;
}

const initialMatches: MatchRecord[] = [
  { id: "M-001", supplierProduct: "Stainless Steel Water Bottle 32oz", brand: "AquaPure", asin: "B09XK2YH4M", confidence: 91, flaggedBy: "System", date: "2025-06-15T08:30:00Z", status: "pending" },
  { id: "M-002", supplierProduct: "Wireless Earbuds Pro Max", brand: "SoundWave", asin: "B08N5WRWNW", confidence: 74, flaggedBy: "User", date: "2025-06-15T09:14:00Z", status: "pending" },
  { id: "M-003", supplierProduct: "Bamboo Cutting Board Set (3pcs)", brand: "EcoKitch", asin: "B07QF2B7P9", confidence: 43, flaggedBy: "System", date: "2025-06-15T10:02:00Z", status: "pending" },
  { id: "M-004", supplierProduct: "Yoga Mat Non-Slip 6mm", brand: "ZenFlex", asin: "B01N5G3Z1A", confidence: 88, flaggedBy: "User", date: "2025-06-15T10:45:00Z", status: "pending" },
  { id: "M-005", supplierProduct: "LED Desk Lamp with USB Port", brand: "LumiTech", asin: "B09D3H6YP2", confidence: 62, flaggedBy: "System", date: "2025-06-15T11:20:00Z", status: "confirmed" },
  { id: "M-006", supplierProduct: "Foam Roller Deep Tissue 18in", brand: "RecoverPro", asin: "B07BFKVF9K", confidence: 55, flaggedBy: "User", date: "2025-06-15T12:05:00Z", status: "overridden" },
  { id: "M-007", supplierProduct: "Silicone Kitchen Utensil Set 6pcs", brand: "ChefMate", asin: "B08KTG12MX", confidence: 38, flaggedBy: "System", date: "2025-06-15T12:48:00Z", status: "rejected" },
  { id: "M-008", supplierProduct: "Resistance Bands Set Heavy Duty", brand: "GripForce", asin: "B07CL89DTJ", confidence: 79, flaggedBy: "System", date: "2025-06-15T13:10:00Z", status: "pending" },
];

const mockCorrections: CorrectionRecord[] = [
  { id: "C-001", originalAsin: "B07QF2B7P9", correctedAsin: "B08MXKD4NZ", correctedBy: "Admin", date: "2025-06-14T09:30:00Z", supplierProduct: "Bamboo Cutting Board Set" },
  { id: "C-002", originalAsin: "B01N5G3Z1A", correctedAsin: "B09WKGP3TT", correctedBy: "Sarah Johnson", date: "2025-06-13T14:22:00Z", supplierProduct: "Yoga Mat Premium" },
  { id: "C-003", originalAsin: "B08N5WRWNW", correctedAsin: "B07PDHSPG9", correctedBy: "Admin", date: "2025-06-12T11:05:00Z", supplierProduct: "Wireless Earbuds Basic" },
  { id: "C-004", originalAsin: "B09XK2YH4M", correctedAsin: "B0BSHF7WHD", correctedBy: "Marcus Chen", date: "2025-06-11T16:40:00Z", supplierProduct: "Insulated Water Bottle" },
  { id: "C-005", originalAsin: "B07BFKVF9K", correctedAsin: "B082LW3PK2", correctedBy: "Admin", date: "2025-06-10T10:15:00Z", supplierProduct: "Foam Roller Standard" },
];

const TABS = ["Pending Review", "Confirmed", "Overridden", "Rejected"];

const tabStatusMap: Record<string, MatchStatus | null> = {
  "Pending Review": "pending",
  "Confirmed": "confirmed",
  "Overridden": "overridden",
  "Rejected": "rejected",
};

function confidencePill(pct: number): string {
  if (pct > 80) return "bg-mint-bg text-mint";
  if (pct >= 50) return "bg-peach-bg text-peach";
  return "bg-rose-bg text-rose";
}

function confidenceLabel(pct: number): string {
  if (pct > 80) return "High";
  if (pct >= 50) return "Medium";
  return "Low";
}

export default function MatchingReviewPage() {
  const [activeTab, setActiveTab] = useState("Pending Review");
  const [matches, setMatches] = useState<MatchRecord[]>(initialMatches);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState("");

  const filtered = matches.filter(
    (m) => m.status === tabStatusMap[activeTab]
  );

  const tabCounts: Record<string, number> = {
    "Pending Review": matches.filter((m) => m.status === "pending").length,
    "Confirmed": matches.filter((m) => m.status === "confirmed").length,
    "Overridden": matches.filter((m) => m.status === "overridden").length,
    "Rejected": matches.filter((m) => m.status === "rejected").length,
  };

  function updateStatus(id: string, status: MatchStatus) {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  function startOverride(id: string, currentAsin: string) {
    setOverrideId(id);
    setOverrideValue(currentAsin);
  }

  function saveOverride(id: string) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, asin: overrideValue.trim().toUpperCase(), status: "overridden" } : m
      )
    );
    setOverrideId(null);
    setOverrideValue("");
  }

  function cancelOverride() {
    setOverrideId(null);
    setOverrideValue("");
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <h1 className="text-heading font-semibold text-xl">Matching Review</h1>

      {/* Main Review Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        {/* Filter tabs + total badge */}
        <div className="px-5 pt-4 flex items-center justify-between gap-4">
          <FilterTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
          <span className="shrink-0 bg-section-bg text-muted text-xs font-medium rounded-full px-2.5 py-0.5 mb-0.5">
            {tabCounts[activeTab]} records
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-section-bg">
              <th className="text-left px-5 py-3 text-muted font-medium">Supplier Product</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Matched ASIN</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Confidence</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Flagged By</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Date</th>
              <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((match) => {
              const isOverriding = overrideId === match.id;
              return (
                <tr
                  key={match.id}
                  className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors"
                >
                  {/* Supplier Product */}
                  <td className="px-5 py-3.5 max-w-[200px]">
                    <p className="text-body text-sm font-medium line-clamp-1">{match.supplierProduct}</p>
                    <p className="text-muted text-xs mt-0.5">{match.brand}</p>
                  </td>

                  {/* Matched ASIN — inline override input or static pill */}
                  <td className="px-5 py-3.5">
                    {isOverriding ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={overrideValue}
                          onChange={(e) => setOverrideValue(e.target.value.toUpperCase())}
                          className="w-32 border border-primary rounded-lg px-2 py-1 text-xs font-mono bg-page-bg text-heading outline-none uppercase"
                          autoFocus
                        />
                        <button
                          onClick={() => saveOverride(match.id)}
                          className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelOverride}
                          className="text-xs font-medium text-muted hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-sm bg-section-bg rounded px-2 py-0.5">
                        {match.asin}
                      </span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${confidencePill(match.confidence)}`}>
                      {confidenceLabel(match.confidence)} {match.confidence}%
                    </span>
                  </td>

                  {/* Flagged By */}
                  <td className="px-5 py-3.5 text-muted text-xs">{match.flaggedBy}</td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(match.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
                    {new Date(match.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(match.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startOverride(match.id, match.asin)}
                      >
                        Override ASIN
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(match.id, "rejected")}
                        className="text-rose hover:bg-rose-bg"
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                  No records in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Correction History */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <h2 className="text-heading font-semibold text-sm mb-5">Correction History</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Original ASIN</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Corrected ASIN</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Corrected By</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Date</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Supplier Product</th>
              </tr>
            </thead>
            <tbody>
              {mockCorrections.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-section-bg rounded px-2 py-0.5 text-muted line-through">
                      {c.originalAsin}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-mint-bg text-mint rounded px-2 py-0.5">
                      {c.correctedAsin}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body text-sm">{c.correctedBy}</td>
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(c.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-body text-sm max-w-[200px]">
                    <span className="line-clamp-1">{c.supplierProduct}</span>
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
