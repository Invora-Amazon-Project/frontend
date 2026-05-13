import Link from "next/link";
import Pricing from "@/components/sections/Pricing";
import PricingComparison from "@/components/sections/PricingComparison";

export default function PricingPage() {
  return (
    <>
      <div className="bg-card-bg px-6 pt-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-heading transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10,3 5,8 10,13" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
      <Pricing />
      <PricingComparison />
    </>
  );
}
