"use client";

import { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { createSupportTicket } from "@/lib/services/supportTicketsService";

type Category =
  | "technical_support"
  | "billing"
  | "account"
  | "product_analysis"
  | "amazon_connection"
  | "other"
  | "";

type Priority = "low" | "medium" | "high" | "critical" | "";
type Status = "idle" | "success" | "error";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  relatedEntity?: {
    type: "product" | "order" | "import";
    id: string;
    label: string;
  };
}

const categories: { value: Category; label: string; icon: string }[] = [
  { value: "technical_support", label: "Technical Support", icon: "🔧" },
  { value: "billing", label: "Billing", icon: "💳" },
  { value: "account", label: "Account", icon: "👤" },
  { value: "product_analysis", label: "Product Analysis", icon: "📊" },
  { value: "amazon_connection", label: "Amazon Connection", icon: "🔗" },
  { value: "other", label: "Other", icon: "•••" },
];

const priorities: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function TicketModal({
  isOpen,
  onClose,
  onCreated,
  relatedEntity,
}: TicketModalProps) {
  const [category, setCategory] = useState<Category>("");
  const [priority, setPriority] = useState<Priority>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setCategory("");
    setPriority("");
    setTitle("");
    setDescription("");
    setFiles([]);
    setStatus("idle");
    onClose();
  };

  const handleSubmit = async () => {
    if (!category || !priority || !title || !description) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await createSupportTicket({
        title,
        description,
        department: category,
        priority,
        relatedEntityType: relatedEntity?.type,
        relatedEntityId: relatedEntity?.id,
        relatedEntityLabel: relatedEntity?.label,
      });
      setStatus("success");
      onCreated?.();
    } catch {
      setErrorMessage("Something went wrong while submitting your ticket. Please try again.");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = category && priority && title && description;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Card>
        {status === "success" ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-mint-bg flex items-center justify-center mx-auto mb-5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#388E3C"
                strokeWidth="1.5"
              >
                <polyline points="4,12 9,17 20,6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-heading mb-2">
              Ticket submitted!
            </h3>
            <p className="text-sm text-muted mb-6">
              We&apos;ll get back to you as soon as possible.
            </p>
            <Button variant="outline" size="md" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-heading">
                  Create a support ticket
                </h3>
                <p className="text-sm text-muted mt-0.5">
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted hover:text-heading transition-colors duration-150 cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-body">
                  Department
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value as Category)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-150 cursor-pointer ${
                        category === cat.value
                          ? "bg-primary-light border-primary text-primary"
                          : "bg-page-bg border-border text-muted hover:border-primary"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-body">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value as Priority)}
                      className={`flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-150 cursor-pointer ${
                        priority === p.value
                          ? "bg-primary-light border-primary text-primary"
                          : "bg-page-bg border-border text-muted hover:border-primary"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <Input
                label="Title"
                type="text"
                placeholder="Short summary of your issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-body">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary transition-colors duration-150 placeholder:text-placeholder resize-none"
                />
              </div>

              {/* Related entity */}
              {relatedEntity && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-section-bg border border-border rounded-lg">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-muted shrink-0"
                  >
                    <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" />
                  </svg>
                  <span className="text-xs text-muted">Related to:</span>
                  <span className="text-xs font-medium text-body capitalize">
                    {relatedEntity.type}
                  </span>
                  <span className="text-xs text-muted">—</span>
                  <span className="text-xs text-primary truncate">
                    {relatedEntity.label}
                  </span>
                </div>
              )}

              {/* File upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-body">
                  Attachments{" "}
                  <span className="text-muted font-normal">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-page-bg border border-dashed border-border rounded-lg text-sm text-muted hover:border-primary transition-colors duration-150 cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 2v8M4 6l4-4 4 4" />
                    <path d="M2 12h12" />
                  </svg>
                  Click to upload screenshots or files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                {files.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-section-bg border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="#6B7BB5"
                            strokeWidth="1.5"
                          >
                            <rect x="2" y="1" width="10" height="12" rx="1.5" />
                            <path d="M4 5h6M4 7.5h6M4 10h4" />
                          </svg>
                          <span className="text-xs text-body truncate max-w-50">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-muted hover:text-heading transition-colors duration-150 cursor-pointer"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M2 2l8 8M10 2L2 10" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {errorMessage && (
                <p className="text-xs text-danger">{errorMessage}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 justify-center"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit ticket"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </Modal>
  );
}
