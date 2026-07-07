"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type PageState = "enter_email" | "email_sent";

export default function ForgotPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("enter_email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    // TODO: Replace mock delay with real API call to auth service
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
    setPageState("email_sent");
  };

  const handleResend = async () => {
    setLoading(true);
    // TODO: Replace mock delay with real API call to auth service
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
  };

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back to Homepage */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Homepage
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card-bg p-8 shadow-sm">

          {pageState === "enter_email" ? (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <p className="text-heading font-bold text-xl mb-4">MarginLane</p>
                <h1 className="text-heading font-semibold text-2xl">Forgot your password?</h1>
                <p className="mt-2 text-muted text-sm">
                  Enter your email address and we&apos;ll send you a reset link.
                </p>
              </div>

              {/* Fields */}
              <div className="space-y-5">
                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading || !email}
                  onClick={handleSend}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
              </div>

              <p className="mt-6 text-center">
                <Link href="/login" className="text-primary text-sm hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Email sent state */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-mint-bg flex items-center justify-center mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-mint"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h1 className="text-heading font-semibold text-2xl">Check your email</h1>
                <p className="mt-2 text-muted text-sm max-w-xs">
                  We sent a reset link to{" "}
                  <span className="font-medium text-body">{email}</span>. Check your inbox and
                  follow the instructions.
                </p>

                <div className="w-full mt-8 space-y-3">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" size="lg" className="w-full">
                      Open Gmail
                    </Button>
                  </a>

                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                    onClick={handleResend}
                  >
                    {loading ? "Resending…" : "Resend email"}
                  </Button>
                </div>

                <Link href="/login" className="mt-6 text-primary text-sm hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
