"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";

/* ---------- Zod schema ---------- */
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Ad soyad en az 2 karakter olmalı")
      .max(60, "Ad soyad en fazla 60 karakter olabilir"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z
      .string()
      .min(8, "Parola en az 8 karakter olmalı")
      .regex(/[A-Z]/, "En az bir büyük harf içermeli")
      .regex(/[0-9]/, "En az bir rakam içermeli"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Devam etmek için koşulları kabul etmelisin" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/* ---------- Parola gücü hesaplama ---------- */
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Zayıf", color: "bg-rose-400" };
  if (score === 3) return { score, label: "Orta", color: "bg-peach" };
  return { score, label: "Güçlü", color: "bg-mint" };
}

/* ---------- Küçük yardımcı componentler ---------- */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-rose-500">{message}</p>;
}

function InputField({
  label,
  id,
  type = "text",
  placeholder,
  error,
  hint,
  ...rest
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-heading">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`
          w-full rounded-xl border bg-card-bg px-4 py-2.5 text-sm text-body
          placeholder:text-placeholder
          outline-none transition-colors duration-150
          focus:border-primary focus:ring-2 focus:ring-primary/20
          ${error ? "border-rose-400" : "border-border"}
        `}
        {...rest}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

/* ---------- Ana sayfa ---------- */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      // TODO: backend bağlantısı kurulduğunda burası doldurulacak
      console.log("Register payload:", data);
      await new Promise((r) => setTimeout(r, 800)); // geçici simülasyon
      // router.push("/onboarding");
    } catch {
      setServerError("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    );

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card-bg p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-heading">Hesap oluştur</h1>
            <p className="mt-1 text-sm text-muted">Ücretsiz başla, istediğin zaman yükselt</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Ad Soyad */}
            <InputField
              label="Ad Soyad"
              id="fullName"
              placeholder="Adın Soyadın"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            {/* E-posta */}
            <InputField
              label="E-posta"
              id="email"
              type="email"
              placeholder="ornek@email.com"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Parola */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-heading">
                Parola
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`
                    w-full rounded-xl border bg-card-bg px-4 py-2.5 pr-11 text-sm text-body
                    placeholder:text-placeholder
                    outline-none transition-colors duration-150
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    ${errors.password ? "border-rose-400" : "border-border"}
                  `}
                  {...register("password", {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors duration-150"
                  aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Parola güç göstergesi */}
              {passwordValue && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="mt-1 text-xs text-muted">
                      Parola gücü: <span className="font-medium text-body">{strength.label}</span>
                    </p>
                  )}
                </div>
              )}

              <FieldError message={errors.password?.message} />
            </div>

            {/* Parola tekrar */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-heading">
                Parola Tekrar
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className={`
                    w-full rounded-xl border bg-card-bg px-4 py-2.5 pr-11 text-sm text-body
                    placeholder:text-placeholder
                    outline-none transition-colors duration-150
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    ${errors.confirmPassword ? "border-rose-400" : "border-border"}
                  `}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors duration-150"
                  aria-label={showConfirm ? "Parolayı gizle" : "Parolayı göster"}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            {/* Kullanım koşulları */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
                {...register("terms")}
              />
              <label htmlFor="terms" className="text-sm text-muted leading-relaxed cursor-pointer">
                <Link href="/terms" className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-150">
                  Kullanım Koşulları
                </Link>
                {" "}ve{" "}
                <Link href="/privacy" className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-150">
                  Gizlilik Politikası
                </Link>
                {"'nı okudum ve kabul ediyorum"}
              </label>
            </div>
            <FieldError message={errors.terms?.message} />

            {/* Sunucu hatası */}
            {serverError && (
              <div className="rounded-xl border border-rose-200 bg-rose-bg px-4 py-3 text-sm text-rose-600">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-placeholder">veya</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google OAuth — placeholder */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg px-4 py-2.5 text-sm font-medium text-body transition-colors duration-150 hover:bg-section-bg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google ile kayıt ol
          </button>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-muted">
          Zaten hesabın var mı?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors duration-150"
          >
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}