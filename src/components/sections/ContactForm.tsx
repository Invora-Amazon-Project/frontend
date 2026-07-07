"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

type MembershipOption = "member" | "visitor" | "";
type Status = "idle" | "success" | "error";

const membershipConfig = {
  member: {
    description:
      "Having trouble accessing your dashboard or need help? We're here for you.",
    emailNote: "We'll verify your email against our records.",
    placeholder: "Describe your issue or question in detail...",
  },
  visitor: {
    description:
      "We'd love to hear your thoughts. Share your feedback, suggestions, or questions with us.",
    emailNote: "Enter your email so we can get back to you.",
    placeholder: "Share your thoughts, feedback or questions...",
  },
};

export default function ContactForm() {
  const [membership, setMembership] = useState<MembershipOption>("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [emailError, setEmailError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = membership ? membershipConfig[membership] : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setEmailError("");
    if (!membership || !email || !message) return;

    // Backend hazır olduğunda burası güncellenecek
    // if (membership === "member") {
    //   const isValid = await verifyEmail(email);
    //   if (!isValid) {
    //     setEmailError("This email is not registered in our system.");
    //     return;
    //   }
    // }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <Card>
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
            Message sent!
          </h3>
          <p className="text-sm text-muted">
            We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <section className="bg-page-bg py-24 px-6">
      <div className="max-w-xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-8 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Homepage
        </Link>
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            Contact
          </p>
          <h1 className="text-4xl font-semibold text-heading tracking-tight mb-4">
            Get in touch
          </h1>

          {/* Açıklama yazısı membership seçimine göre değişiyor */}
          <p className="text-base text-muted leading-relaxed min-h-12 transition-all duration-200">
            {config
              ? config.description
              : "Select an option below to get started."}
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-5">
            {/* Membership option */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-3">
                {[
                  { value: "member", label: "Member" },
                  { value: "visitor", label: "Visitor" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setMembership(option.value as MembershipOption);
                      setEmailError("");
                      setEmail("");
                    }}
                    className={`
                      flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors duration-150 cursor-pointer
                      ${
                        membership === option.value
                          ? "bg-primary-light border-primary text-primary"
                          : "bg-page-bg border-border text-muted hover:border-primary"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email input */}
            {membership && (
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                />
                <p className="text-xs text-muted">{config?.emailNote}</p>
              </div>
            )}

            {/* Message textarea */}
            {membership && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-body">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={config?.placeholder}
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary transition-colors duration-150 placeholder:text-placeholder resize-none"
                />
              </div>
            )}

            {/* File upload */}
            {membership && (
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
                  Click to upload files or documents
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                {files.length > 0 && (
                  <ul className="flex flex-col gap-2 mt-1">
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
            )}

            {/* Submit */}
            {membership && (
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={handleSubmit}
                disabled={!email || !message}
              >
                Send message
              </Button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
