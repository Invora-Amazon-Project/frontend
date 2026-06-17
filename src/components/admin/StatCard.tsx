import { ReactNode } from "react";

type Color = "primary" | "mint" | "peach" | "rose";

const iconBg: Record<Color, string> = {
  primary: "bg-primary-light",
  mint: "bg-mint-bg",
  peach: "bg-peach-bg",
  rose: "bg-rose-bg",
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: Color;
}

export default function StatCard({ title, value, subtitle, icon, color = "primary" }: StatCardProps) {
  return (
    <div className="bg-card-bg border border-border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg[color]}`}>
          {icon}
        </span>
        <span className="text-muted text-sm">{title}</span>
      </div>
      <p className="text-heading font-semibold text-2xl mt-2">{value}</p>
      {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
}
