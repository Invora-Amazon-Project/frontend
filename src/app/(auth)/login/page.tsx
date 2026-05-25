"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaAmazon } from "react-icons/fa";
import Button from "@/components/ui/Button";
import LoginInputs, { LoginFormData } from "./components/LoginInputs";

/* ---------- Zod schema ---------- */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ---------- Page ---------- */
export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      console.log("Login payload:", data);
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      setServerError("Sign in failed. Please try again.");
    }
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

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-heading">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <LoginInputs register={register} errors={errors} />

            {serverError && (
              <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-placeholder">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-body transition-colors duration-150 hover:bg-section-bg cursor-pointer"
            >
              <FcGoogle className="h-4 w-4" />
              Continue with Google
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-body transition-colors duration-150 hover:bg-section-bg cursor-pointer"
            >
              <FaAmazon className="h-4 w-4 text-[#FF9900]" />
              Continue with Amazon
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-body transition-colors duration-150 hover:bg-section-bg cursor-pointer"
            >
              <FaFacebook className="h-4 w-4 text-[#1877F2]" />
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:text-primary-hover transition-colors duration-150">
            Sign up for free
          </Link>
        </p>
      </div>
    </main>
  );
}