"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Order, OrderStatus } from "@/types";

// TODO: Replace with real API call — GET /orders

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-0024",
    supplierId: "s1",
    supplierName: "Shanghai Source Co.",
    status: "draft",
    totalCost: 840.00,
    expectedProfit: 1260.00,
    expectedRoi: 50,
    shipping: 95.00,
    taxAndCustoms: 42.00,
    notes: "Waiting on final quote for tong set — confirm MOQ before sending.",
    createdAt: "2026-07-06T09:00:00Z",
    updatedAt: "2026-07-06T09:00:00Z",
    products: [
      { productId: "p1", productName: "Silicone Kitchen Tongs Set 2-Pack", asin: "B08XK3LMND", quantity: 100, unitCost: 4.20, totalCost: 420.00, estimatedSalePrice: 17.49, expectedProfit: 630.00 },
      { productId: "p8", productName: "Wooden Spoon Set 6-Piece", asin: "B07KF16JZL", quantity: 120, unitCost: 3.50, totalCost: 420.00, estimatedSalePrice: 12.49, expectedProfit: 630.00 },
    ],
  },
  {
    id: "ORD-0023",
    supplierId: "s2",
    supplierName: "Royal Trading Ltd.",
    status: "waiting_confirmation",
    totalCost: 765.00,
    expectedProfit: 1044.00,
    expectedRoi: 54,
    shipping: 120.00,
    taxAndCustoms: 48.00,
    createdAt: "2026-07-05T14:30:00Z",
    updatedAt: "2026-07-05T18:00:00Z",
    products: [
      { productId: "p2", productName: "Bamboo Cutting Board Large 18x12", asin: "B07THGP5WK", quantity: 75, unitCost: 10.20, totalCost: 765.00, estimatedSalePrice: 26.49, expectedProfit: 1044.00 },
    ],
  },
  {
    id: "ORD-0022",
    supplierId: "s3",
    supplierName: "Nomader Europe GmbH",
    status: "shipped",
    totalCost: 1080.00,
    expectedProfit: 1186.00,
    expectedRoi: 51,
    shipping: 160.00,
    taxAndCustoms: 80.00,
    trackingNumber: "CN748291047DE",
    createdAt: "2026-06-28T10:00:00Z",
    updatedAt: "2026-07-02T08:15:00Z",
    products: [
      { productId: "p5", productName: "Collapsible Silicone Water Bottle 750ml", asin: "B08ZTLMKPD", quantity: 200, unitCost: 5.40, totalCost: 1080.00, estimatedSalePrice: 13.95, expectedProfit: 1186.00 },
    ],
  },
  {
    id: "ORD-0021",
    supplierId: "s4",
    supplierName: "Brieftons International",
    status: "completed",
    totalCost: 1368.00,
    expectedProfit: 1241.00,
    expectedRoi: 47,
    shipping: 200.00,
    taxAndCustoms: 108.00,
    createdAt: "2026-06-10T08:00:00Z",
    updatedAt: "2026-06-30T12:00:00Z",
    products: [
      { productId: "p10", productName: "Vegetable Spiralizer 5-Blade", asin: "B00GRIR87U", quantity: 120, unitCost: 11.40, totalCost: 1368.00, estimatedSalePrice: 28.49, expectedProfit: 1241.00 },
    ],
  },
  {
    id: "ORD-0020",
    supplierId: "s1",
    supplierName: "Shanghai Source Co.",
    status: "shipped",
    totalCost: 980.00,
    expectedProfit: 1470.00,
    expectedRoi: 50,
    shipping: 115.00,
    taxAndCustoms: 55.00,
    trackingNumber: "SH120394850CN",
    createdAt: "2026-06-20T09:30:00Z",
    updatedAt: "2026-06-25T11:00:00Z",
    products: [
      { productId: "p1", productName: "Silicone Kitchen Tongs Set 2-Pack", asin: "B08XK3LMND", quantity: 100, unitCost: 4.20, totalCost: 420.00, estimatedSalePrice: 17.49, expectedProfit: 630.00 },
      { productId: "p2", productName: "Bamboo Cutting Board Large 18x12", asin: "B07THGP5WK", quantity: 50, unitCost: 11.20, totalCost: 560.00, estimatedSalePrice: 26.49, expectedProfit: 840.00 },
    ],
  },
  {
    id: "ORD-0019",
    supplierId: "s2",
    supplierName: "Royal Trading Ltd.",
    status: "shipped",
    totalCost: 612.00,
    expectedProfit: 508.00,
    expectedRoi: 44,
    shipping: 90.00,
    taxAndCustoms: 36.00,
    trackingNumber: "RT884729301GB",
    createdAt: "2026-06-18T13:00:00Z",
    updatedAt: "2026-06-22T09:45:00Z",
    products: [
      { productId: "p8", productName: "Wooden Spoon Set 6-Piece", asin: "B07KF16JZL", quantity: 180, unitCost: 3.40, totalCost: 612.00, estimatedSalePrice: 12.49, expectedProfit: 508.00 },
    ],
  },
  {
    id: "ORD-0018",
    supplierId: "s3",
    supplierName: "Nomader Europe GmbH",
    status: "cancelled",
    totalCost: 540.00,
    expectedProfit: 593.00,
    expectedRoi: 51,
    shipping: 80.00,
    taxAndCustoms: 40.00,
    notes: "Cancelled — supplier unable to meet delivery deadline. Will retry next quarter.",
    createdAt: "2026-06-05T10:00:00Z",
    updatedAt: "2026-06-08T14:00:00Z",
    products: [
      { productId: "p5", productName: "Collapsible Silicone Water Bottle 750ml", asin: "B08ZTLMKPD", quantity: 100, unitCost: 5.40, totalCost: 540.00, estimatedSalePrice: 13.95, expectedProfit: 593.00 },
    ],
  },
  {
    id: "ORD-0017",
    supplierId: "s4",
    supplierName: "Brieftons International",
    status: "draft",
    totalCost: 1140.00,
    expectedProfit: 1034.00,
    expectedRoi: 47,
    shipping: 175.00,
    taxAndCustoms: 90.00,
    notes: "Draft for next restock cycle. Finalize quantities before sending.",
    createdAt: "2026-07-04T16:00:00Z",
    updatedAt: "2026-07-04T16:00:00Z",
    products: [
      { productId: "p10", productName: "Vegetable Spiralizer 5-Blade", asin: "B00GRIR87U", quantity: 100, unitCost: 11.40, totalCost: 1140.00, estimatedSalePrice: 28.49, expectedProfit: 1034.00 },
    ],
  },
];

interface StatusHistory {
  status: OrderStatus;
  date: string;
  note: string;
}

const MOCK_STATUS_HISTORY: Record<string, StatusHistory[]> = {
  "ORD-0024": [
    { status: "draft", date: "2026-07-06", note: "Order created as draft" },
  ],
  "ORD-0023": [
    { status: "draft", date: "2026-07-05", note: "Order created" },
    { status: "sent_to_supplier", date: "2026-07-05", note: "Sent to Royal Trading Ltd." },
    { status: "waiting_confirmation", date: "2026-07-05", note: "Awaiting supplier confirmation" },
  ],
  "ORD-0022": [
    { status: "draft", date: "2026-06-28", note: "Order created" },
    { status: "confirmed", date: "2026-06-29", note: "Supplier confirmed the order" },
    { status: "paid", date: "2026-06-30", note: "Payment sent via wire transfer" },
    { status: "shipped", date: "2026-07-02", note: "Shipped. Tracking: CN748291047DE" },
  ],
  "ORD-0021": [
    { status: "draft", date: "2026-06-10", note: "Order created" },
    { status: "confirmed", date: "2026-06-11", note: "Supplier confirmed" },
    { status: "paid", date: "2026-06-12", note: "Payment completed" },
    { status: "shipped", date: "2026-06-18", note: "Items shipped" },
    { status: "received", date: "2026-06-27", note: "Received at warehouse" },
    { status: "completed", date: "2026-06-30", note: "Sent to Amazon FBA & confirmed" },
  ],
  "ORD-0020": [
    { status: "draft", date: "2026-06-20", note: "Order created" },
    { status: "confirmed", date: "2026-06-21", note: "Supplier confirmed" },
    { status: "paid", date: "2026-06-22", note: "Payment sent" },
    { status: "shipped", date: "2026-06-25", note: "Tracking: SH120394850CN" },
  ],
  "ORD-0019": [
    { status: "draft", date: "2026-06-18", note: "Order created" },
    { status: "confirmed", date: "2026-06-19", note: "Confirmed" },
    { status: "paid", date: "2026-06-20", note: "Payment complete" },
    { status: "shipped", date: "2026-06-22", note: "Tracking: RT884729301GB" },
  ],
  "ORD-0018": [
    { status: "draft", date: "2026-06-05", note: "Order created" },
    { status: "sent_to_supplier", date: "2026-06-06", note: "Sent to supplier" },
    { status: "cancelled", date: "2026-06-08", note: "Cancelled — supplier missed deadline" },
  ],
  "ORD-0017": [
    { status: "draft", date: "2026-07-04", note: "Draft created for next restock" },
  ],
};

type TabKey = "all" | "draft" | "active" | "completed" | "cancelled";

const DRAFT_STATUSES: OrderStatus[]     = ["draft", "sent_to_supplier", "payment_pending"];
const ACTIVE_STATUSES: OrderStatus[]    = ["waiting_confirmation", "confirmed", "paid", "shipped", "received", "sent_to_amazon_fba"];
const COMPLETE_STATUSES: OrderStatus[]  = ["completed"];
const CANCELLED_STATUSES: OrderStatus[] = ["cancelled"];

function filterByTab(orders: Order[], tab: TabKey): Order[] {
  if (tab === "all")       return orders;
  if (tab === "draft")     return orders.filter((o) => DRAFT_STATUSES.includes(o.status));
  if (tab === "active")    return orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  if (tab === "completed") return orders.filter((o) => COMPLETE_STATUSES.includes(o.status));
  if (tab === "cancelled") return orders.filter((o) => CANCELLED_STATUSES.includes(o.status));
  return orders;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function OrdersPage() {
  const [activeTab, setActiveTab]           = useState<TabKey>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filtered      = filterByTab(MOCK_ORDERS, activeTab);
  const selectedOrder = MOCK_ORDERS.find((o) => o.id === selectedOrderId) ?? null;
  const statusHistory = selectedOrderId ? (MOCK_STATUS_HISTORY[selectedOrderId] ?? []) : [];

  const tabCount = (tab: TabKey) => filterByTab(MOCK_ORDERS, tab).length;

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all",       label: `All (${tabCount("all")})` },
    { key: "draft",     label: `Draft (${tabCount("draft")})` },
    { key: "active",    label: `Active (${tabCount("active")})` },
    { key: "completed", label: `Completed (${tabCount("completed")})` },
    { key: "cancelled", label: `Cancelled (${tabCount("cancelled")})` },
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading font-semibold text-2xl">Orders</h1>
          <p className="text-muted text-sm mt-1">Track and manage supplier purchase orders.</p>
        </div>
        <Button variant="primary" size="sm">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Order
          </span>
        </Button>
      </div>

      {/* Status summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-card-bg border border-border rounded-lg px-4 py-3">
          <p className="text-peach font-bold text-xl">2</p>
          <p className="text-muted text-xs mt-0.5">Draft</p>
        </div>
        <div className="bg-card-bg border border-border rounded-lg px-4 py-3">
          <p className="text-primary font-bold text-xl">1</p>
          <p className="text-muted text-xs mt-0.5">Awaiting Confirmation</p>
        </div>
        <div className="bg-card-bg border border-border rounded-lg px-4 py-3">
          <p className="text-mint font-bold text-xl">3</p>
          <p className="text-muted text-xs mt-0.5">Shipped</p>
        </div>
        <div className="bg-card-bg border border-border rounded-lg px-4 py-3">
          <p className="text-muted font-bold text-xl">1</p>
          <p className="text-muted text-xs mt-0.5">Completed</p>
        </div>
      </div>

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
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Order ID</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Supplier</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Products</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Total Cost</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Expected ROI</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Created</th>
              <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, idx) => (
              <tr
                key={order.id}
                className={`border-b border-border last:border-0 hover:bg-page-bg transition-colors cursor-pointer ${
                  selectedOrderId === order.id ? "bg-primary-light/40" : ""
                } ${idx % 2 === 0 ? "" : ""}`}
                onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-muted">#{order.id}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-body text-sm font-medium">{order.supplierName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted text-sm">{order.products.length} product{order.products.length !== 1 ? "s" : ""}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-heading font-medium">{formatCurrency(order.totalCost)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-mint font-medium">+{order.expectedRoi}%</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted text-sm">{formatDate(order.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
                    >
                      View
                    </Button>
                    <Button variant="ghost" size="sm">Update Status</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted text-sm">
                  No orders found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Side panel */}
      {selectedOrder && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedOrderId(null)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-card-bg border-l border-border shadow-xl z-50 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
              <div>
                <p className="font-mono text-xs text-muted mb-1">#{selectedOrder.id}</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-muted hover:text-heading transition-colors p-1 rounded cursor-pointer"
                aria-label="Close panel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

              {/* Supplier */}
              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">Supplier</p>
                <p className="text-heading text-sm font-medium">{selectedOrder.supplierName}</p>
                {selectedOrder.trackingNumber && (
                  <p className="text-muted text-xs mt-1">
                    Tracking: <span className="font-mono">{selectedOrder.trackingNumber}</span>
                  </p>
                )}
              </div>

              {/* Products */}
              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Products</p>
                <div className="space-y-2">
                  {selectedOrder.products.map((item) => (
                    <div key={item.productId} className="bg-section-bg rounded-lg px-3 py-2.5">
                      <p className="text-body text-xs font-medium leading-snug">{item.productName}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-mono text-xs text-muted">{item.asin}</span>
                        <span className="text-muted text-xs">{item.quantity} × {formatCurrency(item.unitCost)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-muted text-xs">Total</span>
                        <span className="text-heading text-xs font-medium">{formatCurrency(item.totalCost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial summary */}
              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Financial Summary</p>
                <div className="bg-section-bg rounded-lg px-3 py-3 space-y-2">
                  {[
                    { label: "Total Cost",            value: formatCurrency(selectedOrder.totalCost) },
                    { label: "Shipping",              value: formatCurrency(selectedOrder.shipping) },
                    { label: "Tax & Customs",         value: formatCurrency(selectedOrder.taxAndCustoms) },
                    { label: "Est. Sale Revenue",     value: formatCurrency(selectedOrder.totalCost + selectedOrder.expectedProfit) },
                    { label: "Expected Profit",       value: formatCurrency(selectedOrder.expectedProfit), highlight: true },
                    { label: "Expected ROI",          value: `+${selectedOrder.expectedRoi}%`, highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-muted text-xs">{label}</span>
                      <span className={`text-xs font-medium ${highlight ? "text-mint" : "text-heading"}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">Notes</p>
                  <p className="text-body text-xs leading-relaxed bg-section-bg rounded-lg px-3 py-2.5">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Status history */}
              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-3">Status History</p>
                <ol className="relative border-l border-border ml-2 space-y-4">
                  {statusHistory.map((step, i) => {
                    const isLast = i === statusHistory.length - 1;
                    return (
                      <li key={i} className="ml-4">
                        <span className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-card-bg ${isLast ? "bg-primary" : "bg-border"}`} />
                        <div className="flex items-center gap-2 mb-0.5">
                          <StatusBadge status={step.status} />
                          <span className="text-muted text-xs">{step.date}</span>
                        </div>
                        <p className="text-muted text-xs">{step.note}</p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* Panel footer */}
            <div className="shrink-0 px-6 py-4 border-t border-border flex gap-2">
              <Button variant="primary" size="sm">Update Status</Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(null)}>Close</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
