// components/ui/Input.tsx

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-body">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 text-sm text-body bg-page-bg
          border rounded-lg outline-none transition-colors duration-150
          placeholder:text-placeholder
          ${error ? "border-rose focus:border-rose" : "border-border focus:border-primary"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose">{error}</p>}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
