// src/components/ui/Badge.tsx

import type { ReactNode } from "react";
import type { BadgeVariant } from "@/types";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary-light text-body",
  success: "bg-mint-bg text-green-800",
  warning: "bg-peach-bg text-orange-800",
  danger: "bg-rose-bg text-pink-900",
  info: "bg-section-bg text-heading",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
