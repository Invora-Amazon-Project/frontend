"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAppSelector } from "@/lib/hooks";
import { getSupplierProducts, type SupplierProductRecord } from "@/lib/services/supplierProductsService";
import { getAmazonProductMetrics } from "@/lib/services/amazonProductMetricsService";
import {
  createProfitCalculation,
  getProfitCalculations,
  updateProfitCalculation,
  type ProfitCalculationRecord,
} from "@/lib/services/profitCalculationsService";

function formatCurrency(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roiCls(roi: number) {
  if (roi < 0) return "text-rose";
  if (roi < 20) return "text-peach";
  return "text-mint";
}

export default function ProfitCalculationsPage() {
  const workspaceId = useAppSelector((s) => s.workspace.current?.id);

  const [calcs, setCalcs] = useState<ProfitCalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [supplierProducts, setSupplierProducts] = useState<SupplierProductRecord[]>([]);
  // GET /profit-calculations/{workspace_id} returns supplierProduct flat (no nested
  // product) — join client-side against GET /supplier-products to show product identity.
  const supplierProductById = new Map(supplierProducts.map((sp) => [sp.id, sp]));

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSpId, setSelectedSpId] = useState("");
  const [resolvingMetric, setResolvingMetric] = useState(false);
  const [amazonMetricId, setAmazonMetricId] = useState<string | null>(null);
  const [metricError, setMetricError] = useState("");
  const [vat, setVat] = useState("0");
  const [customs, setCustoms] = useState("0");
  const [shippingTotal, setShippingTotal] = useState("0");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingCalc, setEditingCalc] = useState<ProfitCalculationRecord | null>(null);
  const [editForm, setEditForm] = useState({ vat: "0", customs: "0", shipping_total: "0" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const loadCalcs = () => {
    if (!workspaceId) return;
    setLoading(true);
    setLoadError("");
    getProfitCalculations(workspaceId)
      .then(setCalcs)
      .catch((err: AxiosError<{ message?: string }>) => {
        setLoadError(err.response?.data?.message ?? "Failed to load profit calculations.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCalcs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    getSupplierProducts(workspaceId).then(setSupplierProducts).catch(() => setSupplierProducts([]));
  }, [workspaceId]);

  const openCreate = () => {
    setSelectedSpId("");
    setAmazonMetricId(null);
    setMetricError("");
    setVat("0");
    setCustoms("0");
    setShippingTotal("0");
    setCreateError("");
    setIsCreateOpen(true);
  };

  const handleSelectSupplierProduct = async (spId: string) => {
    setSelectedSpId(spId);
    setAmazonMetricId(null);
    setMetricError("");
    const sp = supplierProducts.find((p) => p.id === spId);
    if (!sp?.product_id) return;

    setResolvingMetric(true);
    try {
      const snapshots = await getAmazonProductMetrics(sp.product_id);
      if (snapshots.latest) {
        setAmazonMetricId(snapshots.latest.id);
      } else {
        setMetricError("No Amazon metrics snapshot exists yet for this product — capture one before calculating profit.");
      }
    } catch {
      setMetricError("No Amazon metrics snapshot exists yet for this product — capture one before calculating profit.");
    } finally {
      setResolvingMetric(false);
    }
  };

  const handleCreate = async () => {
    if (!workspaceId || !selectedSpId || !amazonMetricId) return;
    setCreateSaving(true);
    setCreateError("");
    try {
      const created = await createProfitCalculation({
        supplier_product_id: selectedSpId,
        amazon_metric_id: amazonMetricId,
        workspace_id: workspaceId,
        vat: parseFloat(vat) || 0,
        customs: parseFloat(customs) || 0,
        shipping_total: parseFloat(shippingTotal) || 0,
      });
      setCalcs((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setCreateError(axiosErr.response?.data?.message ?? "Failed to create profit calculation.");
    } finally {
      setCreateSaving(false);
    }
  };

  const openEdit = (calc: ProfitCalculationRecord) => {
    setEditingCalc(calc);
    setEditForm({
      vat: calc.vat ?? "0",
      customs: calc.customs ?? "0",
      shipping_total: calc.shipping_total ?? "0",
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editingCalc) return;
    setEditSaving(true);
    setEditError("");
    try {
      const updated = await updateProfitCalculation(editingCalc.id, {
        vat: parseFloat(editForm.vat) || 0,
        customs: parseFloat(editForm.customs) || 0,
        shipping_total: parseFloat(editForm.shipping_total) || 0,
      });
      setCalcs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCalc(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setEditError(axiosErr.response?.data?.message ?? "Failed to update profit calculation.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-heading font-semibold text-xl">Profit Calculations</h1>
          <p className="text-muted text-sm mt-0.5">
            Estimated profit &amp; ROI per supplier product, based on the latest Amazon metrics snapshot.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          + New Calculation
        </Button>
      </div>

      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-muted text-sm px-5 py-10 text-center">Loading…</p>
        ) : loadError ? (
          <p className="text-rose text-sm px-5 py-10 text-center">{loadError}</p>
        ) : calcs.length === 0 ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="18" y1="20" x2="18" y2="10" />
              </svg>
            }
            title="No profit calculations yet"
            description="Use the New Calculation button above to run one for a supplier product."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Product</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Cost Price</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Buy Box Price</th>
                <th className="text-left px-5 py-3 text-muted font-medium">VAT / Customs / Shipping</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Est. Profit</th>
                <th className="text-left px-5 py-3 text-muted font-medium">ROI</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {calcs.map((c) => {
                const roi = c.roi ? parseFloat(c.roi) : 0;
                const sp = supplierProductById.get(c.supplier_product_id) ?? c.supplierProduct;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                    <td className="px-5 py-3.5 max-w-[240px]">
                      <p className="text-body text-sm font-medium line-clamp-1">
                        {sp?.product?.amazon_title || "Unknown Product"}
                      </p>
                      <p className="text-muted text-xs mt-0.5 font-mono">{sp?.product?.asin ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-body text-sm">
                      {sp ? `${sp.currency} ${parseFloat(sp.cost_price).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-body text-sm">
                      {c.amazonMetric ? formatCurrency(Number(c.amazonMetric.buybox_price)) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      {formatCurrency(parseFloat(c.vat ?? "0"))} / {formatCurrency(parseFloat(c.customs ?? "0"))} / {formatCurrency(parseFloat(c.shipping_total ?? "0"))}
                    </td>
                    <td className="px-5 py-3.5 text-body text-sm font-medium">
                      {c.estimated_profit ? formatCurrency(parseFloat(c.estimated_profit)) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-semibold ${roiCls(roi)}`}>{roi.toFixed(1)}%</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">New Profit Calculation</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Supplier Product</label>
              <select
                value={selectedSpId}
                onChange={(e) => handleSelectSupplierProduct(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-page-bg w-full"
              >
                <option value="">Select a product</option>
                {supplierProducts.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.product?.amazon_title ?? sp.product_id} ({sp.supplier?.name ?? "—"})
                  </option>
                ))}
              </select>
            </div>
            {resolvingMetric && <p className="text-muted text-xs">Resolving latest Amazon metrics snapshot…</p>}
            {metricError && <p className="text-peach text-xs bg-peach-bg px-3 py-2 rounded-lg">{metricError}</p>}
            {amazonMetricId && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="VAT" type="number" step="0.01" value={vat} onChange={(e) => setVat(e.target.value)} />
                  <Input label="Customs" type="number" step="0.01" value={customs} onChange={(e) => setCustoms(e.target.value)} />
                  <Input label="Shipping" type="number" step="0.01" value={shippingTotal} onChange={(e) => setShippingTotal(e.target.value)} />
                </div>
              </>
            )}
            {createError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{createError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsCreateOpen(false)} disabled={createSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate} disabled={createSaving || !amazonMetricId}>
              {createSaving ? "Calculating…" : "Calculate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingCalc} onClose={() => setEditingCalc(null)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Edit Profit Calculation</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="VAT"
                type="number"
                step="0.01"
                value={editForm.vat}
                onChange={(e) => setEditForm((prev) => ({ ...prev, vat: e.target.value }))}
              />
              <Input
                label="Customs"
                type="number"
                step="0.01"
                value={editForm.customs}
                onChange={(e) => setEditForm((prev) => ({ ...prev, customs: e.target.value }))}
              />
              <Input
                label="Shipping"
                type="number"
                step="0.01"
                value={editForm.shipping_total}
                onChange={(e) => setEditForm((prev) => ({ ...prev, shipping_total: e.target.value }))}
              />
            </div>
            <p className="text-muted text-xs">Estimated profit and ROI are recalculated automatically on save.</p>
            {editError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{editError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setEditingCalc(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
