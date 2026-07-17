"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/dashboard/EmptyState";
import { getProducts, type ProductRecord } from "@/lib/services/productsService";

const PAGE_LIMIT = 20;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    getProducts({ page, limit: PAGE_LIMIT })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setLoadError(err.response?.data?.message ?? "Failed to load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.amazon_title ?? "").toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q) ||
      (p.asin ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-heading font-semibold text-xl">Products</h1>
          <p className="text-muted text-sm mt-0.5">All products across your imports and manual entries.</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, brand, ASIN..."
          className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body w-64 outline-none focus:border-primary"
        />
      </div>

      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-muted text-sm px-5 py-10 text-center">Loading…</p>
        ) : loadError ? (
          <p className="text-rose text-sm px-5 py-10 text-center">{loadError}</p>
        ) : products.length === 0 ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            }
            title="No products yet"
            description="Import a supplier list or add a product manually to get started."
            actionLabel="Import Products"
            actionHref="/dashboard/import"
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Product</th>
                <th className="text-left px-5 py-3 text-muted font-medium">ASIN</th>
                <th className="text-left px-5 py-3 text-muted font-medium">UPC/EAN</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Category</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Added</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5 max-w-[280px]">
                    <p className="text-body text-sm font-medium line-clamp-1">{p.amazon_title || "Untitled Product"}</p>
                    <p className="text-muted text-xs mt-0.5">{p.brand ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-section-bg rounded px-2 py-0.5">
                      {p.asin.startsWith("PENDING") ? "—" : p.asin}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs">{p.upc || p.ean || "—"}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{p.category ?? "—"}</td>
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/analysis/${p.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !loadError && products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            Page {page} of {totalPages} · {total} products
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
