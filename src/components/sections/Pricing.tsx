"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import WaitlistModal from "@/components/ui/WaitlistModal";
import { plans } from "@/lib/plan";

export default function Pricing({
  showCompareLink = false,
}: {
  showCompareLink?: boolean;
}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="pricing" className="bg-card-bg py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl font-semibold text-heading tracking-tight mb-4">
            Simple, transparent plans
          </h2>
          <p className="text-base text-muted max-w-lg mx-auto leading-relaxed">
            Start free, upgrade when you are ready. No hidden fees.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-sm text-muted">Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-11 cursor-pointer h-6 rounded-full transition-colors ${isAnnual ? "bg-primary" : "bg-border"}`}
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${isAnnual ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className="text-sm text-muted">Annually</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <div key={plan.name}>
              <Card variant={plan.variant}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-muted uppercase tracking-widest">
                  {plan.name}
                </p>
                {plan.popular && (
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                {plan.comingSoon && (
                  <span className="bg-section-bg text-muted text-xs font-semibold px-3 py-1 rounded-full border border-border">
                    Coming soon
                  </span>
                )}
              </div>

              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-semibold text-heading">
                  {isAnnual ? plan.pricing.annualMonthly : plan.pricing.monthly}
                </span>
                <span className="text-sm text-muted mb-1">/ month</span>
              </div>
              {isAnnual && (
                <p className="text-xs text-muted mb-2">
                  {plan.pricing.annualTotal} billed annually
                </p>
              )}

              {plan.seats && (
                <span className="inline-block text-xs font-medium bg-mint-bg text-green-700 px-2 py-0.5 rounded-full mb-3">
                  {plan.seats}
                </span>
              )}

              <p className="text-sm text-muted mb-6 leading-relaxed">
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

              {plan.comingSoon ? (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center opacity-50"
                  disabled
                >
                  Coming soon
                </Button>
              ) : (
                <Button
                  variant={plan.buttonVariant}
                  size="md"
                  className="w-full justify-center"
                  onClick={() => setIsModalOpen(true)}
                >
                  {plan.cta}
                </Button>
              )}
              {!plan.comingSoon && plan.note && (
                <p className="text-xs text-muted text-center mt-3">
                  {plan.note}
                </p>
              )}
              </Card>
            </div>
          ))}
        </div>
        {showCompareLink && (
          <div className="text-center mt-10">
            <Link
              href="/pricing"
              className="text-sm text-muted hover:text-heading transition-colors duration-150"
            >
              Compare all plan features →
            </Link>
          </div>
        )}
      </div>
      <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
