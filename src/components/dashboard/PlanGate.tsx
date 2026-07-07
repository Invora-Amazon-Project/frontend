"use client";

// Usage: <PlanGate requiredPlan="pro" featureName="Daily Pulse advanced alerts"><DailyPulsePage /></PlanGate>

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/lib/hooks";

// TODO: Set to false when backend authentication and real plan data is connected
const BYPASS_PLAN_GATE = true;

type PlanLevel = "starter" | "pro" | "team";

const PLAN_RANK: Record<PlanLevel, number> = {
  starter: 0,
  pro:     1,
  team:    2,
};

interface PlanGateProps {
  requiredPlan: "pro" | "team";
  featureName: string;
  children: ReactNode;
}

export default function PlanGate({ requiredPlan, featureName, children }: PlanGateProps) {
  const pathname = usePathname();

  if (BYPASS_PLAN_GATE) return <>{children}</>;

  const user = useAppSelector((state) => state.auth.user);

  // TODO: Replace with plan from backend once subscription API is integrated — GET /subscription/current
  const currentPlan = ((user as unknown as { plan?: PlanLevel }) ?.plan ?? "starter") as PlanLevel;

  const hasAccess = PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];

  if (hasAccess) return <>{children}</>;

  const planLabel = requiredPlan === "pro" ? "Pro" : "Team";

  return (
    <div className="relative">
      {/* Blurred children underneath */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-card-bg border border-border rounded-xl p-6 shadow-lg text-center max-w-xs mx-4">
          <div className="w-11 h-11 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-heading font-semibold text-sm mb-1">
            This feature requires {planLabel} Plan
          </p>
          <p className="text-muted text-xs mb-4">{featureName}</p>
          <Link
            href="/manage-plan"
            onClick={() => sessionStorage.setItem("manage-plan-from", pathname)}
          >
            <Button variant="primary" size="sm">Upgrade to unlock</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
