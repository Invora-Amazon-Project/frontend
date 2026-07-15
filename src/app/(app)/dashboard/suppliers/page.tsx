"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { Supplier } from "@/types";

// TODO: Replace with real API call — GET /suppliers

const COUNTRY_FLAGS: Record<string, string> = {
  China: "🇨🇳", Germany: "🇩🇪", "United Kingdom": "🇬🇧",
  Turkey: "🇹🇷", India: "🇮🇳", USA: "🇺🇸",
};

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    name: "Shanghai Source Co.",
    country: "China",
    currency: "USD",
    contactPerson: "Wei Zhang",
    email: "wei.zhang@shanghaisource.com",
    phone: "+86 21 5555 0192",
    website: "shanghaisource.com",
    moq: 100,
    paymentTerms: "30% deposit, 70% before shipment",
    shippingTerms: "FOB Shanghai",
    lastUploadedDate: "2026-07-04",
    matchedProducts: 87,
    profitableProducts: 61,
    totalOrders: 14,
    averageRoi: 46,
    notes: "Reliable supplier, fast turnaround on samples. Prefers WeChat for communication.",
  },
  {
    id: "s2",
    name: "Royal Trading Ltd.",
    country: "United Kingdom",
    currency: "GBP",
    contactPerson: "James Hartley",
    email: "j.hartley@royaltrading.co.uk",
    phone: "+44 20 7946 0312",
    website: "royaltrading.co.uk",
    moq: 50,
    paymentTerms: "Net 30",
    shippingTerms: "DDP to UK warehouse",
    lastUploadedDate: "2026-07-05",
    matchedProducts: 43,
    profitableProducts: 38,
    totalOrders: 9,
    averageRoi: 52,
    notes: "Premium quality, slightly higher prices. Best for kitchen and home categories.",
  },
  {
    id: "s3",
    name: "Nomader Europe GmbH",
    country: "Germany",
    currency: "EUR",
    contactPerson: "Lena Müller",
    email: "lena.muller@nomader.de",
    phone: "+49 89 2140 5830",
    website: "nomader.de",
    moq: 200,
    paymentTerms: "50% upfront, 50% on delivery",
    shippingTerms: "CIF Hamburg",
    lastUploadedDate: "2026-06-28",
    matchedProducts: 29,
    profitableProducts: 22,
    totalOrders: 6,
    averageRoi: 49,
    notes: "Specializes in outdoor & sports. Lead time 3–4 weeks from order confirmation.",
  },
  {
    id: "s4",
    name: "Brieftons International",
    country: "USA",
    currency: "USD",
    contactPerson: "Mike Thompson",
    email: "mike@brieftons.com",
    phone: "+1 888 555 0174",
    website: "brieftons.com",
    moq: 75,
    paymentTerms: "100% payment before production",
    shippingTerms: "EXW Los Angeles",
    lastUploadedDate: "2026-07-01",
    matchedProducts: 18,
    profitableProducts: 15,
    totalOrders: 4,
    averageRoi: 43,
    notes: "Only kitchen gadgets. Good for spiralizers and cutting tools. Minimum reorder respected.",
  },
];

const TODAY = new Date("2026-07-06");

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.floor((TODAY.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
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

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const router = useRouter();
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
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/suppliers/${supplier.id}`)}>
            View Imports
          </Button>
          <Button variant="primary" size="sm">Add List</Button>
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
        <a
          href="/dashboard/import"
          className="text-primary text-xs font-medium hover:underline shrink-0"
        >
          Import new list →
        </a>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<SupplierFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const setField = (field: keyof SupplierFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAddSupplier = () => {
    if (!form.name.trim()) {
      setFormError("Supplier name is required.");
      return;
    }
    const newSupplier: Supplier = {
      id: `s${Date.now()}`,
      name: form.name.trim(),
      country: form.country.trim() || "Unknown",
      currency: form.currency,
      contactPerson: form.contactPerson || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      moq: form.moq ? parseInt(form.moq, 10) : undefined,
      paymentTerms: form.paymentTerms || undefined,
      shippingTerms: form.shippingTerms || undefined,
      notes: form.notes || undefined,
      matchedProducts: 0,
      profitableProducts: 0,
      totalOrders: 0,
      averageRoi: 0,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    setShowAddModal(false);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading font-semibold text-2xl">Suppliers</h1>
          <p className="text-muted text-sm mt-1">Manage your supplier relationships and product catalogs.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Supplier
          </span>
        </Button>
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 gap-4">
        {suppliers.map((s) => (
          <SupplierCard key={s.id} supplier={s} />
        ))}
        {suppliers.length === 0 && (
          <div className="bg-card-bg border border-border rounded-xl p-12 text-center">
            <p className="text-heading font-semibold text-base">No suppliers yet</p>
            <p className="text-muted text-sm mt-1">Add your first supplier to start importing product lists.</p>
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(""); }}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-heading font-semibold text-lg">Add Supplier</h2>
            <button
              onClick={() => { setShowAddModal(false); setFormError(""); }}
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
            <Button variant="ghost" size="md" onClick={() => { setShowAddModal(false); setFormError(""); }}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleAddSupplier}>
              Add Supplier
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
