"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createNewWorkspace, switchWorkspace } from "@/lib/workspaceSlice";

export default function WorkspaceSwitcher() {
  const dispatch = useAppDispatch();
  const { current, all, loading, creating, createError } = useAppSelector((s) => s.workspace);
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    dispatch(switchWorkspace(id));
    setOpen(false);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    const result = await dispatch(createNewWorkspace(newWorkspaceName.trim()));
    if (createNewWorkspace.fulfilled.match(result)) {
      setShowCreateModal(false);
      setNewWorkspaceName("");
      setOpen(false);
    }
  };

  return (
    <div className="relative px-2 pb-2" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-md bg-primary/40 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {current?.name?.charAt(0)?.toUpperCase() ?? "…"}
          </span>
          <span className="text-sm font-medium truncate">
            {loading ? "Loading…" : current?.name ?? "No workspace"}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full mt-1 z-50 bg-card-bg border border-border rounded-xl shadow-xl overflow-hidden py-1">
          <p className="text-muted text-xs font-semibold uppercase tracking-wide px-3 pt-2 pb-1">Workspaces</p>
          <div className="max-h-56 overflow-y-auto">
            {all.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelect(w.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-body hover:bg-section-bg transition-colors cursor-pointer"
              >
                <span className="truncate">{w.name}</span>
                {current?.id === w.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-border mt-1 pt-1">
            <button
              type="button"
              onClick={() => { setShowCreateModal(true); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-section-bg transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Workspace
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewWorkspaceName(""); }}
      >
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">New Workspace</h2>
            <button
              onClick={() => { setShowCreateModal(false); setNewWorkspaceName(""); }}
              className="text-muted hover:text-heading transition-colors p-1 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {createError && (
              <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{createError}</p>
            )}
            <Input
              label="Workspace Name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g. My Second Store"
            />
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => { setShowCreateModal(false); setNewWorkspaceName(""); }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateWorkspace}
              disabled={creating || !newWorkspaceName.trim()}
            >
              {creating ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
