"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetPassword, clearResetPasswordState } from "@/lib/authSlice";

/* ---------- Zod schema ---------- */
const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/* ---------- Form ---------- */
function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPasswordLoading, resetPasswordError, resetPasswordSuccess } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    dispatch(clearResetPasswordState());
    dispatch(resetPassword({ token, newPassword: data.newPassword }));
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-heading">Reset password</h1>
            <p className="mt-1 text-sm text-muted">Choose a new password for your account</p>
          </div>

          {!token ? (
            <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
              This reset link is invalid or missing a token. Please request a new one.
            </div>
          ) : resetPasswordSuccess ? (
            <div className="rounded-xl border border-border bg-mint-bg px-4 py-3 text-sm text-mint">
              Your password has been reset. You can now sign in with your new password.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Input
                label="New password"
                id="newPassword"
                type="password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />

              <Input
                label="Confirm new password"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {resetPasswordError && (
                <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
                  {resetPasswordError}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={resetPasswordLoading}>
                {resetPasswordLoading ? "Resetting…" : "Reset password"}
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

/* ---------- Page ---------- */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
