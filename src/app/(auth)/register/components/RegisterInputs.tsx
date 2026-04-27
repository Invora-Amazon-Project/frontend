"use client";

import { useState } from "react";
import Link from "next/link";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import Input from "@/components/ui/Input";

/* ---------- Type ---------- */
export type RegisterFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: true;
};

/* ---------- Password strength ---------- */
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

  if (score <= 2) return { score, label: "Weak", color: "bg-rose" };
  if (score === 3) return { score, label: "Fair", color: "bg-peach" };
  return { score, label: "Strong", color: "bg-mint" };
}

/* ---------- EyeButton ---------- */
function EyeButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors duration-150 cursor-pointer"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
    </button>
  );
}

/* ---------- Props ---------- */
interface RegisterInputsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

/* ---------- Component ---------- */
export default function RegisterInputs({ register, errors }: RegisterInputsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const strength = getPasswordStrength(passwordValue);

  return (
    <>
      {/* Full Name */}
      <Input
        label="Full Name"
        id="fullName"
        placeholder="Your Full Name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      {/* Email */}
      <Input
        label="Email"
        id="email"
        type="email"
        placeholder="example@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Password */}
      <div>
        <label htmlFor="password" className="text-xs font-medium text-body">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`
              w-full px-4 py-2.5 pr-11 text-sm text-body bg-page-bg
              border rounded-lg outline-none transition-colors duration-150
              placeholder:text-placeholder
              ${errors.password ? "border-rose focus:border-rose" : "border-border focus:border-primary"}
            `}
            {...register("password", {
              onChange: (e) => setPasswordValue(e.target.value),
            })}
          />
          <EyeButton visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        </div>

        {/* Password strength indicator */}
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
                Password strength: <span className="font-medium text-body">{strength.label}</span>
              </p>
            )}
          </div>
        )}

        {errors.password && <p className="mt-1.5 text-xs text-rose">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="text-xs font-medium text-body">
          Confirm Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className={`
              w-full px-4 py-2.5 pr-11 text-sm text-body bg-page-bg
              border rounded-lg outline-none transition-colors duration-150
              placeholder:text-placeholder
              ${errors.confirmPassword ? "border-rose focus:border-rose" : "border-border focus:border-primary"}
            `}
            {...register("confirmPassword")}
          />
          <EyeButton visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-rose">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div>
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
            {...register("terms")}
          />
          <label htmlFor="terms" className="text-sm text-muted leading-relaxed cursor-pointer">
            I have read and agree to the{" "}
            <Link
              href="/terms"
              className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-150"
            >
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link
              href="/privacy"
              className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-150"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.terms && <p className="mt-1.5 text-xs text-rose">{errors.terms.message}</p>}
      </div>
    </>
  );
}