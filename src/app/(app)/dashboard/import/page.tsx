"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

// TODO: Replace with real API calls — POST /import/upload, GET /import/:id/quality

type Step = 1 | 2 | 3;

const MOCK_QUALITY = {
  totalProducts: 247,
  successfullyRead: 241,
  errorRows: 6,
  duplicates: 3,
  matchedByUpc: 156,
  matchedByBrandName: 37,
  unmatched: 48,
  missingUpc: 12,
  missingBrand: 3,
};

/* ─── Step Indicator ─── */
function StepIndicator({ current }: { current: Step }) {
  const steps = ["Upload File", "Review Quality", "Start Analysis"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  done
                    ? "bg-mint-bg text-mint"
                    : active
                    ? "bg-primary text-white"
                    : "bg-section-bg text-muted"
                }`}
              >
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? "text-heading" : done ? "text-mint" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-px mx-3 ${current > n ? "bg-mint" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Donut ring ─── */
function MatchDonut({ matched, total }: { matched: number; total: number }) {
  const pct = Math.round((matched / total) * 100);
  const R = 36;
  const CIRC = 2 * Math.PI * R;
  const fill = CIRC * (pct / 100);
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={R} fill="none" stroke="currentColor" strokeWidth="8" className="text-section-bg" />
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${fill} ${CIRC}`}
            strokeDashoffset={CIRC / 4}
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-heading font-bold text-sm">
          {pct}%
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span className="text-body">UPC / EAN: <span className="font-medium">{MOCK_QUALITY.matchedByUpc}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-light shrink-0" />
          <span className="text-body">Brand + Name: <span className="font-medium">{MOCK_QUALITY.matchedByBrandName}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-section-bg border border-border shrink-0" />
          <span className="text-muted">Unmatched: <span className="font-medium">{MOCK_QUALITY.unmatched}</span></span>
        </div>
      </div>
    </div>
  );
}

/* ─── Quality check row ─── */
function QualityRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ok ? "bg-mint-bg text-mint" : "bg-peach-bg text-peach"}`}>
        {ok ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-body text-sm font-medium">{label}</p>
        <p className="text-muted text-xs mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ImportPage() {
  const [step, setStep] = useState<Step>(1);
  const [supplierName, setSupplierName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "manual" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue = uploadMode === "manual" ? supplierName.trim().length > 0 : (!!selectedFile && supplierName.trim().length > 0);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setUploadMode("file");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <h2 className="text-heading font-semibold text-lg mb-1">Upload your supplier list</h2>
          <p className="text-muted text-sm mb-6">Import a CSV or Excel file from your supplier to start analysis.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Option A — File upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging || uploadMode === "file"
                  ? "border-primary bg-primary-light/20"
                  : "border-border hover:border-primary hover:bg-primary-light/20"
              }`}
            >
              <div className="flex justify-center mb-3 text-muted">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </div>
              <p className="text-body text-sm font-medium">Upload CSV or Excel file</p>
              <p className="text-muted text-xs mt-1">Drag & drop or click to select</p>
              <p className="text-placeholder text-xs mt-2">.csv · .xls · .xlsx</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
            />

            {/* Option B — Manual */}
            <div
              onClick={() => setUploadMode("manual")}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                uploadMode === "manual"
                  ? "border-primary bg-primary-light/20"
                  : "border-border hover:border-primary hover:bg-primary-light/20"
              }`}
            >
              <div className="flex justify-center mb-3 text-muted">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <p className="text-body text-sm font-medium">Add product manually</p>
              <p className="text-muted text-xs mt-1">For single product analysis</p>
            </div>
          </div>

          {/* File confirmation */}
          {selectedFile && (
            <div className="flex items-center gap-3 bg-section-bg border border-border rounded-lg px-4 py-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-body text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-muted text-xs">{formatBytes(selectedFile.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setUploadMode(null); }}
                className="text-muted hover:text-rose transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Supplier name */}
          <div className="mb-6">
            <label htmlFor="supplierName" className="block text-xs font-medium text-body mb-1.5">
              Supplier Name <span className="text-rose">*</span>
            </label>
            <input
              id="supplierName"
              type="text"
              placeholder="e.g. Guangzhou HomeGoods Co."
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none transition-colors placeholder:text-placeholder focus:border-primary"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canContinue}
            onClick={() => setStep(2)}
          >
            Continue →
          </Button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <h2 className="text-heading font-semibold text-lg mb-1">Review Import Quality</h2>
          <p className="text-muted text-sm mb-6">Check the results before starting analysis.</p>

          {/* 4 stat cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Products", value: MOCK_QUALITY.totalProducts, color: "text-heading" },
              { label: "Successfully Read", value: MOCK_QUALITY.successfullyRead, color: "text-mint" },
              { label: "Error Rows", value: MOCK_QUALITY.errorRows, color: "text-rose" },
              { label: "Duplicates", value: MOCK_QUALITY.duplicates, color: "text-peach" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-section-bg rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-muted text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Quality checks */}
          <div className="bg-section-bg rounded-xl px-4 mb-5">
            <QualityRow
              ok={false}
              label="Required fields"
              detail={`UPC/EAN missing for ${MOCK_QUALITY.missingUpc} products, Brand missing for ${MOCK_QUALITY.missingBrand}`}
            />
            <div className="py-3 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary-light text-primary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-body text-sm font-medium mb-2">Match rate</p>
                  <MatchDonut matched={MOCK_QUALITY.matchedByUpc + MOCK_QUALITY.matchedByBrandName} total={MOCK_QUALITY.successfullyRead} />
                </div>
              </div>
            </div>
            <QualityRow
              ok={MOCK_QUALITY.duplicates === 0}
              label="Duplicate check"
              detail={`${MOCK_QUALITY.duplicates} duplicate products found and excluded`}
            />
            <QualityRow
              ok={true}
              label="List freshness"
              detail="Uploaded today — list is current ✓"
            />
          </div>

          {/* Warning */}
          <div className="bg-peach-bg border border-peach/30 rounded-xl p-4 mb-6">
            <div className="flex gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-peach shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-peach text-sm">
                Some products have missing fields. Analysis quality may be lower for these products.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(3)}>
              Start Analysis →
            </Button>
          </div>
          <p className="text-muted text-xs text-center mt-2">
            This will use approximately <span className="font-medium text-body">{MOCK_QUALITY.successfullyRead} credits</span>
          </p>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-mint-bg flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-mint">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-heading font-semibold text-2xl mb-2">Analysis started!</h2>
          <p className="text-muted text-sm max-w-sm mx-auto">
            We&apos;re matching <span className="font-medium text-body">{MOCK_QUALITY.successfullyRead} products</span> with Amazon data. This usually takes 2–5 minutes.
          </p>

          {/* Indeterminate progress bar */}
          <div className="relative bg-section-bg h-2 rounded-full overflow-hidden my-6 max-w-sm mx-auto">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-primary rounded-full animate-pulse" />
          </div>

          <p className="text-muted text-xs mb-8">You&apos;ll be notified when analysis is complete.</p>

          <div className="flex flex-col items-center gap-3">
            <Link href="/dashboard/analysis">
              <Button variant="primary" size="lg">Go to Analysis →</Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => { setStep(1); setSelectedFile(null); setSupplierName(""); setUploadMode(null); }}>
              Import another list
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
