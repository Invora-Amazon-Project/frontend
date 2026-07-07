"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { InventoryItem } from "@/types";

// TODO: Replace with real API call — GET /inventory

interface InventoryDisplay extends InventoryItem {
  brand: string;
  unitCost: number;
  supplierId: string;
  supplierName: string;
}

const MOCK_INVENTORY: InventoryDisplay[] = [
  {
    id: "inv1", productName: "Silicone Kitchen Tongs Set 2-Pack", brand: "OXO",
    asin: "B08XK3LMND", currentStock: 14, minimumStockLevel: 50,
    estimatedStockEndDate: "2026-07-11", isReorderCandidate: true,
    lastOrderDate: "2026-05-10", roi: 40, unitCost: 4.20, supplierId: "s1", supplierName: "Shanghai Source Co.",
  },
  {
    id: "inv2", productName: "Bamboo Cutting Board Large 18x12", brand: "Royal Craft",
    asin: "B07THGP5WK", currentStock: 92, minimumStockLevel: 40,
    estimatedStockEndDate: "2026-08-20", isReorderCandidate: false,
    lastOrderDate: "2026-06-28", roi: 54, unitCost: 10.20, supplierId: "s2", supplierName: "Royal Trading Ltd.",
  },
  {
    id: "inv3", productName: "Wooden Spoon Set 6-Piece", brand: "Riveira",
    asin: "B07KF16JZL", currentStock: 0, minimumStockLevel: 60,
    estimatedStockEndDate: "2026-07-06", isReorderCandidate: true,
    lastOrderDate: "2026-04-15", roi: 44, unitCost: 3.40, supplierId: "s1", supplierName: "Shanghai Source Co.",
  },
  {
    id: "inv4", productName: "Collapsible Silicone Water Bottle 750ml", brand: "Nomader",
    asin: "B08ZTLMKPD", currentStock: 22, minimumStockLevel: 20,
    estimatedStockEndDate: "2026-07-17", isReorderCandidate: false,
    lastOrderDate: "2026-06-25", roi: 51, unitCost: 5.40, supplierId: "s3", supplierName: "Nomader Europe GmbH",
  },
  {
    id: "inv5", productName: "Vegetable Spiralizer 5-Blade", brand: "Brieftons",
    asin: "B00GRIR87U", currentStock: 145, minimumStockLevel: 50,
    estimatedStockEndDate: "2026-09-10", isReorderCandidate: false,
    lastOrderDate: "2026-06-30", roi: 47, unitCost: 11.40, supplierId: "s4", supplierName: "Brieftons International",
  },
  {
    id: "inv6", productName: "Lodge Cast Iron Skillet 10.25 Inch", brand: "Lodge",
    asin: "B00G2XGC88", currentStock: 31, minimumStockLevel: 30,
    estimatedStockEndDate: "2026-07-25", isReorderCandidate: true,
    lastOrderDate: "2026-06-01", roi: 38, unitCost: 14.90, supplierId: "s1", supplierName: "Shanghai Source Co.",
  },
  {
    id: "inv7", productName: "Eco Yoga Mat Non-Slip 6mm", brand: "Gaiam",
    asin: "B079YRMDPP", currentStock: 5, minimumStockLevel: 40,
    estimatedStockEndDate: "2026-07-08", isReorderCandidate: true,
    lastOrderDate: "2026-05-20", roi: 55, unitCost: 9.80, supplierId: "s2", supplierName: "Royal Trading Ltd.",
  },
  {
    id: "inv8", productName: "Stainless Steel Reusable Straws 8-Pack", brand: "Hiware",
    asin: "B074VG7SZH", currentStock: 210, minimumStockLevel: 80,
    estimatedStockEndDate: "2026-10-15", isReorderCandidate: false,
    lastOrderDate: "2026-07-01", roi: 62, unitCost: 2.80, supplierId: "s3", supplierName: "Nomader Europe GmbH",
  },
];

const SUPPLIERS = [
  { id: "s1", name: "Shanghai Source Co." },
  { id: "s2", name: "Royal Trading Ltd." },
  { id: "s3", name: "Nomader Europe GmbH" },
  { id: "s4", name: "Brieftons International" },
];

type TabKey = "all" | "low" | "reorder" | "out";
type StockStatus = "critical" | "low" | "reorder" | "healthy";

const TODAY = new Date("2026-07-06");

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr);
  return Math.ceil((end.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

function getStockStatus(item: InventoryDisplay): StockStatus {
  if (item.currentStock === 0 || item.currentStock < item.minimumStockLevel) return "critical";
  if (item.currentStock <= item.minimumStockLevel * 1.2) return "low";
  if (item.isReorderCandidate) return "reorder";
  return "healthy";
}

function filterByTab(items: InventoryDisplay[], tab: TabKey): InventoryDisplay[] {
  if (tab === "all")    return items;
  if (tab === "out")    return items.filter((i) => i.currentStock === 0);
  if (tab === "low")    return items.filter((i) => {
    const s = getStockStatus(i);
    return s === "critical" || s === "low";
  });
  if (tab === "reorder") return items.filter((i) => i.isReorderCandidate);
  return items;
}

function StockStatusBadge({ status }: { status: StockStatus }) {
  const styles: Record<StockStatus, string> = {
    critical: "bg-rose-bg text-rose",
    low:      "bg-peach-bg text-peach",
    reorder:  "bg-primary-light text-primary",
    healthy:  "bg-mint-bg text-mint",
  };
  const labels: Record<StockStatus, string> = {
    critical: "Critical",
    low:      "Low",
    reorder:  "Reorder Candidate",
    healthy:  "Healthy",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function InventoryPage() {
  const [items, setItems]             = useState<InventoryDisplay[]>(MOCK_INVENTORY);
  const [activeTab, setActiveTab]     = useState<TabKey>("all");
  const [editingMinId, setEditingMinId] = useState<string | null>(null);
  const [editingMinVal, setEditingMinVal] = useState<string>("");
  const [reorderItem, setReorderItem] = useState<InventoryDisplay | null>(null);
  const [reorderQty, setReorderQty]   = useState("100");
  const [reorderSupplier, setReorderSupplier] = useState("");
  const [toast, setToast]             = useState<string | null>(null);

  const filtered        = filterByTab(items, activeTab);
  const criticalCount   = items.filter((i) => getStockStatus(i) === "critical").length;

  const tabCount = (tab: TabKey) => filterByTab(items, tab).length;
  const TABS: { key: TabKey; label: string }[] = [
    { key: "all",    label: `All Products (${tabCount("all")})` },
    { key: "low",    label: `Low Stock (${tabCount("low")})` },
    { key: "reorder",label: `Reorder Candidates (${tabCount("reorder")})` },
    { key: "out",    label: `Out of Stock (${tabCount("out")})` },
  ];

  const startEditMin = (item: InventoryDisplay) => {
    setEditingMinId(item.id);
    setEditingMinVal(String(item.minimumStockLevel));
  };

  const commitEditMin = (id: string) => {
    const parsed = parseInt(editingMinVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, minimumStockLevel: parsed } : i));
    }
    setEditingMinId(null);
  };

  const openReorder = (item: InventoryDisplay) => {
    setReorderItem(item);
    setReorderQty("100");
    setReorderSupplier(item.supplierId);
  };

  const createDraftOrder = () => {
    setReorderItem(null);
    setToast(`Draft order created for ${reorderItem?.productName ?? "product"}.`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-heading font-semibold text-2xl">Inventory &amp; Reorder</h1>
          <p className="text-muted text-sm mt-1">Monitor your stock levels and identify reorder opportunities.</p>
        </div>
      </div>

      {/* Critical alert banner */}
      {criticalCount > 0 && (
        <div className="bg-rose-bg border border-rose/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-rose font-medium text-sm">
            ⚠️ {criticalCount} product{criticalCount !== 1 ? "s are" : " is"} below minimum stock level
          </p>
          <button
            onClick={() => setActiveTab("low")}
            className="text-rose text-sm font-medium underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            View critical items
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-body"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-section-bg">
              {["Product", "ASIN", "Current Stock", "Min. Stock Level", "Est. End Date", "ROI", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status  = getStockStatus(item);
              const days    = daysUntil(item.estimatedStockEndDate);
              const stockColor =
                item.currentStock < item.minimumStockLevel ? "text-rose" :
                item.currentStock <= item.minimumStockLevel * 1.2 ? "text-peach" :
                "text-mint";
              const dateColor = days < 7 ? "text-rose" : days < 14 ? "text-peach" : "text-muted";
              const showReorder = status === "critical" || status === "low" || status === "reorder";

              return (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-page-bg transition-colors">
                  {/* Product */}
                  <td className="px-4 py-3">
                    <p className="text-body text-sm font-medium leading-snug">{item.productName}</p>
                    <p className="text-muted text-xs mt-0.5">{item.brand}</p>
                  </td>
                  {/* ASIN */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted">{item.asin}</span>
                  </td>
                  {/* Current stock */}
                  <td className="px-4 py-3">
                    <span className={`font-bold text-base ${stockColor}`}>{item.currentStock}</span>
                    <span className="text-muted text-xs ml-1">units</span>
                  </td>
                  {/* Min stock — inline editable */}
                  <td className="px-4 py-3">
                    {editingMinId === item.id ? (
                      <input
                        type="number"
                        autoFocus
                        value={editingMinVal}
                        onChange={(e) => setEditingMinVal(e.target.value)}
                        onBlur={() => commitEditMin(item.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEditMin(item.id); if (e.key === "Escape") setEditingMinId(null); }}
                        className="w-16 border border-primary rounded px-2 py-0.5 text-sm text-body bg-page-bg outline-none"
                        min="0"
                      />
                    ) : (
                      <button
                        onClick={() => startEditMin(item)}
                        className="text-body text-sm hover:text-primary transition-colors border-b border-dashed border-muted/40 hover:border-primary cursor-pointer"
                        title="Click to edit"
                      >
                        {item.minimumStockLevel}
                      </button>
                    )}
                  </td>
                  {/* Est. end date */}
                  <td className="px-4 py-3">
                    <p className={`text-sm font-medium ${dateColor}`}>
                      {days <= 0 ? "Today" : `in ${days} day${days !== 1 ? "s" : ""}`}
                    </p>
                    <p className="text-muted text-xs mt-0.5">{item.estimatedStockEndDate}</p>
                  </td>
                  {/* ROI */}
                  <td className="px-4 py-3">
                    <span className={`font-medium ${item.roi >= 0 ? "text-mint" : "text-rose"}`}>
                      {item.roi >= 0 ? "+" : ""}{item.roi}%
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <StockStatusBadge status={status} />
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {showReorder && (
                        <Button variant="primary" size="sm" onClick={() => openReorder(item)}>
                          Reorder
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">Update Stock</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted text-sm">
                  No items match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reorder Modal */}
      <Modal isOpen={!!reorderItem} onClose={() => setReorderItem(null)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-heading font-semibold text-lg">Create Reorder</h2>
            <button
              onClick={() => setReorderItem(null)}
              className="text-muted hover:text-heading transition-colors p-1 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {reorderItem && (
            <div className="space-y-4">
              {/* Product (read-only) */}
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Product</label>
                <div className="bg-section-bg rounded-lg px-3 py-2.5">
                  <p className="text-body text-sm font-medium">{reorderItem.productName}</p>
                  <p className="font-mono text-xs text-muted mt-0.5">{reorderItem.asin}</p>
                </div>
              </div>

              {/* Supplier dropdown */}
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Supplier</label>
                <select
                  value={reorderSupplier}
                  onChange={(e) => setReorderSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary"
                >
                  {SUPPLIERS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity + unit cost row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-xs font-medium block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-muted text-xs font-medium block mb-1">Unit Cost (USD)</label>
                  <input
                    type="number"
                    defaultValue={reorderItem.unitCost}
                    step="0.01"
                    className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary"
                    min="0"
                  />
                </div>
              </div>

              {/* Estimated total */}
              <div className="bg-section-bg rounded-lg px-3 py-2.5 flex items-center justify-between">
                <span className="text-muted text-xs">Estimated Order Total</span>
                <span className="text-heading text-sm font-semibold">
                  ${(parseFloat(reorderQty || "0") * reorderItem.unitCost).toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="primary" size="md" onClick={createDraftOrder}>
                  Create Draft Order
                </Button>
                <Button variant="ghost" size="md" onClick={() => setReorderItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-heading text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
