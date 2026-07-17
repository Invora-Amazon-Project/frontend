"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  createShortlist,
  deleteShortlist,
  getShortlists,
  updateShortlist,
  type ShortlistRecord,
} from "@/lib/services/shortlistsService";

export default function ShortlistsPage() {
  const router = useRouter();
  const [shortlists, setShortlists] = useState<ShortlistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const [renaming, setRenaming] = useState<ShortlistRecord | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState("");

  const [deleting, setDeleting] = useState<ShortlistRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadShortlists = () => {
    setLoading(true);
    setLoadError("");
    getShortlists()
      .then(setShortlists)
      .catch((err: AxiosError<{ message?: string }>) => {
        setLoadError(err.response?.data?.message ?? "Failed to load shortlists.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadShortlists();
  }, []);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreateSaving(true);
    setCreateError("");
    try {
      const created = await createShortlist(createName.trim());
      setShortlists((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setCreateName("");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setCreateError(axiosErr.response?.data?.message ?? "Failed to create shortlist.");
    } finally {
      setCreateSaving(false);
    }
  };

  const openRename = (shortlist: ShortlistRecord) => {
    setRenaming(shortlist);
    setRenameValue(shortlist.name);
    setRenameError("");
  };

  const handleRename = async () => {
    if (!renaming || !renameValue.trim()) return;
    setRenameSaving(true);
    setRenameError("");
    try {
      const updated = await updateShortlist(renaming.id, renameValue.trim());
      setShortlists((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setRenaming(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setRenameError(axiosErr.response?.data?.message ?? "Failed to rename shortlist.");
    } finally {
      setRenameSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteShortlist(deleting.id);
      setShortlists((prev) => prev.filter((s) => s.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setDeleteError(axiosErr.response?.data?.message ?? "Failed to delete shortlist.");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-heading font-semibold text-xl">Shortlists</h1>
          <p className="text-muted text-sm mt-0.5">Group products you&apos;re evaluating into named shortlists.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setCreateName("");
            setCreateError("");
            setIsCreateOpen(true);
          }}
        >
          + New Shortlist
        </Button>
      </div>

      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-muted text-sm px-5 py-10 text-center">Loading…</p>
        ) : loadError ? (
          <p className="text-rose text-sm px-5 py-10 text-center">{loadError}</p>
        ) : shortlists.length === 0 ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            }
            title="No shortlists yet"
            description="Create a shortlist to start grouping products you're evaluating."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-section-bg">
                <th className="text-left px-5 py-3 text-muted font-medium">Name</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Created</th>
                <th className="text-left px-5 py-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shortlists.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-section-bg/50 transition-colors">
                  <td className="px-5 py-3.5 text-body text-sm font-medium">{s.name}</td>
                  <td className="px-5 py-3.5 text-muted text-xs whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/shortlists/${s.id}`)}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openRename(s)}>
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose hover:bg-rose-bg"
                        onClick={() => {
                          setDeleting(s);
                          setDeleteError("");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">New Shortlist</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <Input
              label="Name"
              placeholder="e.g. Q3 Kitchen Ideas"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            {createError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{createError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsCreateOpen(false)} disabled={createSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate} disabled={createSaving || !createName.trim()}>
              {createSaving ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal isOpen={!!renaming} onClose={() => setRenaming(null)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Rename Shortlist</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <Input label="Name" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
            {renameError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{renameError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setRenaming(null)} disabled={renameSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleRename} disabled={renameSaving || !renameValue.trim()}>
              {renameSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Delete Shortlist</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p className="text-body text-sm">
              Are you sure you want to delete <span className="font-semibold">{deleting?.name}</span>? This cannot be
              undone.
            </p>
            {deleteError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{deleteError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setDeleting(null)} disabled={deleteBusy}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleDelete} disabled={deleteBusy}>
              {deleteBusy ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
