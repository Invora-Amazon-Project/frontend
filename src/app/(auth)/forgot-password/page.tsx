"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { forgotPassword, clearForgotPasswordState } from "@/lib/authSlice";

/* ---------- Zod schema ---------- */
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/* ---------- Page ---------- */
export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { forgotPasswordLoading, forgotPasswordError, forgotPasswordSuccess } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    dispatch(clearForgotPasswordState());
    await dispatch(forgotPassword(data));
  };

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back to Login */}
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Sign in
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card-bg p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-heading">Forgot password?</h1>
            <p className="mt-1 text-sm text-muted">We&apos;ll send you a reset link</p>
          </div>

          {forgotPasswordSuccess ? (
            <div className="rounded-xl border border-border bg-mint-bg px-4 py-3 text-sm text-mint">
              If an account exists for that email, a password reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="example@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              {forgotPasswordError && (
                <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
                  {forgotPasswordError}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
