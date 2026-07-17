"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAppSelector } from "@/lib/hooks";
import { getSuppliers, type SupplierRecord } from "@/lib/services/suppliersService";
import { getSupplierProducts, type SupplierProductRecord } from "@/lib/services/supplierProductsService";
import {
  createOrder,
  getOrders,
  updateOrder,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/services/ordersService";
import {
  createOrderItem,
  deleteOrderItem,
  getOrderItems,
  updateOrderItem,
  type OrderItemRecord,
} from "@/lib/services/orderItemsService";

const STATUSES: OrderStatus[] = ["DRAFT", "PENDING", "COMPLETED", "CANCELLED"];

type TabKey = "all" | OrderStatus;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function OrdersPage() {
  const workspaceId = useAppSelector((s) => s.workspace.current?.id);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSupplierId, setCreateSupplierId] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  const [supplierProducts, setSupplierProducts] = useState<SupplierProductRecord[]>([]);

  const [newItemProductId, setNewItemProductId] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [addItemSaving, setAddItemSaving] = useState(false);
  const [addItemError, setAddItemError] = useState("");

  const [statusSaving, setStatusSaving] = useState(false);

  const loadOrders = () => {
    if (!workspaceId) return;
    setLoading(true);
    setLoadError("");
    getOrders(workspaceId)
      .then((data) => setOrders(data))
      .catch((err: AxiosError<{ message?: string }>) => {
        setLoadError(err.response?.data?.message ?? "Failed to load orders.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    getSuppliers(workspaceId).then(setSuppliers).catch(() => setSuppliers([]));
    getSupplierProducts(workspaceId).then(setSupplierProducts).catch(() => setSupplierProducts([]));
  }, [workspaceId]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  useEffect(() => {
    if (!selectedOrderId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setItemsLoading(true);
    setItemsError("");
    getOrderItems(selectedOrderId)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setItemsError(err.response?.data?.message ?? "Failed to load order items.");
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedOrderId]);

  const filtered = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
  const tabCount = (tab: TabKey) => (tab === "all" ? orders.length : orders.filter((o) => o.status === tab).length);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: `All (${tabCount("all")})` },
    ...STATUSES.map((s) => ({ key: s, label: `${s.charAt(0)}${s.slice(1).toLowerCase()} (${tabCount(s)})` })),
  ];

  const handleCreateOrder = async () => {
    if (!workspaceId || !createSupplierId) return;
    setCreateSaving(true);
    setCreateError("");
    try {
      const order = await createOrder({ workspace_id: workspaceId, supplier_id: createSupplierId, status: "DRAFT" });
      setOrders((prev) => [order, ...prev]);
      setIsCreateOpen(false);
      setCreateSupplierId("");
      setSelectedOrderId(order.id);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setCreateError(axiosErr.response?.data?.message ?? "Failed to create order.");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    setStatusSaving(true);
    try {
      const updated = await updateOrder(selectedOrder.id, { status });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)));
    } catch {
      // silently ignore, user can retry
    } finally {
      setStatusSaving(false);
    }
  };

  const orderSupplierProducts = selectedOrder
    ? supplierProducts.filter((sp) => sp.supplier_id === selectedOrder.supplier.id)
    : [];

  const handleAddItem = async () => {
    if (!selectedOrder || !newItemProductId) return;
    setAddItemSaving(true);
    setAddItemError("");
    try {
      const { order_total_price } = await createOrderItem({
        order_id: selectedOrder.id,
        supplier_product_id: newItemProductId,
        quantity: parseInt(newItemQty) || 1,
        unit_price: parseFloat(newItemPrice) || 0,
      });
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, total_price: order_total_price } : o)));
      const refreshed = await getOrderItems(selectedOrder.id);
      setItems(refreshed);
      setNewItemProductId("");
      setNewItemQty("1");
      setNewItemPrice("");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setAddItemError(axiosErr.response?.data?.message ?? "Failed to add item.");
    } finally {
      setAddItemSaving(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (!selectedOrder) return;
    try {
      const { order_total_price } = await deleteOrderItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, total_price: order_total_price } : o)));
    } catch {
      // silently ignore, list stays as-is
    }
  };

  const handleUpdateQuantity = async (item: OrderItemRecord, quantity: number) => {
    if (!selectedOrder || quantity < 1) return;
    try {
      const { item: updated, order_total_price } = await updateOrderItem(item.id, { quantity });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, total_price: order_total_price } : o)));
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading font-semibold text-2xl">Orders</h1>
          <p className="text-muted text-sm mt-1">Track and manage supplier purchase orders.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setCreateError(""); setIsCreateOpen(true); }}>
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
        {STATUSES.map((s) => (
          <div key={s} className="bg-card-bg border border-border rounded-lg px-4 py-3">
            <p className="text-heading font-bold text-xl">{tabCount(s)}</p>
            <p className="text-muted text-xs mt-0.5 capitalize">{s.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-body"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-muted text-sm px-5 py-10 text-center">Loading…</p>
        ) : loadError ? (
          <p className="text-rose text-sm px-5 py-10 text-center">{loadError}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Order ID</th>
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Supplier</th>
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Items</th>
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Total</th>
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Created</th>
                <th className="text-left text-muted font-medium px-4 py-3 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b border-border last:border-0 hover:bg-page-bg transition-colors cursor-pointer ${
                    selectedOrderId === order.id ? "bg-primary-light/40" : ""
                  }`}
                  onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted">#{order.id.slice(-8)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-body text-sm font-medium">{order.supplier?.name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted text-sm">
                      {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-heading font-medium">{formatCurrency(parseFloat(order.total_price))}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status.toLowerCase()} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted text-sm">{formatDate(order.created_at)}</span>
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
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted text-sm">
                    No orders found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Create Order</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-body mb-1.5">Supplier</label>
              <select
                value={createSupplierId}
                onChange={(e) => setCreateSupplierId(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-page-bg w-full"
              >
                <option value="">Select a supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <p className="text-muted text-xs">
              Order is created as a draft with $0 total — add items after creation to build up the order.
            </p>
            {createError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{createError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsCreateOpen(false)} disabled={createSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateOrder} disabled={createSaving || !createSupplierId}>
              {createSaving ? "Creating…" : "Create Order"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Side panel */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedOrderId(null)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-card-bg border-l border-border shadow-xl z-50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
              <div>
                <p className="font-mono text-xs text-muted mb-1">#{selectedOrder.id.slice(-8)}</p>
                <StatusBadge status={selectedOrder.status.toLowerCase()} />
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

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">Supplier</p>
                <p className="text-heading text-sm font-medium">{selectedOrder.supplier?.name ?? "—"}</p>
              </div>

              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Items</p>
                {itemsLoading ? (
                  <p className="text-muted text-xs">Loading…</p>
                ) : itemsError ? (
                  <p className="text-rose text-xs">{itemsError}</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="bg-section-bg rounded-lg px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-body text-xs font-medium leading-snug">
                            {item.supplierProduct?.product?.amazon_title || "Unknown Product"}
                          </p>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-muted hover:text-rose transition-colors shrink-0" title="Remove item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="font-mono text-xs text-muted">{item.supplierProduct?.product?.asin ?? "—"}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              defaultValue={item.quantity}
                              onBlur={(e) => {
                                const v = parseInt(e.target.value);
                                if (v && v !== item.quantity) handleUpdateQuantity(item, v);
                              }}
                              className="w-12 border border-border rounded px-1 py-0.5 text-xs bg-card-bg text-right"
                            />
                            <span className="text-muted text-xs">× {formatCurrency(parseFloat(item.unit_price))}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-muted text-xs">Line Total</span>
                          <span className="text-heading text-xs font-medium">
                            {formatCurrency(item.quantity * parseFloat(item.unit_price))}
                          </span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p className="text-muted text-xs">No items in this order yet.</p>}
                  </div>
                )}
              </div>

              {/* Add item */}
              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Add Item</p>
                <div className="space-y-2">
                  <select
                    value={newItemProductId}
                    onChange={(e) => {
                      setNewItemProductId(e.target.value);
                      const sp = orderSupplierProducts.find((p) => p.id === e.target.value);
                      if (sp) setNewItemPrice(sp.cost_price);
                    }}
                    className="border border-border rounded-lg px-3 py-2 text-xs bg-page-bg w-full"
                  >
                    <option value="">Select a product</option>
                    {orderSupplierProducts.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.product?.amazon_title ?? sp.product_id} — {sp.currency} {parseFloat(sp.cost_price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="py-1.5! text-xs!"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="py-1.5! text-xs!"
                    />
                  </div>
                  {addItemError && <p className="text-rose text-xs">{addItemError}</p>}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAddItem}
                    disabled={addItemSaving || !newItemProductId}
                  >
                    {addItemSaving ? "Adding…" : "+ Add Item"}
                  </Button>
                  {orderSupplierProducts.length === 0 && (
                    <p className="text-muted text-xs">No products linked to this supplier yet.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Total</p>
                <div className="bg-section-bg rounded-lg px-3 py-3 flex items-center justify-between">
                  <span className="text-muted text-xs">Order Total</span>
                  <span className="text-heading text-sm font-semibold">
                    {formatCurrency(parseFloat(selectedOrder.total_price))}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-2">Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={statusSaving}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-page-bg w-full"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="shrink-0 px-6 py-4 border-t border-border flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(null)}>Close</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
