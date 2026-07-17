"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAppSelector } from "@/lib/hooks";
import { getSupplier, type SupplierDetail } from "@/lib/services/suppliersService";
import {
  deleteSupplierList,
  getCurrentSupplierList,
  getSupplierLists,
  type SupplierListRecord,
} from "@/lib/services/supplierListsService";
import {
  createListProduct,
  getListProducts,
  type ListProductMatchStatus,
  type ListProductRecord,
} from "@/lib/services/listProductsService";
import {
  getSupplierProducts,
  updateSupplierProduct,
  type SupplierProductRecord,
  type SupplierProductUpdatePayload,
} from "@/lib/services/supplierProductsService";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function fileNameFromList(list: SupplierListRecord): string {
  if (list.file_url) {
    try {
      const path = new URL(list.file_url).pathname;
      return path.split("/").pop() || list.file_url;
    } catch {
      return list.file_url.split("/").pop() || list.file_url;
    }
  }
  return list.source_type === "manual" ? "Manual Entry" : list.source_type;
}

const MATCH_STATUS_DISPLAY: Record<ListProductMatchStatus, { label: string; cls: string }> = {
  AUTO_MATCHED: { label: "Matched", cls: "bg-mint-bg text-mint" },
  MANUALLY_MATCHED: { label: "Matched", cls: "bg-mint-bg text-mint" },
  NEEDS_REVIEW: { label: "Needs Review", cls: "bg-peach-bg text-peach" },
  PENDING: { label: "Pending", cls: "bg-peach-bg text-peach" },
  REJECTED: { label: "Unmatched", cls: "bg-rose-bg text-rose" },
};

function isPlaceholderAsin(asin: string | null | undefined): boolean {
  return !asin || asin.startsWith("PENDING");
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const workspaceId = useAppSelector((s) => s.workspace.current?.id);
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [lists, setLists] = useState<SupplierListRecord[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState("");
  const [deletingList, setDeletingList] = useState<SupplierListRecord | null>(null);
  const [deletingListError, setDeletingListError] = useState("");
  const [deletingListBusy, setDeletingListBusy] = useState(false);
  const [currentList, setCurrentList] = useState<SupplierListRecord | null>(null);

  const [listProducts, setListProducts] = useState<ListProductRecord[]>([]);
  const [listProductsLoading, setListProductsLoading] = useState(false);
  const [listProductsError, setListProductsError] = useState("");
  const [costByProductId, setCostByProductId] = useState<Record<string, SupplierProductRecord>>({});

  const [editingCost, setEditingCost] = useState<SupplierProductRecord | null>(null);
  const [costForm, setCostForm] = useState<SupplierProductUpdatePayload>({});
  const [costSaving, setCostSaving] = useState(false);
  const [costError, setCostError] = useState("");

  const openCostEdit = (record: SupplierProductRecord) => {
    setEditingCost(record);
    setCostForm({
      supplier_sku: record.supplier_sku ?? "",
      cost_price: parseFloat(record.cost_price),
      currency: record.currency,
      stock: record.stock,
      moq: record.moq,
      shipping_cost: record.shipping_cost ? parseFloat(record.shipping_cost) : undefined,
    });
    setCostError("");
  };

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [addProductForm, setAddProductForm] = useState<{ raw_title: string }>({ raw_title: "" });
  const [addProductSaving, setAddProductSaving] = useState(false);
  const [addProductError, setAddProductError] = useState("");

  const handleAddProduct = async () => {
    if (!activeListId || !addProductForm.raw_title.trim()) return;
    setAddProductSaving(true);
    setAddProductError("");
    try {
      const nextRowNumber = listProducts.length > 0 ? Math.max(...listProducts.map((p) => p.row_number)) + 1 : 1;
      const created = await createListProduct({
        list_id: activeListId,
        row_number: nextRowNumber,
        raw_title: addProductForm.raw_title.trim(),
        raw_data_json: { source: "manual" },
        match_status: "PENDING",
      });
      setListProducts((prev) => [...prev, created]);
      setIsAddProductOpen(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setAddProductError(axiosErr.response?.data?.message ?? "Failed to add product.");
    } finally {
      setAddProductSaving(false);
    }
  };

  const handleCostSave = async () => {
    if (!editingCost || !workspaceId) return;
    setCostSaving(true);
    setCostError("");
    try {
      const updated = await updateSupplierProduct(editingCost.id, costForm, workspaceId);
      setCostByProductId((prev) => ({ ...prev, [updated.product_id]: updated }));
      setEditingCost(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setCostError(axiosErr.response?.data?.message ?? "Failed to update supplier product.");
    } finally {
      setCostSaving(false);
    }
  };

  useEffect(() => {
    if (!workspaceId || !params.id) return;
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    getSupplier(params.id, workspaceId)
      .then((data) => {
        if (!cancelled) setSupplier(data);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setLoadError(err.response?.data?.message ?? "Failed to load supplier.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, params.id]);

  useEffect(() => {
    if (!workspaceId || !params.id) return;
    let cancelled = false;

    setListsLoading(true);
    setListsError("");

    getSupplierLists(workspaceId)
      .then((records) => {
        if (cancelled) return;
        setLists(records.filter((r) => r.supplier_id === params.id));
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setListsError(err.response?.data?.message ?? "Failed to load uploaded lists.");
      })
      .finally(() => {
        if (!cancelled) setListsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, params.id]);

  useEffect(() => {
    if (!workspaceId || !params.id) return;
    let cancelled = false;

    getCurrentSupplierList(workspaceId, params.id)
      .then((record) => {
        if (!cancelled) setCurrentList(record);
      })
      .catch(() => {
        if (!cancelled) setCurrentList(null);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, params.id]);

  useEffect(() => {
    if (!activeListId || !workspaceId || !params.id) return;
    let cancelled = false;

    setListProductsLoading(true);
    setListProductsError("");

    Promise.all([
      getListProducts(activeListId),
      getSupplierProducts(workspaceId).catch(() => [] as SupplierProductRecord[]),
    ])
      .then(([lp, sp]) => {
        if (cancelled) return;
        setListProducts(lp);
        const map: Record<string, SupplierProductRecord> = {};
        sp.filter((r) => r.supplier_id === params.id && r.product_id).forEach((r) => {
          map[r.product_id] = r;
        });
        setCostByProductId(map);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setListProductsError(err.response?.data?.message ?? "Failed to load products.");
      })
      .finally(() => {
        if (!cancelled) setListProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeListId, workspaceId, params.id]);

  const handleConfirmDeleteList = async () => {
    if (!deletingList || !workspaceId) return;

    setDeletingListBusy(true);
    setDeletingListError("");

    try {
      await deleteSupplierList(deletingList.id, workspaceId);
      setLists((prev) => prev.filter((l) => l.id !== deletingList.id));
      if (activeListId === deletingList.id) setActiveListId(null);
      setDeletingList(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setDeletingListError(axiosErr.response?.data?.message ?? "Failed to delete list.");
    } finally {
      setDeletingListBusy(false);
    }
  };

  const filteredProducts = listProducts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.raw_title.toLowerCase().includes(q) ||
      (p.product?.brand ?? "").toLowerCase().includes(q)
    );
  });

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
    alert(`Sending all ${listProducts.length} products to analysis...`);
  };

  if (loading) {
    return (
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <p className="text-muted text-sm">Loading supplier…</p>
      </div>
    );
  }

  if (loadError || !supplier) {
    return (
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <a href="/dashboard/suppliers" className="text-primary text-sm hover:underline">
          ← Back to Suppliers
        </a>
        <p className="text-rose text-sm mt-3">{loadError || "Supplier not found."}</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── SUPPLIER INFO HEADER ── */}
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <a href="/dashboard/suppliers" className="text-primary text-sm hover:underline">
          ← Back to Suppliers
        </a>

        <h1 className="text-heading font-bold text-xl mt-2">{supplier.name}</h1>
        <p className="text-muted text-sm mt-0.5">
          {supplier.country ?? "Unknown"} · <span className="bg-section-bg text-muted text-xs rounded px-1.5 py-0.5">{supplier.currency ?? "USD"}</span>
          {supplier.email ? ` · ${supplier.email}` : ""}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-heading font-bold text-xl">{supplier.statistics.matchedProducts}</p>
            <p className="text-muted text-xs mt-0.5">Matched Products</p>
          </div>
          <div>
            <p className="text-mint font-bold text-xl">{supplier.statistics.totalOrders}</p>
            <p className="text-muted text-xs mt-0.5">Total Orders</p>
          </div>
          <div>
            <p className="text-muted font-bold text-xl">{timeAgo(supplier.statistics.lastUploadedDate)}</p>
            <p className="text-muted text-xs mt-0.5">Last Upload</p>
          </div>
        </div>

        {currentList && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
            <span className="bg-mint-bg text-mint text-xs rounded-full px-2 py-0.5 shrink-0">Current List</span>
            <span className="text-body font-mono truncate">{fileNameFromList(currentList)}</span>
            <span className="text-muted text-xs shrink-0">· {timeAgo(currentList.uploaded_at)}</span>
          </div>
        )}
      </div>

      {/* ── UPLOADED LISTS ── */}
      <div className="bg-card-bg border border-border rounded-xl p-5 mx-6 mt-6">
        <h2 className="text-heading font-semibold text-sm mb-3">Uploaded Lists</h2>
        {listsLoading ? (
          <p className="text-muted text-sm py-4">Loading uploaded lists…</p>
        ) : listsError ? (
          <p className="text-rose text-sm py-4">{listsError}</p>
        ) : lists.length === 0 ? (
          <p className="text-muted text-sm py-4">No lists uploaded yet for this supplier.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs text-left border-b border-border">
                <th className="font-semibold pb-2 pr-3">File</th>
                <th className="font-semibold pb-2 pr-3">Uploaded</th>
                <th className="font-semibold pb-2 pr-3">Status</th>
                <th className="font-semibold pb-2 pr-3">Current</th>
                <th className="font-semibold pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((list) => (
                <tr key={list.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 text-body text-sm font-mono">{fileNameFromList(list)}</td>
                  <td className="py-2.5 pr-3 text-body">{timeAgo(list.uploaded_at)}</td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge status={list.status} />
                  </td>
                  <td className="py-2.5 pr-3">
                    {list.is_current && (
                      <span className="bg-mint-bg text-mint text-xs rounded-full px-2 py-0.5">Current</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveListId(list.id)}>
                        View Products
                      </Button>
                      <button
                        onClick={() => setDeletingList(list)}
                        title="Delete list"
                        className="p-2 text-muted hover:text-rose transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete List Confirmation Modal */}
      <Modal isOpen={!!deletingList} onClose={() => { setDeletingList(null); setDeletingListError(""); }}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Delete List</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p className="text-body text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deletingList ? fileNameFromList(deletingList) : ""}</span>? This cannot
              be undone.
            </p>
            {deletingListError && (
              <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{deletingListError}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button
              variant="ghost"
              size="md"
              onClick={() => { setDeletingList(null); setDeletingListError(""); }}
              disabled={deletingListBusy}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmDeleteList} disabled={deletingListBusy}>
              {deletingListBusy ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Supplier Product Modal */}
      <Modal isOpen={!!editingCost} onClose={() => setEditingCost(null)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Edit Supplier Product</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cost Price"
                type="number"
                step="0.01"
                value={costForm.cost_price ?? ""}
                onChange={(e) => setCostForm((prev) => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                label="Currency"
                value={costForm.currency ?? ""}
                onChange={(e) => setCostForm((prev) => ({ ...prev, currency: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stock"
                type="number"
                value={costForm.stock ?? ""}
                onChange={(e) => setCostForm((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              />
              <Input
                label="MOQ"
                type="number"
                value={costForm.moq ?? ""}
                onChange={(e) => setCostForm((prev) => ({ ...prev, moq: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <Input
              label="Shipping Cost"
              type="number"
              step="0.01"
              value={costForm.shipping_cost ?? ""}
              onChange={(e) => setCostForm((prev) => ({ ...prev, shipping_cost: parseFloat(e.target.value) || undefined }))}
            />
            <Input
              label="Supplier SKU"
              value={costForm.supplier_sku ?? ""}
              onChange={(e) => setCostForm((prev) => ({ ...prev, supplier_sku: e.target.value }))}
            />
            {costError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{costError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setEditingCost(null)} disabled={costSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCostSave} disabled={costSaving}>
              {costSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Product Modal */}
      <Modal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Add Product to List</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <Input
              label="Product Title"
              placeholder="e.g. Silicone Kitchen Tongs Set 2-Pack"
              value={addProductForm.raw_title}
              onChange={(e) => setAddProductForm({ raw_title: e.target.value })}
            />
            <p className="text-muted text-xs">
              This adds an unmatched row to the list — it won&apos;t be linked to an Amazon product until matched via
              Matching Review.
            </p>
            {addProductError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{addProductError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsAddProductOpen(false)} disabled={addProductSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddProduct}
              disabled={addProductSaving || !addProductForm.raw_title.trim()}
            >
              {addProductSaving ? "Adding…" : "Add Product"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── PRODUCT LIST ── */}
      {activeListId && (
        <>
          <div className="flex items-center justify-between px-6 mt-6 mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm">{listProducts.length} products</span>
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
              <Button variant="outline" size="sm" onClick={() => { setAddProductForm({ raw_title: "" }); setAddProductError(""); setIsAddProductOpen(true); }}>
                + Add Product
              </Button>
            </div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl mx-6 overflow-hidden">
            {listProductsLoading ? (
              <p className="text-muted text-sm px-5 py-10 text-center">Loading products…</p>
            ) : listProductsError ? (
              <p className="text-rose text-sm px-5 py-10 text-center">{listProductsError}</p>
            ) : (
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
                  {filteredProducts.map((lp) => {
                    const match = MATCH_STATUS_DISPLAY[lp.match_status] ?? MATCH_STATUS_DISPLAY.PENDING;
                    const cost = lp.product_id ? costByProductId[lp.product_id] : undefined;
                    const asin = lp.product?.asin;
                    return (
                      <tr key={lp.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pl-4">
                          <input type="checkbox" checked={selectedIds.includes(lp.id)} onChange={() => toggleOne(lp.id)} />
                        </td>
                        <td className="py-2.5 pr-3">
                          <p className="text-body text-sm font-medium">{lp.raw_title}</p>
                          <p className="text-muted text-xs">{lp.product?.brand ?? "—"}</p>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="font-mono text-xs bg-section-bg px-1.5 py-0.5 rounded">
                            {lp.product?.upc || lp.product?.ean || "—"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-body text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>{cost ? `${cost.currency} ${parseFloat(cost.cost_price).toFixed(2)}` : "—"}</span>
                            {cost && (
                              <button
                                onClick={() => openCostEdit(cost)}
                                title="Edit price/stock"
                                className="text-muted hover:text-primary transition-colors cursor-pointer"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${match.cls}`}>{match.label}</span>
                        </td>
                        <td className="py-2.5 pr-3">
                          {!isPlaceholderAsin(asin) ? (
                            <span className="font-mono text-xs text-body">{asin}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!lp.product_id}
                            className={!lp.product_id ? "opacity-50 cursor-not-allowed" : ""}
                            onClick={() => lp.product_id && router.push(`/dashboard/analysis/${lp.product_id}`)}
                          >
                            Analyze
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">
                        No products found in this list.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-muted text-sm">Showing 1–{filteredProducts.length} of {listProducts.length}</p>
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
