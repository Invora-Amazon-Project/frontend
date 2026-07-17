"use client";

import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  createCanonicalProduct,
  deleteCanonicalProduct,
  getCanonicalProducts,
  updateCanonicalProduct,
  type CanonicalProductRecord,
} from "@/lib/services/canonicalProductsService";

const defaultForm = {
  asin: "",
  title: "",
  brand: "",
  category: "",
  image_url: "",
  marketplace: "US",
};

export default function CanonicalProductsPage() {
  const [products, setProducts] = useState<CanonicalProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<CanonicalProductRecord | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    getCanonicalProducts()
      .then(({ data }) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setLoadError(err.response?.data?.message ?? "Failed to load canonical products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product: CanonicalProductRecord) => {
    setEditingId(product.id);
    setForm({
      asin: product.asin,
      title: product.title,
      brand: product.brand ?? "",
      category: product.category ?? "",
      image_url: product.image_url ?? "",
      marketplace: product.marketplace,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asin.trim() || !form.title.trim()) {
      setFormError("ASIN and title are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      asin: form.asin.trim(),
      title: form.title.trim(),
      brand: form.brand.trim() || undefined,
      category: form.category.trim() || undefined,
      image_url: form.image_url.trim() || undefined,
      marketplace: form.marketplace,
    };

    try {
      if (editingId) {
        const updated = await updateCanonicalProduct(editingId, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await createCanonicalProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setFormError(axiosErr.response?.data?.message ?? `Failed to ${editingId ? "update" : "create"} product.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteCanonicalProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setDeleteError(axiosErr.response?.data?.message ?? "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-semibold text-xl">Canonical Products</h1>
          <p className="text-muted text-sm mt-1">Reference Amazon catalog data used for supplier-product matching.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          Add Canonical Product
        </Button>
      </div>

      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-muted text-sm px-5 py-10 text-center">Loading…</p>
        ) : loadError ? (
          <p className="text-rose text-sm px-5 py-10 text-center">{loadError}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Title</th>
                <th className="text-left px-5 py-3 text-muted font-medium">ASIN</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Brand</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Category</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Marketplace</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5 max-w-[260px]">
                    <span className="text-body text-sm font-medium line-clamp-1">{p.title}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-section-bg rounded px-2 py-0.5">{p.asin}</span>
                  </td>
                  <td className="px-5 py-3.5 text-body text-sm">{p.brand || "—"}</td>
                  <td className="px-5 py-3.5 text-muted text-sm">{p.category || "—"}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{p.marketplace}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEditModal(p)} className="text-primary text-sm hover:underline cursor-pointer">
                        Edit
                      </button>
                      <span className="text-border">|</span>
                      <button onClick={() => setDeletingProduct(p)} className="text-rose text-sm hover:underline cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">
                    No canonical products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <h2 className="text-heading font-semibold text-lg mb-5">
            {editingId ? "Edit Canonical Product" : "Add Canonical Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{formError}</p>}

            <div>
              <label className="block text-body text-xs font-medium mb-1.5">ASIN</label>
              <input
                type="text"
                required
                value={form.asin}
                onChange={(e) => setForm({ ...form, asin: e.target.value.toUpperCase() })}
                placeholder="e.g. B08X123456"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono bg-page-bg text-heading placeholder:text-placeholder outline-none focus:border-primary transition-colors uppercase"
              />
            </div>

            <div>
              <label className="block text-body text-xs font-medium mb-1.5">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body placeholder:text-placeholder outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-body text-xs font-medium mb-1.5">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-body text-xs font-medium mb-1.5">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-body text-xs font-medium mb-1.5">Marketplace</label>
                <input
                  type="text"
                  required
                  value={form.marketplace}
                  onChange={(e) => setForm({ ...form, marketplace: e.target.value.toUpperCase() })}
                  placeholder="e.g. US, DE, UK"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors uppercase"
                />
              </div>
              <div>
                <label className="block text-body text-xs font-medium mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" size="md" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={submitting}>
                {submitting ? (editingId ? "Saving…" : "Adding…") : editingId ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingProduct} onClose={() => { setDeletingProduct(null); setDeleteError(""); }}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Delete Canonical Product</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p className="text-body text-sm">
              Are you sure you want to delete <span className="font-semibold">{deletingProduct?.title}</span>? This
              cannot be undone.
            </p>
            {deleteError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{deleteError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => { setDeletingProduct(null); setDeleteError(""); }} disabled={deleting}>
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
