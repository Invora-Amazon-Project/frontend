import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CardVariant, ButtonVariant } from "@/types";
import Link from "next/link";

interface Plan {
  name: string;
  price: string;
  period: string | null;
  description: string;
  features: string[];
  cta: string;
  variant: CardVariant;
  buttonVariant: ButtonVariant;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "Free",
    period: null,
    description: "Perfect for new sellers just getting started.",
    features: [
      "Up to 20 product searches/mo",
      "1 sourcing list",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get started free",
    variant: "default",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    description: "For serious sellers ready to scale their business.",
    features: [
      "Unlimited product searches",
      "Unlimited sourcing lists",
      "Advanced analytics & P&L",
      "Competitor tracking",
      "Priority support",
    ],
    cta: "Start 14-day free trial",
    variant: "featured",
    buttonVariant: "primary",
  },
];

export default function Pricing() {
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} variant={plan.variant}>
              <p className="text-xs font-medium text-muted uppercase tracking-widest mb-4">
                {plan.name}
              </p>

              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-semibold text-heading">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted mb-1">{plan.period}</span>
                )}
              </div>

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

              <Link href="/register">
                <Button
                  variant={plan.buttonVariant}
                  size="md"
                  className="w-full justify-center"
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
