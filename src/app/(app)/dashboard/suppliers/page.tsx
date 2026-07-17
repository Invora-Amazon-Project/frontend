"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { Supplier } from "@/types";
import { useAppSelector } from "@/lib/hooks";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSuppliers,
  updateSupplier,
  type SupplierRecord,
  type SupplierStatistics,
} from "@/lib/services/suppliersService";

const COUNTRY_FLAGS: Record<string, string> = {
  China: "🇨🇳", Germany: "🇩🇪", "United Kingdom": "🇬🇧",
  Turkey: "🇹🇷", India: "🇮🇳", USA: "🇺🇸",
};

function toSupplier(record: SupplierRecord, stats?: SupplierStatistics): Supplier {
  return {
    id: record.id,
    name: record.name,
    country: record.country ?? "Unknown",
    currency: record.currency ?? "USD",
    contactPerson: record.contactPerson ?? undefined,
    email: record.email ?? undefined,
    phone: record.phone ?? undefined,
    website: record.website ?? undefined,
    moq: record.moq ?? undefined,
    paymentTerms: record.paymentTerms ?? undefined,
    shippingTerms: record.shippingTerms ?? undefined,
    notes: record.notes ?? undefined,
    lastUploadedDate: stats?.lastUploadedDate ?? undefined,
    matchedProducts: stats?.matchedProducts ?? 0,
    profitableProducts: stats?.profitableProducts ?? 0,
    totalOrders: stats?.totalOrders ?? 0,
    averageRoi: stats?.averageRoi ?? 0,
  };
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "TRY", "INR"];

interface SupplierFormState {
  name: string; country: string; currency: string;
  contactPerson: string; email: string; phone: string; website: string;
  moq: string; paymentTerms: string; shippingTerms: string; notes: string;
}

const EMPTY_FORM: SupplierFormState = {
  name: "", country: "", currency: "USD",
  contactPerson: "", email: "", phone: "", website: "",
  moq: "", paymentTerms: "", shippingTerms: "", notes: "",
};

function SupplierCard({
  supplier,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const flag = COUNTRY_FLAGS[supplier.country] ?? "🌍";
  const lastAgo = supplier.lastUploadedDate ? daysAgo(supplier.lastUploadedDate) : null;

  return (
    <div className="bg-card-bg border border-border rounded-xl p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none">{flag}</span>
          <h3 className="text-heading font-semibold text-base truncate">{supplier.name}</h3>
          <span className="bg-section-bg text-muted text-xs rounded px-2 py-0.5 shrink-0">
            {supplier.currency}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href={`/dashboard/suppliers/${supplier.id}`}>
            <Button variant="outline" size="sm">View Imports</Button>
          </Link>
          <Link href={`/dashboard/import?supplierId=${supplier.id}&supplierName=${encodeURIComponent(supplier.name)}`}>
            <Button variant="primary" size="sm">Add List</Button>
          </Link>
          <button
            onClick={() => onEdit(supplier)}
            title="Edit supplier"
            className="p-2 text-muted hover:text-heading transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(supplier)}
            title="Delete supplier"
            className="p-2 text-muted hover:text-rose transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
        <div>
          <p className="text-heading font-bold text-xl">{supplier.matchedProducts}</p>
          <p className="text-muted text-xs mt-0.5">Matched Products</p>
        </div>
        <div>
          <p className="text-mint font-bold text-xl">{supplier.profitableProducts}</p>
          <p className="text-muted text-xs mt-0.5">Profitable Products</p>
        </div>
        <div>
          <p className="text-heading font-bold text-xl">{supplier.totalOrders}</p>
          <p className="text-muted text-xs mt-0.5">Total Orders</p>
        </div>
        <div>
          <p className="text-mint font-semibold text-xl">+{supplier.averageRoi}%</p>
          <p className="text-muted text-xs mt-0.5">Avg. ROI</p>
        </div>
      </div>

      {/* Collapsible detail section */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-primary text-xs font-medium hover:underline flex items-center gap-1 cursor-pointer"
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {expanded ? "Hide details" : "Show details"}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {/* Contact */}
            <div className="col-span-2">
              <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Contact</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {supplier.contactPerson && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-body">{supplier.contactPerson}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                    <a href={`mailto:${supplier.email}`} className="text-primary hover:underline truncate">{supplier.email}</a>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.18 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.12 6.12l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="text-body">{supplier.phone}</span>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{supplier.website}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div>
              <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Terms</p>
              <div className="space-y-1.5">
                {supplier.moq !== undefined && (
                  <div><span className="text-muted text-xs">MOQ: </span><span className="text-body text-xs">{supplier.moq} units</span></div>
                )}
                {supplier.paymentTerms && (
                  <div><span className="text-muted text-xs">Payment: </span><span className="text-body text-xs">{supplier.paymentTerms}</span></div>
                )}
                {supplier.shippingTerms && (
                  <div><span className="text-muted text-xs">Shipping: </span><span className="text-body text-xs">{supplier.shippingTerms}</span></div>
                )}
              </div>
            </div>

            {/* Last upload + notes */}
            <div>
              {supplier.lastUploadedDate && (
                <div className="mb-2">
                  <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">Last Upload</p>
                  <p className="text-body text-xs">{supplier.lastUploadedDate} <span className="text-muted">({daysAgo(supplier.lastUploadedDate)} days ago)</span></p>
                </div>
              )}
              {supplier.notes && (
                <div>
                  <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-muted text-sm">{supplier.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-3 min-w-0">
          {supplier.lastUploadedDate && (
            <span className="text-muted text-xs shrink-0">
              Last uploaded: {supplier.lastUploadedDate}
            </span>
          )}
          {supplier.notes && (
            <span className="text-muted text-xs italic truncate max-w-xs">
              {supplier.notes.length > 60 ? supplier.notes.slice(0, 60) + "…" : supplier.notes}
            </span>
          )}
        </div>
        <Link
          href={`/dashboard/import?supplierId=${supplier.id}&supplierName=${encodeURIComponent(supplier.name)}`}
          className="text-primary text-xs hover:underline cursor-pointer shrink-0"
        >
          Import new list →
        </Link>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const workspaceId = useAppSelector((s) => s.workspace.current?.id);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const setField = (field: keyof SupplierFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      country: supplier.country,
      currency: supplier.currency,
      contactPerson: supplier.contactPerson ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      website: supplier.website ?? "",
      moq: supplier.moq !== undefined ? String(supplier.moq) : "",
      paymentTerms: supplier.paymentTerms ?? "",
      shippingTerms: supplier.shippingTerms ?? "",
      notes: supplier.notes ?? "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    getSuppliers(workspaceId)
      .then(async (records) => {
        if (cancelled) return;
        setSuppliers(records.map((r) => toSupplier(r)));
        setLoading(false);

        // Enrich with per-supplier statistics (list endpoint doesn't return them).
        const enriched = await Promise.all(
          records.map(async (r) => {
            try {
              const detail = await getSupplier(r.id, workspaceId);
              return toSupplier(detail, detail.statistics);
            } catch {
              return toSupplier(r);
            }
          })
        );
        if (!cancelled) setSuppliers(enriched);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (cancelled) return;
        setLoadError(err.response?.data?.message ?? "Failed to load suppliers.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleSubmitForm = async () => {
    if (!form.name.trim()) {
      setFormError("Supplier name is required.");
      return;
    }
    if (!workspaceId) {
      setFormError("No active workspace found.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      workspace_id: workspaceId,
      name: form.name.trim(),
      country: form.country.trim() || undefined,
      currency: form.currency,
      contactPerson: form.contactPerson || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      moq: form.moq ? parseInt(form.moq, 10) : undefined,
      paymentTerms: form.paymentTerms || undefined,
      shippingTerms: form.shippingTerms || undefined,
      notes: form.notes || undefined,
    };

    try {
      if (editingId) {
        const updated = await updateSupplier(editingId, payload);
        setSuppliers((prev) => prev.map((s) => (s.id === editingId ? toSupplier(updated, {
          lastUploadedDate: s.lastUploadedDate ?? null,
          matchedProducts: s.matchedProducts,
          profitableProducts: s.profitableProducts,
          totalOrders: s.totalOrders,
          averageRoi: s.averageRoi,
        }) : s)));
      } else {
        const created = await createSupplier(payload);
        setSuppliers((prev) => [toSupplier(created), ...prev]);
      }
      closeFormModal();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setFormError(axiosErr.response?.data?.message ?? `Failed to ${editingId ? "update" : "create"} supplier.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSupplier || !workspaceId) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteSupplier(deletingSupplier.id, workspaceId);
      setSuppliers((prev) => prev.filter((s) => s.id !== deletingSupplier.id));
      setDeletingSupplier(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      setDeleteError(
        status === 500
          ? "This supplier has related products/orders and can't be deleted yet."
          : axiosErr.response?.data?.message ?? "Failed to delete supplier."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading font-semibold text-2xl">Suppliers</h1>
          <p className="text-muted text-sm mt-1">Manage your supplier relationships and product catalogs.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Supplier
          </span>
        </Button>
      </div>

      {/* Supplier cards */}
      {loading ? (
        <div className="bg-card-bg border border-border rounded-xl p-12 text-center">
          <p className="text-muted text-sm">Loading suppliers…</p>
        </div>
      ) : loadError ? (
        <div className="bg-rose-bg border border-border rounded-xl p-12 text-center">
          <p className="text-rose text-sm">{loadError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {suppliers.map((s) => (
            <SupplierCard key={s.id} supplier={s} onEdit={openEditModal} onDelete={setDeletingSupplier} />
          ))}
          {suppliers.length === 0 && (
            <div className="bg-card-bg border border-border rounded-xl p-12 text-center">
              <p className="text-heading font-semibold text-base">No suppliers yet</p>
              <p className="text-muted text-sm mt-1">Add your first supplier to start importing product lists.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      <Modal isOpen={showFormModal} onClose={closeFormModal}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-heading font-semibold text-lg">{editingId ? "Edit Supplier" : "Add Supplier"}</h2>
            <button
              onClick={closeFormModal}
              className="text-muted hover:text-heading transition-colors p-1 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {formError && (
              <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{formError}</p>
            )}

            {/* Supplier Name */}
            <div>
              <label className="text-muted text-xs font-medium block mb-1">
                Supplier Name <span className="text-rose">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Shanghai Source Co."
                className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
              />
            </div>

            {/* Country + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                  placeholder="e.g. China"
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Contact Person + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setField("contactPerson", e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="contact@supplier.com"
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
                />
              </div>
            </div>

            {/* Phone + Website */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
                />
              </div>
              <div>
                <label className="text-muted text-xs font-medium block mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder="supplier.com"
                  className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
                />
              </div>
            </div>

            {/* MOQ */}
            <div>
              <label className="text-muted text-xs font-medium block mb-1">Minimum Order Quantity (MOQ)</label>
              <input
                type="number"
                value={form.moq}
                onChange={(e) => setField("moq", e.target.value)}
                placeholder="e.g. 100"
                min="0"
                className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="text-muted text-xs font-medium block mb-1">Payment Terms</label>
              <input
                type="text"
                value={form.paymentTerms}
                onChange={(e) => setField("paymentTerms", e.target.value)}
                placeholder="e.g. 30% deposit, 70% before shipment"
                className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
              />
            </div>

            {/* Shipping Terms */}
            <div>
              <label className="text-muted text-xs font-medium block mb-1">Shipping Terms</label>
              <input
                type="text"
                value={form.shippingTerms}
                onChange={(e) => setField("shippingTerms", e.target.value)}
                placeholder="e.g. FOB Shanghai"
                className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-muted text-xs font-medium block mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Any additional notes about this supplier…"
                rows={3}
                className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder resize-none"
              />
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border shrink-0">
            <Button variant="ghost" size="md" onClick={closeFormModal} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmitForm} disabled={submitting}>
              {submitting ? (editingId ? "Saving…" : "Adding…") : editingId ? "Save Changes" : "Add Supplier"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingSupplier} onClose={() => { setDeletingSupplier(null); setDeleteError(""); }}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Delete Supplier</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p className="text-body text-sm">
              Are you sure you want to delete <span className="font-semibold">{deletingSupplier?.name}</span>? This
              cannot be undone.
            </p>
            {deleteError && (
              <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{deleteError}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button
              variant="ghost"
              size="md"
              onClick={() => { setDeletingSupplier(null); setDeleteError(""); }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
