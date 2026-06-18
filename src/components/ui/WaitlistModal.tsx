"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { subscribeNewsletterService } from "@/lib/newsletterService";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async () => {
    if (!email) return;

    setStatus("loading");
    try {
      await subscribeNewsletterService({ email, source: "waitlist-modal" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    setEmail("");
    setStatus("idle");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-heading mb-1">
              Join the waitlist
            </h3>
            <p className="text-sm text-muted">
              Be the first to know when MarginLane launches.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted hover:text-heading transition-colors duration-150 mt-0.5 cursor-pointer"
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

        {status === "success" ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-mint-bg flex items-center justify-center mx-auto mb-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="#388E3C"
                strokeWidth="1.5"
              >
                <polyline points="4,11 9,16 18,6" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-heading mb-1">
              You are on the list!
            </p>
            <p className="text-sm text-muted">
              We will notify you as soon as MarginLane is ready.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-body mb-2">
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={
                  status === "error"
                    ? "Something went wrong. Please try again."
                    : undefined
                }
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-rose mb-3">
                Something went wrong. Please try again.
              </p>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleSubmit}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Submitting..." : "Notify me"}
            </Button>

            <p className="text-xs text-muted text-center mt-3">
              No spam, ever. Unsubscribe at any time.
            </p>
          </>
        )}
      </Card>
    </Modal>
  );
}
