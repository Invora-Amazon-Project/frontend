"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import FilterTabs from "@/components/admin/FilterTabs";
import {
  deleteAmazonMatch,
  getAmazonMatches,
  updateAmazonMatch,
  type AmazonMatchRecord,
  type MatchStatus,
} from "@/lib/services/amazonMatchesService";

// NOTE: The mock version of this page had a 4th "Overridden" status and a
// "Correction History" table. Neither has a backing field/endpoint in the
// real AmazonMatch model (match_status is pending/confirmed/rejected only,
// and there's no match-history/audit endpoint) — dropped, see Frontend
// notlar on /amazon-matches for details.

const TABS = ["Pending Review", "Confirmed", "Rejected"];

const tabStatusMap: Record<string, MatchStatus> = {
  "Pending Review": "pending",
  "Confirmed": "confirmed",
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
  const [matches, setMatches] = useState<AmazonMatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    getAmazonMatches()
      .then(({ data }) => {
        if (!cancelled) setMatches(data);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setLoadError(err.response?.data?.message ?? "Failed to load matches.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = matches.filter((m) => m.match_status === tabStatusMap[activeTab]);

  const tabCounts: Record<string, number> = {
    "Pending Review": matches.filter((m) => m.match_status === "pending").length,
    "Confirmed": matches.filter((m) => m.match_status === "confirmed").length,
    "Rejected": matches.filter((m) => m.match_status === "rejected").length,
  };

  const handleUpdateStatus = async (id: string, match_status: MatchStatus) => {
    setActionError("");
    try {
      const updated = await updateAmazonMatch(id, { match_status });
      setMatches((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setActionError(axiosErr.response?.data?.message ?? "Failed to update match.");
    }
  };

  const handleDelete = async (id: string) => {
    setActionError("");
    try {
      await deleteAmazonMatch(id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setActionError(axiosErr.response?.data?.message ?? "Failed to delete match.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-heading font-semibold text-xl">Matching Review</h1>

      {actionError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{actionError}</p>}

      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <div className="px-5 pt-4 flex items-center justify-between gap-4">
          <FilterTabs tabs={TABS} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
          <span className="shrink-0 bg-section-bg text-muted text-xs font-medium rounded-full px-2.5 py-0.5 mb-0.5">
            {tabCounts[activeTab]} records
          </span>
        </div>

        {loading ? (
          <p className="text-muted text-sm px-5 py-10 text-center">Loading…</p>
        ) : loadError ? (
          <p className="text-rose text-sm px-5 py-10 text-center">{loadError}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Supplier Product</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Matched ASIN</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Confidence</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Matched By</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Date</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((match) => (
                <tr key={match.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5 max-w-[220px]">
                    <p className="text-body text-sm font-medium line-clamp-1">
                      {match.listProduct?.raw_title ?? "—"}
                    </p>
                    <p className="text-muted text-xs mt-0.5">{match.canonicalProduct?.brand ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm bg-section-bg rounded px-2 py-0.5">
                      {match.canonicalProduct?.asin ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${confidencePill(match.confidence_score)}`}>
                      {confidenceLabel(match.confidence_score)} {match.confidence_score}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs capitalize">{match.matched_by}</td>
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(match.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(match.id, "confirmed")}>
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(match.id, "rejected")}
                        className="text-rose hover:bg-rose-bg"
                      >
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(match.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                    No records in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
