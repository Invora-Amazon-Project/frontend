import type { ReactNode } from "react";
import Card from "@/components/ui/Card";

interface Feature {
  title: string;
  description: string;
  iconBg: string;
  icon: ReactNode;
}

const features: Feature[] = [
  {
    title: "Product Research",
    description:
      "Find profitable with real-time sales data, demand trends, and competition analysis",
    iconBg: "bg-primary-light",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="#5C6BC0"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="5" />
        <path d="M13 13l2.5 2.5" />
      </svg>
    ),
  },
  {
    title: "Supplier Sourcing",
    description:
      "Connect with verified suppliers, compare quotes, and track your sourcing pipeline end to end.",
    iconBg: "bg-mint-bg",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="#388E3C"
        strokeWidth="1.5"
      >
        <path d="M3 9h12M9 3l6 6-6 6" />
      </svg>
    ),
  },
  {
    title: "Order Management",
    description:
      "Keep all your purchase orders organized, track shipping statuses, and never miss a deadline.",
    iconBg: "bg-peach-bg",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="#F57C00"
        strokeWidth="1.5"
      >
        <rect x="2" y="4" width="14" height="10" rx="2" />
        <path d="M2 7h14" />
      </svg>
    ),
  },
  {
    title: "Profit Analytics",
    description:
      "See your true margins after fees, shipping, and returns with automated P&L tracking.",
    iconBg: "bg-rose-bg",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="#C2185B"
        strokeWidth="1.5"
      >
        <polyline points="2,12 6,7 10,10 14,4" />
        <circle cx="14" cy="4" r="1.5" />
      </svg>
    ),
  },
  {
    title: "Amazon Seller Central Integration",
    description:
      "Your FBA data, fees, and inventory synced directly. No manual entry, no guesswork — everything pulled from the source.",
    iconBg: "bg-primary-light",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="#5C6BC0"
        strokeWidth="1.5"
      >
        <rect x="2" y="2" width="6" height="6" rx="1" />
        <rect x="10" y="2" width="6" height="6" rx="1" />
        <rect x="2" y="10" width="6" height="6" rx="1" />
        <rect x="10" y="10" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    title: "Competitor Tracking",
    description:
      "Monitor competitor pricing, reviews, and rankings automatically. Stay one step ahead always.",
    iconBg: "bg-mint-bg",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        stroke="#388E3C"
        strokeWidth="1.5"
      >
        <path d="M9 2v4M9 12v4M2 9h4M12 9h4" />
        <circle cx="9" cy="9" r="3" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-card-bg py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            What MarginLane does
          </p>
          <h2 className="text-4xl font-semibold text-heading tracking-tight mb-4">
            Everything you need to source with confidence
          </h2>
          <p className="text-base text-muted max-w-lg mx-auto leading-relaxed">
            From product discovery to order management — built for serious
            Amazon sellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <Card key={feature.title}>
              <div
                className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-heading mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
