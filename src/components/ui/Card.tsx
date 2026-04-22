// src/components/ui/Card.tsx

import type { ReactNode } from "react";
import type { CardVariant } from "@/types";

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}

export default function Card({
  variant = "default",
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        bg-card-bg rounded-2xl p-6
        ${
          variant === "featured"
            ? "border-2 border-primary"
            : "border border-border"
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}
