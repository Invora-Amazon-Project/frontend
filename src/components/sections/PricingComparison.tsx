"use client";

import React from "react";

type FeatureValue = boolean | string;

interface ComparisonFeature {
  name: string;
  start: FeatureValue;
  pro: FeatureValue;
  team: FeatureValue;
}

interface ComparisonCategory {
  category: string;
  features: ComparisonFeature[];
}

const categories: ComparisonCategory[] = [
  {
    category: "Product Search & Analysis",
    features: [
      {
        name: "ASIN / EAN / product name search",
        start: true,
        pro: true,
        team: true,
      },
      {
        name: "Core profit, ROI & margin calculator",
        start: true,
        pro: true,
        team: true,
      },
      {
        name: "Basic sales potential indicator",
        start: true,
        pro: true,
        team: true,
      },
      {
        name: "Advanced profit analysis (FBA, shipping, VAT)",
        start: false,
        pro: true,
        team: true,
      },
      {
        name: "Break-even & maximum buy price suggestion",
        start: false,
        pro: true,
        team: true,
      },
      {
        name: "Buy Box, competition & seller density analysis",
        start: false,
        pro: true,
        team: true,
      },
    ],
  },
  {
    category: "Risk & Alerts",
    features: [
      {
        name: "IP claims & brand restriction alerts",
        start: false,
        pro: true,
        team: true,
      },
      { name: "Hazmat & oversize flags", start: false, pro: true, team: true },
    ],
  },
  {
    category: "Filters & Export",
    features: [
      {
        name: "Basic filters (price, profit, category)",
        start: true,
        pro: true,
        team: true,
      },
      { name: "Advanced filters & tags", start: false, pro: true, team: true },
      { name: "Excel / CSV export", start: false, pro: true, team: true },
    ],
  },
  {
    category: "Orders & Tracking",
    features: [
      {
        name: "Product saving & tracking list",
        start: true,
        pro: true,
        team: true,
      },
      { name: "Manual order list", start: true, pro: true, team: true },
      {
        name: "Order quantity recommendation & supplier notes",
        start: false,
        pro: true,
        team: true,
      },
      {
        name: "Task assignment & PO generation",
        start: false,
        pro: false,
        team: true,
      },
    ],
  },
  {
    category: "Team & Collaboration",
    features: [
      { name: "Users", start: "1", pro: "1", team: "3+" },
      {
        name: "Role & permission management",
        start: false,
        pro: false,
        team: true,
      },
      {
        name: "Shared product pool & team comments",
        start: false,
        pro: false,
        team: true,
      },
      {
        name: "Product approval workflow",
        start: false,
        pro: false,
        team: true,
      },
      {
        name: "Supplier management & performance dashboard",
        start: false,
        pro: false,
        team: true,
      },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Basic support", start: true, pro: true, team: true },
      { name: "Priority support", start: false, pro: true, team: true },
      {
        name: "Onboarding & integration assistance",
        start: false,
        pro: false,
        team: true,
      },
    ],
  },
];

const planKeys = ["start", "pro", "team"] as const;
type PlanKey = (typeof planKeys)[number];

const planLabels: Record<PlanKey, string> = {
  start: "Start",
  pro: "Pro",
  team: "Team",
};

function proCell(extra = "") {
  return `py-3 px-4 text-center bg-card-bg border-l-2 border-r-2 border-l-primary border-r-primary ${extra}`;
}

function regularCell(extra = "") {
  return `py-3 px-2 text-center ${extra}`;
}

function Cell({
  value,
  isProColumn,
}: {
  value: FeatureValue;
  isProColumn: boolean;
}) {
  if (typeof value === "string") {
    return (
      <span
        className={`text-sm font-medium ${isProColumn ? "text-primary" : "text-heading"}`}
      >
        {value}
      </span>
    );
  }

  if (value) {
    return (
      <div className="w-5 h-5 rounded-full bg-mint-bg flex items-center justify-center mx-auto">
        <svg
          width="9"
          height="9"
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

  return (
    <span className="text-muted text-base leading-none select-none">—</span>
  );
}

export default function PricingComparison() {
  const lastCatIndex = categories.length - 1;

  return (
    <section className="bg-section-bg py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            Compare
          </p>
          <h2 className="text-3xl font-semibold text-heading tracking-tight">
            Everything side by side
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="pb-4 pr-6 w-1/2" />
                {planKeys.map((key) => (
                  <th
                    key={key}
                    className={
                      key === "pro"
                        ? "pb-4 text-center w-1/6 bg-card-bg rounded-t-xl border-t-2 border-x-2 border-primary px-4 pt-2"
                        : "pb-4 text-center w-1/6 px-2 pt-2"
                    }
                  >
                    <span
                      className={`text-sm font-semibold ${key === "pro" ? "text-primary" : "text-heading"}`}
                    >
                      {planLabels[key]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((cat, catIndex) => {
                const isLastCat = catIndex === lastCatIndex;

                return (
                  <React.Fragment key={cat.category}>
                    {/* Category header row */}
                    {catIndex > 0 && (
                      <tr>
                        <td className="h-6" />
                        <td className="h-6" />
                        <td className="h-6 bg-card-bg border-l-2 border-r-2 border-l-primary border-r-primary" />
                        <td className="h-6" />
                      </tr>
                    )}

                    <tr>
                      <td className="pt-2 pb-2 px-4 bg-card-bg rounded-lg">
                        <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                          {cat.category}
                        </span>
                      </td>
                      <td className="pt-8 pb-2" />
                      <td className="pt-6 pb-2 bg-card-bg border-l-2 border-r-2 border-l-primary border-r-primary" />
                      <td className="pt-6 pb-2" />
                    </tr>

                    {/* Feature rows */}
                    {cat.features.map((feature, featureIndex) => {
                      const isLastFeature =
                        featureIndex === cat.features.length - 1;
                      const isVeryLast = isLastCat && isLastFeature;

                      return (
                        <tr key={feature.name}>
                          <td
                            className={`py-3 pr-6 pl-4 text-sm text-body ${!isVeryLast ? "border-b border-border" : ""}`}
                          >
                            {feature.name}
                          </td>

                          {planKeys.map((key) => (
                            <td
                              key={key}
                              className={
                                key === "pro"
                                  ? proCell(
                                      isVeryLast
                                        ? "border-b-2 border-b-primary rounded-b-xl"
                                        : "border-b border-b-border",
                                    )
                                  : regularCell(
                                      !isVeryLast
                                        ? "border-b border-border"
                                        : "",
                                    )
                              }
                            >
                              <Cell
                                value={feature[key]}
                                isProColumn={key === "pro"}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
