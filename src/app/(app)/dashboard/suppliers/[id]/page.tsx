"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/admin/StatusBadge";

// TODO: Replace with real API call — GET /suppliers/:id

const SUPPLIER = {
  id: "s1",
  name: "Shanghai Source Co.",
  country: "China",
  currency: "USD",
  email: "wei.zhang@shanghaisource.com",
  totalProducts: 247,
  matchedProducts: 199,
  lastUpload: "3 days ago",
};

interface ImportList {
  id: string;
  fileName: string;
  uploadDate: string;
  products: number;
  matchRate: number;
  status: "completed" | "processing" | "failed";
}

const IMPORT_LISTS: ImportList[] = [
  { id: "l1", fileName: "shanghai_source_july_2026.csv", uploadDate: "2026-07-07", products: 247, matchRate: 81, status: "completed" },
  { id: "l2", fileName: "shanghai_source_june_2026.csv", uploadDate: "2026-06-12", products: 183, matchRate: 68, status: "completed" },
  { id: "l3", fileName: "shanghai_source_new_arrivals.xlsx", uploadDate: "2026-07-10", products: 54, matchRate: 42, status: "processing" },
];

interface SupplierProduct {
  id: string;
  supplierTitle: string;
  brand: string;
  upc: string;
  supplierPrice: number;
  matchStatus: "matched" | "low_confidence" | "unmatched";
  asin: string | null;
}

const PRODUCTS: SupplierProduct[] = [
  { id: "p1", supplierTitle: "Silicone Kitchen Tongs Set 2-Pack", brand: "OXO", upc: "719812057476", supplierPrice: 4.2, matchStatus: "matched", asin: "B08XK3LMND" },
  { id: "p2", supplierTitle: "Stainless Steel Garlic Press", brand: "Zulay", upc: "628931048822", supplierPrice: 3.1, matchStatus: "matched", asin: "B07P9QWXRT" },
  { id: "p3", supplierTitle: "Bamboo Cutting Board Set", brand: "Greener Chef", upc: "812309471029", supplierPrice: 8.9, matchStatus: "low_confidence", asin: "B09KXM2LPQ" },
  { id: "p4", supplierTitle: "Adjustable Measuring Cups", brand: "Prepworks", upc: "710239481233", supplierPrice: 2.4, matchStatus: "matched", asin: "B06XD4RTNV" },
  { id: "p5", supplierTitle: "Silicone Baking Mat 2-Pack", brand: "AmazonBasics", upc: "902341872910", supplierPrice: 3.6, matchStatus: "unmatched", asin: null },
  { id: "p6", supplierTitle: "Ceramic Non-Stick Frying Pan 10\"", brand: "GreenLife", upc: "310298471002", supplierPrice: 11.5, matchStatus: "matched", asin: "B08M3XKQPZ" },
  { id: "p7", supplierTitle: "Collapsible Colander", brand: "Prepara", upc: "419283710092", supplierPrice: 3.9, matchStatus: "low_confidence", asin: "B07T5WQXRM" },
  { id: "p8", supplierTitle: "Digital Kitchen Scale", brand: "Etekcity", upc: "812093471209", supplierPrice: 6.8, matchStatus: "unmatched", asin: null },
];

const MATCH_STATUS_DISPLAY: Record<SupplierProduct["matchStatus"], { label: string; cls: string }> = {
  matched: { label: "Matched", cls: "bg-mint-bg text-mint" },
  low_confidence: { label: "Low Confidence", cls: "bg-peach-bg text-peach" },
  unmatched: { label: "Unmatched", cls: "bg-rose-bg text-rose" },
};

function matchRateClass(rate: number) {
  if (rate > 80) return "bg-mint-bg text-mint";
  if (rate >= 60) return "bg-peach-bg text-peach";
  return "bg-rose-bg text-rose";
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredProducts = PRODUCTS.filter((p) =>
    p.supplierTitle.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredProducts.some((p) => p.id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredProducts.map((p) => p.id)])));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAnalyzeSelected = () => {
    // TODO: Replace with real API call — POST /api/supplier-lists/import with selected product IDs
    alert(`Sending ${selectedIds.length} products to analysis...`);
    setSelectedIds([]);
  };

  const handleAnalyzeAll = () => {
    // TODO: Replace with real API call — POST /api/supplier-lists/import with all product IDs
    alert(`Sending all ${SUPPLIER.totalProducts} products to analysis...`);
  };

  return (
    <div>
      {/* ── SUPPLIER INFO HEADER ── */}
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <a href="/dashboard/suppliers" className="text-primary text-sm hover:underline">
          ← Back to Suppliers
        </a>

        <h1 className="text-heading font-bold text-xl mt-2">{SUPPLIER.name}</h1>
        <p className="text-muted text-sm mt-0.5">
          {SUPPLIER.country} · <span className="bg-section-bg text-muted text-xs rounded px-1.5 py-0.5">{SUPPLIER.currency}</span> · {SUPPLIER.email}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-heading font-bold text-xl">{SUPPLIER.totalProducts}</p>
            <p className="text-muted text-xs mt-0.5">Total Products in List</p>
          </div>
          <div>
            <p className="text-mint font-bold text-xl">{SUPPLIER.matchedProducts}</p>
            <p className="text-muted text-xs mt-0.5">Matched Products</p>
          </div>
          <div>
            <p className="text-muted font-bold text-xl">{SUPPLIER.lastUpload}</p>
            <p className="text-muted text-xs mt-0.5">Last Upload</p>
          </div>
        </div>
      </div>

      {/* ── UPLOADED LISTS ── */}
      <div className="bg-card-bg border border-border rounded-xl p-5 mx-6 mt-6">
        <h2 className="text-heading font-semibold text-sm mb-3">Uploaded Lists</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs text-left border-b border-border">
              <th className="font-semibold pb-2 pr-3">File Name</th>
              <th className="font-semibold pb-2 pr-3">Upload Date</th>
              <th className="font-semibold pb-2 pr-3">Products</th>
              <th className="font-semibold pb-2 pr-3">Match Rate</th>
              <th className="font-semibold pb-2 pr-3">Status</th>
              <th className="font-semibold pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {IMPORT_LISTS.map((list) => (
              <tr key={list.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 text-body text-sm font-mono">{list.fileName}</td>
                <td className="py-2.5 pr-3 text-body">{list.uploadDate}</td>
                <td className="py-2.5 pr-3 text-body">{list.products}</td>
                <td className="py-2.5 pr-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${matchRateClass(list.matchRate)}`}>{list.matchRate}%</span>
                </td>
                <td className="py-2.5 pr-3">
                  <StatusBadge status={list.status} />
                </td>
                <td className="py-2.5">
                  <Button variant="outline" size="sm" onClick={() => setActiveListId(list.id)}>
                    View Products
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── PRODUCT LIST ── */}
      {activeListId && (
        <>
          <div className="flex items-center justify-between px-6 mt-6 mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm">{SUPPLIER.totalProducts} products</span>
              {selectedIds.length > 0 && (
                <span className="bg-primary-light text-primary rounded-full px-3 py-1 text-sm font-medium">
                  {selectedIds.length} products selected
                </span>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg text-body w-56 outline-none focus:border-primary"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAnalyzeSelected}
                disabled={selectedIds.length === 0}
                className={selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
              >
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Analyze Selected
                </span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleAnalyzeAll}>
                Analyze All
              </Button>
            </div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl mx-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs text-left border-b border-border bg-section-bg">
                  <th className="w-10 py-2.5 pl-4">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="font-semibold py-2.5 pr-3">Product</th>
                  <th className="font-semibold py-2.5 pr-3">UPC/EAN</th>
                  <th className="font-semibold py-2.5 pr-3">Supplier Price</th>
                  <th className="font-semibold py-2.5 pr-3">Match Status</th>
                  <th className="font-semibold py-2.5 pr-3">ASIN</th>
                  <th className="font-semibold py-2.5 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const match = MATCH_STATUS_DISPLAY[product.matchStatus];
                  return (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pl-4">
                        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleOne(product.id)} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-body text-sm font-medium">{product.supplierTitle}</p>
                        <p className="text-muted text-xs">{product.brand}</p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="font-mono text-xs bg-section-bg px-1.5 py-0.5 rounded">{product.upc}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-body text-sm">${product.supplierPrice.toFixed(2)}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${match.cls}`}>{match.label}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        {product.asin ? <span className="font-mono text-xs text-body">{product.asin}</span> : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Button variant="primary" size="sm" onClick={() => router.push(`/dashboard/analysis/${product.id}`)}>
                          Analyze
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-muted text-sm">Showing 1–{filteredProducts.length} of {SUPPLIER.totalProducts}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
