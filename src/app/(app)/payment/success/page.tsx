"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-border bg-card-bg p-10 flex flex-col items-center text-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-bg">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              stroke="#388E3C"
              strokeWidth="2"
            >
              <polyline
                points="5,14 11,20 23,8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-heading mb-2">
              Payment successful!
            </h1>
            <p className="text-sm text-body leading-relaxed">
              Your subscription is now active. We&apos;re taking you to your
              dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-spin"
            >
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M2.5 9.5l1.4-1.4M8.1 3.9l1.4-1.4" strokeLinecap="round" />
            </svg>
            Redirecting to your dashboard in 5 seconds…
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => router.push("/dashboard")}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
