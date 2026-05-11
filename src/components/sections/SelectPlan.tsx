"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { plans, type Plan } from "@/lib/plan";

// TODO: Replace with actual Stripe payment links per plan/billing
// success_url: https://yourdomain.com/payment/success
// cancel_url:  https://yourdomain.com/payment/failed
const STRIPE_LINKS: Record<string, Record<string, string>> = {
  start: { monthly: "#", annual: "#" },
  pro: { monthly: "#", annual: "#" },
  team: { monthly: "#", annual: "#" },
};

type Billing = "monthly" | "annual";

function PlanCard({
  plan,
  billing,
  onSelect,
}: {
  plan: Plan;
  billing: Billing;
  onSelect: () => void;
}) {
  const price =
    billing === "annual" ? plan.pricing.annualMonthly : plan.pricing.monthly;

  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col ${
        plan.popular
          ? "border-primary bg-card-bg shadow-sm"
          : "border-border bg-card-bg"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-muted uppercase tracking-widest">
          {plan.name}
        </p>
        {plan.popular && (
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        )}
      </div>

      <div className="flex items-end gap-1 mb-2">
        <span className="text-4xl font-semibold text-heading">{price}</span>
        <span className="text-sm text-muted mb-1">/ month</span>
      </div>

      {billing === "annual" && (
        <p className="text-xs text-muted mb-2">
          {plan.pricing.annualTotal} billed annually
        </p>
      )}

      {plan.seats && (
        <span className="inline-block text-xs font-medium bg-mint-bg text-green-700 px-2 py-0.5 rounded-full mb-3 self-start">
          {plan.seats}
        </span>
      )}

      <p className="text-sm text-muted mb-6 leading-relaxed flex-1">
        {plan.description}
      </p>

      <ul className="flex flex-col gap-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-mint-bg flex items-center justify-center shrink-0">
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
            <span className="text-sm text-body">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.buttonVariant}
        size="md"
        className="w-full justify-center"
        onClick={onSelect}
      >
        {plan.cta}
      </Button>

      {plan.note && (
        <p className="text-xs text-muted text-center mt-3">{plan.note}</p>
      )}
    </div>
  );
}

export default function SelectPlan() {
  const [isAnnual, setIsAnnual] = useState(false);
  const billing: Billing = isAnnual ? "annual" : "monthly";

  const handleSelectPlan = (plan: Plan) => {
    const stripeLink = STRIPE_LINKS[plan.name.toLowerCase()]?.[billing] ?? "#";
    window.location.href = stripeLink;
  };

  return (
    <div className="min-h-screen bg-page-bg py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            Get started
          </p>
          <h1 className="text-3xl font-semibold text-heading tracking-tight mb-3">
            Choose your plan
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Select the plan that fits your business. All plans include a 7-day
            free trial.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span
              className={`text-sm transition-colors ${!isAnnual ? "text-heading font-medium" : "text-muted"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-11 cursor-pointer h-6 rounded-full transition-colors ${
                isAnnual ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm transition-colors ${isAnnual ? "text-heading font-medium" : "text-muted"}`}
            >
              Annually{" "}
              <span className="text-xs text-green-700 font-medium">
                (save ~18%)
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              billing={billing}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
