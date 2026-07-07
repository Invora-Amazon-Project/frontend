"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ScoreBadge from "@/components/dashboard/ScoreBadge";
import TagBadge from "@/components/dashboard/TagBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import type { AnalyzedProduct } from "@/types";

// TODO: Replace with real API call — GET /watchlist

const MOCK_WATCHLIST: AnalyzedProduct[] = [
  {
    id: "p1", supplierTitle: "Silicone Kitchen Tongs Set 2-Pack", amazonTitle: "OXO Good Grips 2-Piece Silicone Head Tong Set",
    asin: "B08XK3LMND", brand: "OXO", category: "Kitchen", matchMethod: "upc", matchConfidence: "high",
    supplierPrice: 4.20, landedCost: 5.80, shipping: 0.90, customs: 0.50, tax: 0.20, currency: "USD",
    currentPrice: 18.99, buyBoxPrice: 17.49, fbaSellerCount: 3, fbmSellerCount: 1, amazonActive: false,
    netProfit: 7.34, roi: 40, margin: 28, breakEvenPrice: 10.15, recommendedSalePrice: 17.49,
    monthlySales: 412, monthlyRevenue: 7201, rating: 4.7, reviewCount: 1832, variationCount: 2,
    score: 85, scoreLabel: "strong_opportunity", tags: ["high_roi", "low_competition"],
    isWatchlisted: true, notes: "Strong Q3 performer.", lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p2", supplierTitle: "Bamboo Cutting Board Large 18x12", amazonTitle: "Royal Craft Wood Organic Bamboo Cutting Board",
    asin: "B07THGP5WK", brand: "Royal Craft", category: "Kitchen", matchMethod: "brand_title", matchConfidence: "medium",
    supplierPrice: 7.50, landedCost: 10.20, shipping: 1.80, customs: 0.60, tax: 0.30, currency: "USD",
    currentPrice: 27.99, buyBoxPrice: 26.49, fbaSellerCount: 5, fbmSellerCount: 2, amazonActive: false,
    netProfit: 10.44, roi: 54, margin: 39, breakEvenPrice: 16.05, recommendedSalePrice: 26.49,
    monthlySales: 289, monthlyRevenue: 7656, rating: 4.6, reviewCount: 3104, variationCount: 1,
    score: 91, scoreLabel: "strong_opportunity", tags: ["strong_margin", "watchlist_recommended"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-05", importId: "i1",
  },
  {
    id: "p8", supplierTitle: "Wooden Spoon Set 6-Piece", amazonTitle: "Riveira Wooden Spoon Set 6-Piece Natural Teak",
    asin: "B07KF16JZL", brand: "Riveira", category: "Kitchen", matchMethod: "brand_title", matchConfidence: "low",
    supplierPrice: 3.40, landedCost: 4.90, shipping: 0.90, customs: 0.30, tax: 0.30, currency: "USD",
    currentPrice: 13.99, buyBoxPrice: 12.49, fbaSellerCount: 4, fbmSellerCount: 2, amazonActive: false,
    netProfit: 4.24, roi: 44, margin: 30, breakEvenPrice: 8.26, recommendedSalePrice: 12.49,
    monthlySales: 183, monthlyRevenue: 2286, rating: 4.2, reviewCount: 441, variationCount: 1,
    score: 67, scoreLabel: "review_carefully", tags: ["strong_margin", "watchlist_recommended"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-04", importId: "i1",
  },
  {
    id: "p5", supplierTitle: "Collapsible Silicone Water Bottle 750ml", amazonTitle: "Nomader Collapsible Sports Water Bottle 22oz",
    asin: "B08ZTLMKPD", brand: "Nomader", category: "Sports", matchMethod: "ean", matchConfidence: "high",
    supplierPrice: 3.90, landedCost: 5.40, shipping: 0.80, customs: 0.40, tax: 0.20, currency: "USD",
    currentPrice: 14.95, buyBoxPrice: 13.95, fbaSellerCount: 2, fbmSellerCount: 0, amazonActive: false,
    netProfit: 5.93, roi: 51, margin: 39, breakEvenPrice: 8.02, recommendedSalePrice: 13.95,
    monthlySales: 318, monthlyRevenue: 4436, rating: 4.5, reviewCount: 927, variationCount: 4,
    score: 88, scoreLabel: "strong_opportunity", tags: ["high_roi", "strong_margin", "low_competition"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p10", supplierTitle: "Vegetable Spiralizer 5-Blade", amazonTitle: "Brieftons 5-Blade Spiralizer Heavy Duty Vegetable Slicer",
    asin: "B00GRIR87U", brand: "Brieftons", category: "Kitchen", matchMethod: "ean", matchConfidence: "high",
    supplierPrice: 8.20, landedCost: 11.40, shipping: 1.80, customs: 0.90, tax: 0.50, currency: "USD",
    currentPrice: 29.99, buyBoxPrice: 28.49, fbaSellerCount: 6, fbmSellerCount: 2, amazonActive: false,
    netProfit: 10.34, roi: 47, margin: 32, breakEvenPrice: 18.15, recommendedSalePrice: 28.49,
    monthlySales: 267, monthlyRevenue: 7607, rating: 4.4, reviewCount: 2914, variationCount: 2,
    score: 79, scoreLabel: "review_carefully", tags: ["high_roi", "good_reorder_candidate"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-03", importId: "i1",
  },
];

type SortKey = "roi" | "score" | "date" | "name";

function sortProducts(products: AnalyzedProduct[], key: SortKey): AnalyzedProduct[] {
  return [...products].sort((a, b) => {
    switch (key) {
      case "roi": return b.roi - a.roi;
      case "score": return b.score - a.score;
      case "date": return b.lastAnalysisDate.localeCompare(a.lastAnalysisDate);
      case "name": return a.supplierTitle.localeCompare(b.supplierTitle);
      default: return 0;
    }
  });
}

const SCORE_LABEL_DISPLAY: Record<AnalyzedProduct["scoreLabel"], string> = {
  strong_opportunity: "Strong Opportunity",
  review_carefully: "Review Carefully",
  risky: "Risky",
  avoid: "Avoid",
};

export default function WatchlistPage() {
  const [products, setProducts] = useState(MOCK_WATCHLIST);
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [targetRoi, setTargetRoi] = useState<Record<string, string>>({});

  const sorted = sortProducts(products, sortBy);

  const removeFromWatchlist = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading font-semibold text-2xl">Watchlist</h1>
            <span className="bg-primary-light text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
              {products.length} products
            </span>
          </div>
          <p className="text-muted text-sm mt-1">Products you&apos;re monitoring for the right opportunity.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2 text-sm text-body bg-card-bg border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
          >
            <option value="score">Sort by: Score</option>
            <option value="roi">Sort by: ROI</option>
            <option value="date">Sort by: Date Added</option>
            <option value="name">Sort by: Name</option>
          </select>
          <Button variant="outline" size="sm">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </span>
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          }
          title="Your watchlist is empty"
          description="Start analyzing products and bookmark the ones you want to monitor."
          actionLabel="Go to Analysis"
          actionHref="/dashboard/analysis"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((p) => (
            <div key={p.id} className="bg-card-bg border border-border rounded-xl p-4">
              <div className="flex items-start gap-4">

                {/* Image placeholder */}
                <div className="w-12 h-12 bg-section-bg rounded-lg shrink-0 flex items-center justify-center text-muted mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>

                {/* Product name + ASIN */}
                <div className="w-52 shrink-0">
                  <p className="text-body text-sm font-medium leading-snug">{p.supplierTitle}</p>
                  <span className="font-mono text-xs bg-section-bg px-1.5 py-0.5 rounded mt-1 inline-block">{p.asin}</span>
                </div>

                {/* Key metrics */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="text-center">
                    <p className={`font-bold text-xl ${p.roi >= 0 ? "text-mint" : "text-rose"}`}>
                      {p.roi >= 0 ? "+" : ""}{p.roi}%
                    </p>
                    <p className="text-muted text-xs mt-0.5">ROI</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-xl ${p.margin >= 0 ? "text-mint" : "text-rose"}`}>
                      {p.margin >= 0 ? "+" : ""}{p.margin}%
                    </p>
                    <p className="text-muted text-xs mt-0.5">Margin</p>
                  </div>
                  <ScoreBadge score={p.score} label={SCORE_LABEL_DISPLAY[p.scoreLabel]} />
                  <div className="text-center">
                    <p className="text-heading font-bold text-xl">{p.monthlySales.toLocaleString()}</p>
                    <p className="text-muted text-xs mt-0.5">Mo. Sales</p>
                  </div>
                </div>

                {/* Target ROI + actions */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Target %"
                      value={targetRoi[p.id] ?? ""}
                      onChange={(e) => setTargetRoi((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-20 border border-border rounded px-2 py-1 text-sm text-body bg-page-bg outline-none focus:border-primary placeholder:text-placeholder"
                      min="0"
                      max="999"
                    />
                    <button className="text-primary text-xs font-medium hover:underline">Set</button>
                  </div>
                  {targetRoi[p.id] && (
                    <p className="text-muted text-xs">Alert when ROI reaches {targetRoi[p.id]}%</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <Link href={`/dashboard/analysis/${p.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Button variant="ghost" size="sm">Add to Order</Button>
                    <button
                      onClick={() => removeFromWatchlist(p.id)}
                      title="Remove from watchlist"
                      className="text-muted hover:text-rose transition-colors p-1 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <p className="text-muted text-xs">Last analyzed: {p.lastAnalysisDate}</p>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {p.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
