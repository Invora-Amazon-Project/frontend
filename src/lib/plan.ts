import type { CardVariant, ButtonVariant } from "@/types";

export interface Plan {
  name: string;
  pricing: {
    monthly: string;
    annualMonthly: string;
    annualTotal: string;
  };
  seats?: string;
  description: string;
  features: string[];
  cta: string;
  note?: string;
  variant: CardVariant;
  buttonVariant: ButtonVariant;
}

export const plans: Plan[] = [
  {
    name: "Start",
    pricing: {
      monthly: "$29",
      annualMonthly: "$24",
      annualTotal: "$288",
    },
    description:
      "Your first step into product sourcing. Simple, focused, and in control.",
    features: [
      "Basic product search: ASIN, product name, EAN/barcode",
      "Core profit, ROI & margin calculator",
      "Basic sales potential indicator",
      "Product saving & simple tracking list",
      "Basic filters: price, profit, category",
      "Simple manual order list",
      "Single user",
      "Basic support",
    ],
    cta: "Start 7-day free trial",
    note: "No credit card required",
    variant: "default",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    pricing: {
      monthly: "$79",
      annualMonthly: "$65",
      annualTotal: "$780",
    },
    description:
      "Find the winning product. See the risks. Place the order. One screen.",
    features: [
      "Everything in Start",
      "Advanced profit analysis: FBA fees, shipping, VAT & additional costs",
      "Break-even price & maximum buy price suggestion",
      "Buy Box, competition & seller density analysis",
      "Risk alerts: IP claims, brand restrictions, hazmat & oversize flags",
      "Order quantity recommendation & supplier notes",
      "Advanced filters, tags & Excel/CSV export",
      "Priority support",
    ],
    cta: "Start 14-day free trial",
    note: "Try free for 14 days. No commitment",
    variant: "featured",
    buttonVariant: "primary",
  },
  {
    name: "Team",
    pricing: {
      monthly: "$179",
      annualMonthly: "$149",
      annualTotal: "$1,788",
    },
    seats: "3 seats included · +$25/seat",
    description:
      "From product idea to purchase order. A shared workflow your whole team owns.",
    features: [
      "Everything in Pro",
      "3 seats included, additional users at $25/seat/mo",
      "Role & permission management: admin, researcher, approver",
      "Shared product pool & team comments",
      "Product approval workflow: new, under review, approved, ordered",
      "Task assignment, purchase list & PO generation",
      "Supplier management & team performance dashboard",
      "Onboarding, priority support & integration assistance",
    ],
    cta: "Book a Demo",
    note: "Includes onboarding & setup demo",
    variant: "default",
    buttonVariant: "outline",
  },
];
