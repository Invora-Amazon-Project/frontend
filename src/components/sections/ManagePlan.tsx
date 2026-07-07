"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { plans, type Plan } from "@/lib/plan";

type Step = 1 | 2 | 3 | 4;
type Billing = "monthly" | "annual";

const STEP_LABELS = ["Choose plan", "Review", "Confirm", "Payment"];

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const num = (i + 1) as Step;
        const active = num === step;
        const done = num < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors ${
                done || active
                  ? "bg-primary text-white"
                  : "bg-section-bg text-muted border border-border"
              }`}
            >
              {done ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline
                    points="2,5 4,7 8,3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                num
              )}
            </div>
            <span
              className={`text-xs font-medium ${active ? "text-heading" : "text-muted"}`}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-8 h-px mx-1 ${done ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="w-4 h-4 rounded-full bg-mint-bg flex items-center justify-center shrink-0 mt-0.5">
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        stroke="#388E3C"
        strokeWidth="1.5"
      >
        <polyline points="1,4 3,6 7,2" />
      </svg>
    </div>
  );
}

function XIcon() {
  return (
    <div className="w-4 h-4 rounded-full bg-rose-bg flex items-center justify-center shrink-0 mt-0.5">
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        stroke="#e53935"
        strokeWidth="1.5"
      >
        <line x1="2" y1="2" x2="6" y2="6" strokeLinecap="round" />
        <line x1="6" y1="2" x2="2" y2="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 text-xs text-muted hover:text-body transition-colors cursor-pointer w-full py-1"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polyline
          points="9,2 4,7 9,12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );
}

function PlanCard({
  plan,
  billing,
  selected,
  current,
  onSelect,
}: {
  plan: Plan;
  billing: Billing;
  selected: boolean;
  current: boolean;
  onSelect?: () => void;
}) {
  const price =
    billing === "annual" ? plan.pricing.annualMonthly : plan.pricing.monthly;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={current}
      className={`w-full text-left rounded-2xl border p-5 transition-all ${
        current
          ? "border-border bg-section-bg opacity-60 cursor-default"
          : selected
            ? "border-primary bg-card-bg shadow-sm"
            : "border-border bg-card-bg hover:border-primary/50 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-widest mb-1">
            {plan.name}
          </p>
          <p className="text-2xl font-semibold text-heading">{price}</p>
          <p className="text-xs text-muted mt-0.5">
            / month{billing === "annual" ? " · billed annually" : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {plan.popular && !current && (
            <span className="bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Most Popular
            </span>
          )}
          {current && (
            <span className="text-xs font-medium bg-section-bg text-muted px-2 py-0.5 rounded-full border border-border">
              Current plan
            </span>
          )}
          {!current && (
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-xs text-body">{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

export default function ManagePlan() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentParam = (searchParams.get("current") ?? "start").toLowerCase();
  const currentPlan =
    plans.find((p) => p.name.toLowerCase() === currentParam) ?? plans[0];
  const currentIndex = plans.indexOf(currentPlan);

  const stepFromUrl = parseInt(searchParams.get("step") ?? "1");
  const step = ([1, 2, 3, 4].includes(stepFromUrl) ? stepFromUrl : 1) as Step;

  const planFromUrl = searchParams.get("plan")?.toLowerCase() ?? null;
  const billingFromUrl = (searchParams.get("billing") as Billing) ?? "monthly";
  const resultFromUrl = searchParams.get("result") as "success" | "failed" | null;

  const [from, setFrom] = useState("/dashboard");
  useEffect(() => {
    const stored = sessionStorage.getItem("manage-plan-from");
    if (stored) setFrom(stored);
  }, []);

  const defaultSelectedPlan =
    plans.find((p) => plans.indexOf(p) > currentIndex) ??
    plans.find((p) => p.name !== currentPlan.name) ??
    plans[1];

  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    planFromUrl
      ? (plans.find((p) => p.name.toLowerCase() === planFromUrl) ??
          defaultSelectedPlan)
      : defaultSelectedPlan,
  );
  const [billing, setBilling] = useState<Billing>(billingFromUrl);

  const goToStep = useCallback(
    (newStep: Step, extra?: Record<string, string>) => {
      const params = new URLSearchParams({
        current: currentParam,
        plan: selectedPlan.name.toLowerCase(),
        billing,
        step: String(newStep),
        ...extra,
      });
      router.push(`/manage-plan?${params.toString()}`);
    },
    [currentParam, selectedPlan, billing, router],
  );

  const selectedIndex = plans.indexOf(selectedPlan);
  const isUpgrade = selectedIndex > currentIndex;

  const price =
    billing === "annual"
      ? selectedPlan.pricing.annualMonthly
      : selectedPlan.pricing.monthly;
  const total =
    billing === "annual"
      ? selectedPlan.pricing.annualTotal
      : selectedPlan.pricing.monthly;

  const changedFeatures = isUpgrade
    ? selectedPlan.features.filter(
        (f) => !f.toLowerCase().startsWith("everything in"),
      )
    : currentPlan.features.filter(
        (f) => !f.toLowerCase().startsWith("everything in"),
      );

  return (
    <div className="min-h-screen bg-page-bg py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href={from}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-body transition-colors mb-8"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline
              points="9,2 4,7 9,12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>

        <div className="mb-2">
          <p className="text-xs font-medium text-muted uppercase tracking-widest mb-1">
            Account
          </p>
          <h1 className="text-2xl font-semibold text-heading">Manage Plan</h1>
        </div>

        <div className="h-px bg-border my-6" />

        <StepIndicator step={step} />

        {/* Step 1 — Plan selection */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Currently on{" "}
                <span className="font-medium text-body">
                  {currentPlan.name}
                </span>
              </p>
              <div className="flex items-center gap-1 rounded-xl border border-border bg-section-bg p-1">
                {(["monthly", "annual"] as Billing[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBilling(b)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer capitalize ${
                      billing === b
                        ? "bg-card-bg text-heading shadow-sm border border-border"
                        : "text-muted"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {billing === "annual" && (
              <p className="text-xs text-green-700 font-medium -mt-3">
                Save ~18% with annual billing
              </p>
            )}

            <div className="flex flex-col gap-3">
              {plans.map((p) => (
                <PlanCard
                  key={p.name}
                  plan={p}
                  billing={billing}
                  selected={selectedPlan.name === p.name}
                  current={p.name === currentPlan.name}
                  onSelect={() => setSelectedPlan(p)}
                />
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={() => goToStep(2)}
            >
              Continue with {selectedPlan.name} — {price}/mo
            </Button>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-5">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-widest mb-3">
                  Plan summary
                </p>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-border bg-section-bg px-4 py-2 text-center">
                    <p className="text-xs text-muted mb-0.5">From</p>
                    <p className="text-sm font-semibold text-heading">
                      {currentPlan.name}
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-muted shrink-0"
                  >
                    <polyline points="6,10 14,10" strokeLinecap="round" />
                    <polyline
                      points="10,6 14,10 10,14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="rounded-xl border border-primary bg-primary/5 px-4 py-2 text-center">
                    <p className="text-xs text-primary mb-0.5">To</p>
                    <p className="text-sm font-semibold text-heading">
                      {selectedPlan.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-heading">
                    {selectedPlan.name} plan
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {billing === "annual"
                      ? `${selectedPlan.pricing.annualMonthly}/mo · billed ${selectedPlan.pricing.annualTotal}/yr`
                      : `${selectedPlan.pricing.monthly}/mo`}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-heading">
                  {price}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-widest mb-3">
                  {isUpgrade ? "What you'll gain" : "What you'll lose"}
                </p>
                <ul className="flex flex-col gap-2">
                  {changedFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      {isUpgrade ? <CheckIcon /> : <XIcon />}
                      <span className="text-sm text-body">{f}</span>
                    </li>
                  ))}
                </ul>
                {!isUpgrade && (
                  <p className="text-xs text-muted mt-3">
                    These features will no longer be included. Your change takes
                    effect at the end of your current billing period.
                  </p>
                )}
              </div>

              {isUpgrade && (
                <div className="flex items-center justify-between rounded-xl bg-section-bg border border-border px-4 py-3">
                  <span className="text-sm text-muted">Total today</span>
                  <span className="text-sm font-semibold text-heading">
                    {total}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => goToStep(3)}
              >
                {isUpgrade ? "Review & Confirm" : "Review & Confirm"}
              </Button>
              <BackButton onClick={() => router.back()} />
            </div>
          </div>
        )}

        {/* Step 3 — Confirm (upgrade: before payment / downgrade: final confirm) */}
        {step === 3 && isUpgrade && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-5">
              <p className="text-xs font-medium text-muted uppercase tracking-widest">
                Confirm upgrade
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-heading">
                    {selectedPlan.name} plan
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {billing === "annual"
                      ? `${selectedPlan.pricing.annualMonthly}/mo · billed ${selectedPlan.pricing.annualTotal}/yr`
                      : `${selectedPlan.pricing.monthly}/mo`}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-heading">
                  {price}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-section-bg border border-border px-4 py-3">
                <span className="text-sm text-muted">Total today</span>
                <span className="text-sm font-semibold text-heading">{total}</span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center gap-2 text-xs text-muted">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="shrink-0"
                >
                  <path
                    d="M7 1L2 3.5v4c0 2.5 2 4.5 5 5.5 3-1 5-3 5-5.5v-4L7 1z"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="4.5,7 6.5,9 9.5,5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Payments are secured with 256-bit SSL encryption.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {/* TODO: Replace onClick with Stripe payment link */}
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={() => goToStep(4, { result: "success" })}
              >
                Continue to Payment
              </Button>
              <BackButton onClick={() => router.back()} />
              <p className="text-xs text-muted text-center">
                By switching plans you agree to our{" "}
                <Link
                  href="#"
                  className="text-primary hover:text-primary-hover underline underline-offset-2"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-primary hover:text-primary-hover underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                . Cancel anytime.
              </p>
            </div>
          </div>
        )}

        {step === 3 && !isUpgrade && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-5">
              <p className="text-xs font-medium text-muted uppercase tracking-widest">
                Confirmation
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-heading">
                    Switch to {selectedPlan.name}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {billing === "annual"
                      ? `${selectedPlan.pricing.annualMonthly}/mo · billed ${selectedPlan.pricing.annualTotal}/yr`
                      : `${selectedPlan.pricing.monthly}/mo`}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-heading">
                  {price}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
              </div>

              <div className="flex items-start gap-3 bg-section-bg border border-border rounded-xl px-4 py-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="shrink-0 mt-0.5 text-muted"
                >
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3.5M8 10.5v.5" strokeLinecap="round" />
                </svg>
                <p className="text-xs text-body leading-relaxed">
                  Your plan change will take effect at the end of your current
                  billing period. You&apos;ll retain access to all{" "}
                  {currentPlan.name} features until then.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => goToStep(4, { result: "success" })}
              >
                Confirm Switch to {selectedPlan.name}
              </Button>
              <BackButton onClick={() => router.back()} />
            </div>
          </div>
        )}

        {/* Step 4 — Payment result */}
        {step === 4 && resultFromUrl !== "failed" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card-bg p-8 flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-bg">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="#388E3C"
                  strokeWidth="2"
                >
                  <polyline
                    points="5,14 11,20 23,8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-heading mb-1">
                  {isUpgrade ? "Payment successful!" : "Plan changed!"}
                </h2>
                <p className="text-sm text-muted">
                  You&apos;re now on{" "}
                  <span className="font-medium text-body">
                    {selectedPlan.name}
                  </span>
                  .
                </p>
              </div>
              {isUpgrade && (
                <div className="w-full rounded-xl bg-section-bg border border-border px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-muted">Amount charged</span>
                  <span className="text-sm font-semibold text-heading">{total}</span>
                </div>
              )}
              <p className="text-xs text-muted">
                Redirecting you back…
              </p>
              <Button
                variant="primary"
                size="md"
                className="justify-center w-full mt-2"
                onClick={() => router.push(from)}
              >
                Go back
              </Button>
            </div>

          </div>
        )}

        {step === 4 && resultFromUrl === "failed" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card-bg p-8 flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-bg">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="#e53935"
                  strokeWidth="2"
                >
                  <line x1="8" y1="8" x2="20" y2="20" strokeLinecap="round" />
                  <line x1="20" y1="8" x2="8" y2="20" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-heading mb-1">
                  Payment failed
                </h2>
                <p className="text-sm text-muted">
                  Your payment could not be processed.
                </p>
                <p className="text-xs text-muted mt-1">
                  Please check your payment details and try again.
                </p>
              </div>
              <div className="w-full rounded-xl bg-rose-bg border border-rose/50 px-4 py-3 text-left">
                <p className="text-xs text-rose-dark font-semibold mb-1">
                  What might have gone wrong
                </p>
                <ul className="text-xs text-rose-dark flex flex-col gap-1 list-disc list-inside">
                  <li>Insufficient funds</li>
                  <li>Card expired or incorrect details</li>
                  <li>Bank declined the transaction</li>
                </ul>
              </div>
              <div className="w-full flex flex-col gap-2 mt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="justify-center w-full"
                  onClick={() => goToStep(3)}
                >
                  Try again
                </Button>
                <Link
                  href={from}
                  className="text-xs text-muted hover:text-body transition-colors text-center py-1"
                >
                  Back
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
