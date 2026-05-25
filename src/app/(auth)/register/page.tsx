"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaAmazon } from "react-icons/fa";
import Button from "@/components/ui/Button";
import RegisterInputs, { RegisterFormData } from "../register/components/RegisterInputs";

/* ---------- Zod schema ---------- */
const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      error: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ---------- Page ---------- */
export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      console.log("Register payload:", data);
      await new Promise((r) => setTimeout(r, 800));
    } catch {
      setServerError("Could not create account. Please try again.");
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-heading">Create an account</h1>
            <p className="mt-1 text-sm text-muted">Start for free, upgrade anytime</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <RegisterInputs register={register} errors={errors} />

            {serverError && (
              <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
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
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}