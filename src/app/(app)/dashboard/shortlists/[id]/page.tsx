"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  getShortlist,
  removeShortlistItem,
  type ShortlistDetailRecord,
} from "@/lib/services/shortlistsService";

export default function ShortlistDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [shortlist, setShortlist] = useState<ShortlistDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    getShortlist(params.id)
      .then((data) => {
        if (!cancelled) setShortlist(data);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setLoadError(err.response?.data?.message ?? "Failed to load shortlist.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleRemove = async (productId: string) => {
    if (!shortlist) return;
    setActionError("");
    setRemovingId(productId);
    try {
      await removeShortlistItem(shortlist.id, productId);
      setShortlist((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.product_id !== productId) } : prev
      );
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setActionError(axiosErr.response?.data?.message ?? "Failed to remove item from shortlist.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <p className="text-muted text-sm">Loading shortlist…</p>
      </div>
    );
  }

  if (loadError || !shortlist) {
    return (
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <a href="/dashboard/shortlists" className="text-primary text-sm hover:underline">
          ← Back to Shortlists
        </a>
        <p className="text-rose text-sm mt-3">{loadError || "Shortlist not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <a href="/dashboard/shortlists" className="text-primary text-sm hover:underline">
          ← Back to Shortlists
        </a>
        <h1 className="text-heading font-bold text-xl mt-2">{shortlist.name}</h1>
        <p className="text-muted text-sm mt-0.5">{shortlist.items.length} products</p>
      </div>

      <div className="p-6">
        {actionError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg mb-4">{actionError}</p>}

        <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
          {shortlist.items.length === 0 ? (
            <EmptyState
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              }
              title="No products in this shortlist yet"
              description="Add products from the analysis page using “Add to Shortlist”."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-section-bg">
                  <th className="text-left px-5 py-3 text-muted font-medium">Product</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">ASIN</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">Added</th>
                  <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortlist.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                    <td className="px-5 py-3.5 max-w-[280px]">
                      <p className="text-body text-sm font-medium line-clamp-1">
                        {item.product?.amazon_title || "Untitled Product"}
                      </p>
                      <p className="text-muted text-xs mt-0.5">{item.product?.brand ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs bg-section-bg rounded px-2 py-0.5">
                        {item.product?.asin && !item.product.asin.startsWith("PENDING") ? item.product.asin : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                      {new Date(item.added_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/analysis/${item.product_id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose hover:bg-rose-bg"
                          disabled={removingId === item.product_id}
                          onClick={() => handleRemove(item.product_id)}
                        >
                          {removingId === item.product_id ? "Removing…" : "Remove"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
