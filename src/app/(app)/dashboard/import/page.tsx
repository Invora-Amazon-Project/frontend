"use client";

import { Suspense, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
// TODO: import { useAppSelector } from "@/lib/hooks"; — read token/workspaceId from Redux auth state

// TODO: Replace with real API calls — POST /api/supplier-lists/preview, POST /api/supplier-lists/import

type Step = 1 | 2 | 3;

type MappedField =
  | "amazon_title"
  | "cost_price"
  | "upc"
  | "ean"
  | "stock"
  | "brand"
  | "sku"
  | "currency"
  | "moq"
  | "ignore";

type ColumnMapping = { originalColumn: string; mappedField: MappedField };

const MAPPED_FIELD_OPTIONS: { value: MappedField; label: string }[] = [
  { value: "ignore", label: "— Ignore this column —" },
  { value: "amazon_title", label: "Product Title (amazon_title)" },
  { value: "cost_price", label: "Cost Price (cost_price)" },
  { value: "upc", label: "UPC Barcode (upc)" },
  { value: "ean", label: "EAN Barcode (ean)" },
  { value: "stock", label: "Stock Quantity (stock)" },
  { value: "brand", label: "Brand (brand)" },
  { value: "sku", label: "SKU (sku)" },
  { value: "currency", label: "Currency (currency)" },
  { value: "moq", label: "MOQ (moq)" },
];

const REQUIRED_FIELDS: MappedField[] = ["amazon_title", "cost_price"];

// TODO: Replace with real API call — GET /api/suppliers
const MOCK_SUPPLIERS = [
  { id: "sup_aquapure", name: "AquaPure" },
  { id: "sup_soundwave", name: "SoundWave" },
  { id: "sup_ecokitch", name: "EcoKitch" },
];

function getMissingRequiredFields(mapping: ColumnMapping[]) {
  const mappedFields = new Set(mapping.map((m) => m.mappedField));
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.has(f));
  const missingOneOf = mappedFields.has("upc") || mappedFields.has("ean") ? [] : ["upc/ean"];
  return { missingRequired, missingOneOf, isValid: missingRequired.length === 0 && missingOneOf.length === 0 };
}

/* ─── Step Indicator ─── */
function StepIndicator({ current }: { current: Step }) {
  const steps = ["Upload File", "Map Columns", "Import Complete"];
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

/* ─── Main Page ─── */
export default function ImportPage() {
  return (
    <Suspense fallback={null}>
      <ImportPageContent />
    </Suspense>
  );
}

function ImportPageContent() {
  const [step, setStep] = useState<Step>(1);
  const [supplierName, setSupplierName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "manual" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const preselectedSupplierId = searchParams.get("supplierId");
  const preselectedSupplierName = searchParams.get("supplierName");

  // ── Column Mapping step state ──
  const [file, setFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState(preselectedSupplierId || "");
  const [previewData, setPreviewData] = useState<{
    totalRows: number;
    headers: string[];
    preview: Record<string, string>[];
    mapping: { originalColumn: string; mappedField: MappedField; confidence?: "high" | "low" }[];
    validation?: { isValid: boolean; missingRequired: string[]; missingOneOf: string[] };
  } | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    skippedDetails?: { row: number; reason: string; data: Record<string, string> }[];
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const canContinue = uploadMode === "manual" ? supplierName.trim().length > 0 : (!!selectedFile && supplierName.trim().length > 0);

  const handleFileChange = async (selected: File) => {
    setSelectedFile(selected);
    setUploadMode("file");
    setFile(selected);
    setValidationError(null);
    setIsLoadingPreview(true);

    try {
      const formData = new FormData();
      formData.append("file", selected);
      // TODO: Get token from Redux auth state using useAppSelector from "@/lib/hooks"
      const token = "";
      const response = await fetch("/api/supplier-lists/preview", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to analyze file");
      const data = await response.json();
      setPreviewData(data);
      setColumnMapping(
        data.mapping.map((m: { originalColumn: string; mappedField: MappedField }) => ({
          originalColumn: m.originalColumn,
          mappedField: m.mappedField,
        }))
      );
      setStep(2);
    } catch {
      setValidationError("We couldn't analyze this file. Please check the format and try again.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const updateMapping = (originalColumn: string, mappedField: MappedField) => {
    setColumnMapping((prev) =>
      prev.map((m) => (m.originalColumn === originalColumn ? { ...m, mappedField } : m))
    );
  };

  const { missingRequired, missingOneOf, isValid: mappingIsValid } = getMissingRequiredFields(columnMapping);

  const handleConfirmImport = async () => {
    if (!file) return;
    setIsLoadingImport(true);
    setImportError(null);
    try {
      const mappingToSend = columnMapping
        .filter((m) => m.mappedField !== "ignore")
        .map((m) => ({ originalColumn: m.originalColumn, mappedField: m.mappedField }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplierId", supplierId);
      // TODO: Get workspaceId from Redux auth state or GET /api/workspaces
      formData.append("workspaceId", "");
      formData.append("mapping", JSON.stringify(mappingToSend));

      // TODO: Get token from Redux auth state using useAppSelector from "@/lib/hooks"
      const token = "";
      const response = await fetch("/api/supplier-lists/import", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Import failed");
      const data = await response.json();
      setImportResult(data);
      setStep(3);
    } catch {
      setImportError("Something went wrong while importing your list. Please try again.");
    } finally {
      setIsLoadingImport(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setSelectedFile(null);
    setSupplierName("");
    setUploadMode(null);
    setFile(null);
    setSupplierId("");
    setPreviewData(null);
    setColumnMapping([]);
    setImportResult(null);
    setValidationError(null);
    setImportError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <h2 className="text-heading font-semibold text-lg mb-1">Upload your supplier list</h2>
          <p className="text-muted text-sm mb-6">Import a CSV or Excel file from your supplier to start analysis.</p>

          {/* Supplier select */}
          <div className="mb-6">
            <label htmlFor="supplierId" className="block text-xs font-medium text-body mb-1.5">
              Supplier
            </label>
            {/* TODO: Replace mock options with real API call — GET /api/suppliers */}
            <select
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-card-bg w-full"
            >
              {!preselectedSupplierId && <option value="">Select a supplier</option>}
              {preselectedSupplierId && !MOCK_SUPPLIERS.some((s) => s.id === preselectedSupplierId) && (
                <option value={preselectedSupplierId}>
                  {preselectedSupplierName || preselectedSupplierId}
                </option>
              )}
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

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

          {validationError && (
            <p className="text-rose text-sm mb-4">{validationError}</p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canContinue || isLoadingPreview}
            onClick={() => { if (uploadMode === "manual") setStep(2); }}
          >
            {isLoadingPreview ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Analyzing file...
              </span>
            ) : (
              "Continue →"
            )}
          </Button>
        </div>
      )}

      {/* ── STEP 2 — Map Columns ── */}
      {step === 2 && previewData && (
        <div className="bg-card-bg border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-heading font-semibold text-lg">Map Your Columns</h2>
            <span className="bg-section-bg text-muted text-xs rounded-full px-3 py-1">
              {previewData.totalRows} rows detected
            </span>
          </div>
          <p className="text-muted text-sm mb-6">
            We&apos;ve auto-detected the column mappings below. Review and correct if needed.
          </p>

          {previewData.validation && previewData.validation.isValid === false && (
            <div className="bg-rose-bg border border-rose/30 rounded-xl p-4 mb-4">
              <div className="flex gap-2 items-start">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="text-rose font-medium text-sm mb-2">Some required fields are not mapped:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...previewData.validation.missingRequired, ...previewData.validation.missingOneOf].map((f) => (
                      <span key={f} className="bg-rose-bg text-rose text-xs rounded-full px-2.5 py-0.5 border border-rose/30">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mapping table */}
          <div className="bg-card-bg border border-border rounded-xl overflow-hidden mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-section-bg">
                  <th className="text-muted text-xs font-medium px-4 py-2.5">Your Column</th>
                  <th className="text-muted text-xs font-medium px-4 py-2.5">Sample Data</th>
                  <th className="text-muted text-xs font-medium px-4 py-2.5">Maps To</th>
                  <th className="text-muted text-xs font-medium px-4 py-2.5">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {previewData.headers.map((header) => {
                  const mappingEntry = columnMapping.find((m) => m.originalColumn === header);
                  const mappingMeta = previewData.mapping.find((m) => m.originalColumn === header);
                  const mappedField = mappingEntry?.mappedField ?? "ignore";
                  const isRequiredRow = ["amazon_title", "cost_price", "upc", "ean"].includes(mappedField);
                  const isUnmapped = mappedField === "ignore";
                  const sample = previewData.preview[0]?.[header];
                  const confidence = mappingMeta?.confidence;
                  return (
                    <tr
                      key={header}
                      className={`border-t border-border ${isUnmapped && isRequiredRow ? "bg-rose-bg/20" : ""}`}
                    >
                      <td className="text-body text-sm font-medium px-4 py-2.5">{header}</td>
                      <td className="text-muted text-xs font-mono px-4 py-2.5">
                        {sample ? sample : <span className="text-placeholder">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <select
                            value={mappedField}
                            onChange={(e) => updateMapping(header, e.target.value as MappedField)}
                            className="border border-border rounded-lg px-3 py-2 text-sm bg-page-bg w-full"
                          >
                            {MAPPED_FIELD_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {["amazon_title", "cost_price", "upc", "ean"].includes(mappedField) && (
                            <span className="text-rose">*</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        {confidence === "high" ? (
                          <span className="bg-mint-bg text-mint text-xs rounded-full px-2 py-0.5">Auto-detected</span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <span className="bg-peach-bg text-peach text-xs rounded-full px-2 py-0.5">Please verify</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-peach">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Live validation */}
          {mappingIsValid ? (
            <div className="bg-mint-bg text-mint rounded-lg p-3 text-sm mb-6">
              ✓ All required fields are mapped
            </div>
          ) : (
            <div className="bg-rose-bg text-rose rounded-lg p-3 text-sm mb-6">
              Missing: {[...missingRequired, ...missingOneOf].join(", ")}
            </div>
          )}

          {/* Data preview */}
          <div className="mb-6">
            <h3 className="text-heading font-semibold text-sm mb-2">Data Preview (first 5 rows)</h3>
            <div className="bg-card-bg border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-section-bg">
                    {previewData.headers.map((header) => (
                      <th key={header} className="text-muted text-xs font-medium px-4 py-2.5 whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {previewData.headers.map((header) => (
                        <td key={header} className="text-body text-xs px-4 py-2 truncate max-w-40">
                          {row[header] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {importError && <p className="text-rose text-sm mb-4">{importError}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>← Back</Button>
            <Button
              variant="primary"
              size="md"
              className={`flex-1 ${!mappingIsValid || isLoadingImport ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
              onClick={handleConfirmImport}
            >
              {isLoadingImport ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Importing...
                </span>
              ) : (
                "Confirm & Import"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Import Complete ── */}
      {step === 3 && importResult && importResult.success && (
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-mint-bg flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-mint">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-heading font-bold text-2xl mb-6">Import Complete!</h2>

          <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto">
            <div className="bg-mint-bg rounded-xl p-4">
              <p className="text-mint font-bold text-2xl">{importResult.imported}</p>
              <p className="text-mint text-xs mt-1">Successfully added</p>
            </div>
            <div className={`rounded-xl p-4 ${importResult.skipped === 0 ? "bg-mint-bg" : "bg-peach-bg"}`}>
              <p className={`font-bold text-2xl ${importResult.skipped === 0 ? "text-mint" : "text-peach"}`}>
                {importResult.skipped}
              </p>
              <p className={`text-xs mt-1 ${importResult.skipped === 0 ? "text-mint" : "text-peach"}`}>
                Could not be imported
              </p>
            </div>
          </div>

          {importResult.skipped > 0 && importResult.skippedDetails && (
            <div className="text-left mb-6">
              <h3 className="font-semibold text-sm text-rose mb-2">Skipped Rows</h3>
              <div className="bg-card-bg border border-rose/20 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-section-bg">
                      <th className="text-muted text-xs font-medium px-4 py-2.5">Row #</th>
                      <th className="text-muted text-xs font-medium px-4 py-2.5">Reason</th>
                      <th className="text-muted text-xs font-medium px-4 py-2.5">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.skippedDetails.map((item, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="text-muted text-xs font-mono px-4 py-2.5 whitespace-nowrap">Row {item.row}</td>
                        <td className="text-rose text-sm px-4 py-2.5">{item.reason}</td>
                        <td className="text-muted text-xs font-mono px-4 py-2.5">
                          {Object.entries(item.data)
                            .map(([k, v]) => `${k}: ${v || "empty"}`)
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <Link href="/dashboard/analysis">
              <Button variant="primary" size="lg">Go to Analysis →</Button>
            </Link>
            <Button variant="outline" size="md" onClick={resetAll}>
              Import Another List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
