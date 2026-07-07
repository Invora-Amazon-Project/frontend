"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ScoreBadge from "@/components/dashboard/ScoreBadge";
import TagBadge from "@/components/dashboard/TagBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import type { AnalyzedProduct, ScoreLabel, MatchConfidence } from "@/types";

// TODO: Replace with real API call — GET /analysis/products?importId=...

const MOCK_PRODUCTS: AnalyzedProduct[] = [
  {
    id: "p1", supplierTitle: "Silicone Kitchen Tongs Set 2-Pack", amazonTitle: "OXO Good Grips 2-Piece Silicone Head Tong Set",
    asin: "B08XK3LMND", brand: "OXO", category: "Kitchen", matchMethod: "upc", matchConfidence: "high",
    supplierPrice: 4.20, landedCost: 5.80, shipping: 0.90, customs: 0.50, tax: 0.20, currency: "USD",
    currentPrice: 18.99, buyBoxPrice: 17.49, fbaSellerCount: 3, fbmSellerCount: 1, amazonActive: false,
    netProfit: 7.34, roi: 40, margin: 28, breakEvenPrice: 10.15, recommendedSalePrice: 17.49,
    monthlySales: 412, monthlyRevenue: 7201, rating: 4.7, reviewCount: 1832, variationCount: 2,
    score: 85, scoreLabel: "strong_opportunity", tags: ["high_roi", "low_competition", "amazon_active"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p2", supplierTitle: "Bamboo Cutting Board Large 18x12", amazonTitle: "Royal Craft Wood Organic Bamboo Cutting Board",
    asin: "B07THGP5WK", brand: "Royal Craft", category: "Kitchen", matchMethod: "brand_title", matchConfidence: "medium",
    supplierPrice: 7.50, landedCost: 10.20, shipping: 1.80, customs: 0.60, tax: 0.30, currency: "USD",
    currentPrice: 27.99, buyBoxPrice: 26.49, fbaSellerCount: 5, fbmSellerCount: 2, amazonActive: false,
    netProfit: 10.44, roi: 54, margin: 39, breakEvenPrice: 16.05, recommendedSalePrice: 26.49,
    monthlySales: 289, monthlyRevenue: 7656, rating: 4.6, reviewCount: 3104, variationCount: 1,
    score: 91, scoreLabel: "strong_opportunity", tags: ["high_roi", "strong_margin", "watchlist_recommended"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p3", supplierTitle: "Stainless Steel Mixing Bowls 5-Pack", amazonTitle: "Cuisinart CTG-00-5MBR 5-Piece Mixing Bowl Set",
    asin: "B09NQZRVKP", brand: "Cuisinart", category: "Kitchen", matchMethod: "upc", matchConfidence: "high",
    supplierPrice: 9.80, landedCost: 13.10, shipping: 2.20, customs: 0.80, tax: 0.30, currency: "USD",
    currentPrice: 24.99, buyBoxPrice: 22.99, fbaSellerCount: 9, fbmSellerCount: 4, amazonActive: true,
    netProfit: 4.64, roi: 19, margin: 13, breakEvenPrice: 18.46, recommendedSalePrice: 22.99,
    monthlySales: 637, monthlyRevenue: 14640, rating: 4.4, reviewCount: 5672, variationCount: 5,
    score: 62, scoreLabel: "review_carefully", tags: ["low_sales_volume", "price_drop_risk"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p4", supplierTitle: "Cast Iron Skillet Pre-Seasoned 10 inch", amazonTitle: "Lodge L8SK3 Pre-Seasoned Cast-Iron Skillet 10.25 Inch",
    asin: "B00006JSUA", brand: "Lodge", category: "Cookware", matchMethod: "upc", matchConfidence: "high",
    supplierPrice: 14.00, landedCost: 18.50, shipping: 3.50, customs: 0.70, tax: 0.30, currency: "USD",
    currentPrice: 34.90, buyBoxPrice: 33.40, fbaSellerCount: 12, fbmSellerCount: 8, amazonActive: true,
    netProfit: 7.65, roi: 41, margin: 23, breakEvenPrice: 25.85, recommendedSalePrice: 33.40,
    monthlySales: 1840, monthlyRevenue: 61456, rating: 4.8, reviewCount: 28941, variationCount: 8,
    score: 74, scoreLabel: "review_carefully", tags: ["good_reorder_candidate", "strong_margin", "amazon_active"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p5", supplierTitle: "Collapsible Silicone Water Bottle 750ml", amazonTitle: "Nomader Collapsible Sports Water Bottle 22oz",
    asin: "B08ZTLMKPD", brand: "Nomader", category: "Sports", matchMethod: "ean", matchConfidence: "high",
    supplierPrice: 3.90, landedCost: 5.40, shipping: 0.80, customs: 0.40, tax: 0.20, currency: "USD",
    currentPrice: 14.95, buyBoxPrice: 13.95, fbaSellerCount: 2, fbmSellerCount: 0, amazonActive: false,
    netProfit: 5.93, roi: 51, margin: 39, breakEvenPrice: 8.02, recommendedSalePrice: 13.95,
    monthlySales: 318, monthlyRevenue: 4436, rating: 4.5, reviewCount: 927, variationCount: 4,
    score: 88, scoreLabel: "strong_opportunity", tags: ["high_roi", "low_competition", "strong_margin"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p6", supplierTitle: "Mesh Laundry Bags Set of 6", amazonTitle: "BAGAIL 6 Set Mesh Laundry Bags",
    asin: "B07QQMVWWG", brand: "BAGAIL", category: "Laundry", matchMethod: "brand_title", matchConfidence: "medium",
    supplierPrice: 2.10, landedCost: 3.20, shipping: 0.70, customs: 0.20, tax: 0.20, currency: "USD",
    currentPrice: 8.99, buyBoxPrice: 8.49, fbaSellerCount: 18, fbmSellerCount: 6, amazonActive: true,
    netProfit: 1.84, roi: -4, margin: -6, breakEvenPrice: 8.70, recommendedSalePrice: 8.49,
    monthlySales: 2104, monthlyRevenue: 17862, rating: 4.3, reviewCount: 12540, variationCount: 3,
    score: 31, scoreLabel: "avoid", tags: ["avoid", "price_drop_risk", "low_sales_volume"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p7", supplierTitle: "Silicone Baking Mat Set of 3", amazonTitle: "AmazonBasics Silicone Baking Mat Sheet Set of 3",
    asin: "B073HPWCTS", brand: "Amazon Basics", category: "Baking", matchMethod: "upc", matchConfidence: "high",
    supplierPrice: 5.60, landedCost: 7.80, shipping: 1.20, customs: 0.60, tax: 0.40, currency: "USD",
    currentPrice: 18.49, buyBoxPrice: 17.99, fbaSellerCount: 7, fbmSellerCount: 3, amazonActive: true,
    netProfit: 4.44, roi: 23, margin: 16, breakEvenPrice: 13.55, recommendedSalePrice: 17.99,
    monthlySales: 541, monthlyRevenue: 9737, rating: 4.6, reviewCount: 7823, variationCount: 2,
    score: 58, scoreLabel: "risky", tags: ["amazon_active", "re_analyze_needed"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p8", supplierTitle: "Wooden Spoon Set 6-Piece", amazonTitle: "Riveira Wooden Spoon Set 6-Piece Natural Teak",
    asin: "B07KF16JZL", brand: "Riveira", category: "Kitchen", matchMethod: "brand_title", matchConfidence: "low",
    supplierPrice: 3.40, landedCost: 4.90, shipping: 0.90, customs: 0.30, tax: 0.30, currency: "USD",
    currentPrice: 13.99, buyBoxPrice: 12.49, fbaSellerCount: 4, fbmSellerCount: 2, amazonActive: false,
    netProfit: 4.24, roi: 44, margin: 30, breakEvenPrice: 8.26, recommendedSalePrice: 12.49,
    monthlySales: 183, monthlyRevenue: 2286, rating: 4.2, reviewCount: 441, variationCount: 1,
    score: 67, scoreLabel: "review_carefully", tags: ["strong_margin", "watchlist_recommended"],
    isWatchlisted: true, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p9", supplierTitle: "Stainless Steel Garlic Press", amazonTitle: "Zulay Premium Garlic Press Stainless Steel",
    asin: "B01LXZUB5P", brand: "Zulay", category: "Kitchen", matchMethod: "upc", matchConfidence: "high",
    supplierPrice: 2.80, landedCost: 4.10, shipping: 0.70, customs: 0.40, tax: 0.20, currency: "USD",
    currentPrice: 11.99, buyBoxPrice: 11.49, fbaSellerCount: 22, fbmSellerCount: 9, amazonActive: true,
    netProfit: -0.61, roi: -15, margin: -11, breakEvenPrice: 12.10, recommendedSalePrice: 11.49,
    monthlySales: 3241, monthlyRevenue: 37252, rating: 4.5, reviewCount: 18320, variationCount: 3,
    score: 22, scoreLabel: "avoid", tags: ["avoid", "amazon_active", "price_drop_risk"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
  {
    id: "p10", supplierTitle: "Vegetable Spiralizer 5-Blade", amazonTitle: "Brieftons 5-Blade Spiralizer Heavy Duty Vegetable Slicer",
    asin: "B00GRIR87U", brand: "Brieftons", category: "Kitchen", matchMethod: "ean", matchConfidence: "high",
    supplierPrice: 8.20, landedCost: 11.40, shipping: 1.80, customs: 0.90, tax: 0.50, currency: "USD",
    currentPrice: 29.99, buyBoxPrice: 28.49, fbaSellerCount: 6, fbmSellerCount: 2, amazonActive: false,
    netProfit: 10.34, roi: 47, margin: 32, breakEvenPrice: 18.15, recommendedSalePrice: 28.49,
    monthlySales: 267, monthlyRevenue: 7607, rating: 4.4, reviewCount: 2914, variationCount: 2,
    score: 79, scoreLabel: "review_carefully", tags: ["high_roi", "good_reorder_candidate"],
    isWatchlisted: false, lastAnalysisDate: "2026-07-06", importId: "i1",
  },
];

const SCORE_LABEL_OPTIONS: { value: ScoreLabel | "all"; label: string }[] = [
  { value: "all", label: "All Scores" },
  { value: "strong_opportunity", label: "Strong Opportunity" },
  { value: "review_carefully", label: "Review Carefully" },
  { value: "risky", label: "Risky" },
  { value: "avoid", label: "Avoid" },
];

const SCORE_LABEL_DISPLAY: Record<ScoreLabel, string> = {
  strong_opportunity: "Strong Opportunity",
  review_carefully: "Review Carefully",
  risky: "Risky",
  avoid: "Avoid",
};

const CONFIDENCE_STYLES: Record<MatchConfidence, string> = {
  high: "bg-mint-bg text-mint",
  medium: "bg-peach-bg text-peach",
  low: "bg-rose-bg text-rose",
  unmatched: "bg-rose-bg text-rose",
};

export default function AnalysisPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreLabel | "all">("all");
  const [watchlistedOnly, setWatchlistedOnly] = useState(false);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const TOTAL = 247;

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.supplierTitle.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchScore = scoreFilter === "all" || p.scoreLabel === scoreFilter;
    const matchWatchlist = !watchlistedOnly || p.isWatchlisted;
    return matchSearch && matchScore && matchWatchlist;
  });

  const toggleWatchlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isWatchlisted: !p.isWatchlisted } : p));
  };

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (scoreFilter !== "all") activeFilters.push({ label: `Score: ${SCORE_LABEL_DISPLAY[scoreFilter]}`, clear: () => setScoreFilter("all") });
  if (watchlistedOnly) activeFilters.push({ label: "Watchlisted only", clear: () => setWatchlistedOnly(false) });

  return (
    <div>
      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="text-muted text-sm">{TOTAL} products</p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ASIN, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-8 pr-4 py-2 text-sm text-body bg-card-bg border border-border rounded-lg outline-none focus:border-primary placeholder:text-placeholder"
            />
          </div>

          {/* Score filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as ScoreLabel | "all")}
            className="px-3 py-2 text-sm text-body bg-card-bg border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
          >
            {SCORE_LABEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Watchlist toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={watchlistedOnly}
              onChange={(e) => setWatchlistedOnly(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-body text-sm">Watchlisted only</span>
          </label>

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

          <Button variant="ghost" size="sm">Re-analyze all</Button>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {activeFilters.map((f) => (
            <span key={f.label} className="inline-flex items-center gap-1.5 bg-primary-light text-primary text-xs rounded-full px-3 py-1">
              {f.label}
              <button onClick={f.clear} className="hover:opacity-70 leading-none cursor-pointer">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
          title="No products match your filters"
          description="Try adjusting your search or clearing the active filters."
          actionLabel="Clear filters"
          actionHref="/dashboard/analysis"
        />
      ) : (
        <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-section-bg">
                  {["Product", "ASIN", "Match", "Score", "Cost", "Sale Price", "ROI", "Margin", "Mo. Sales", "Tags", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/dashboard/analysis/${p.id}`)}
                    className={`border-b border-border last:border-0 cursor-pointer hover:bg-section-bg/60 transition-colors ${i % 2 === 0 ? "" : "bg-section-bg/20"}`}
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-section-bg rounded-lg shrink-0 flex items-center justify-center text-muted">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-body text-sm font-medium truncate max-w-[180px]">{p.supplierTitle}</p>
                          <p className="text-muted text-xs truncate max-w-[180px]">{p.amazonTitle}</p>
                        </div>
                      </div>
                    </td>

                    {/* ASIN */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs bg-section-bg px-1.5 py-0.5 rounded">{p.asin}</span>
                    </td>

                    {/* Match */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONFIDENCE_STYLES[p.matchConfidence]}`}>
                        {p.matchConfidence === "unmatched" ? (
                          <span className="line-through">Unmatched</span>
                        ) : (
                          p.matchConfidence.charAt(0).toUpperCase() + p.matchConfidence.slice(1)
                        )}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ScoreBadge score={p.score} label={SCORE_LABEL_DISPLAY[p.scoreLabel]} />
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-body text-sm">${p.landedCost.toFixed(2)}</span>
                    </td>

                    {/* Sale Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-body text-sm">${p.buyBoxPrice.toFixed(2)}</span>
                    </td>

                    {/* ROI */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${p.roi >= 0 ? "text-mint" : "text-rose"}`}>
                        {p.roi >= 0 ? "+" : ""}{p.roi}%
                      </span>
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${p.margin >= 0 ? "text-mint" : "text-rose"}`}>
                        {p.margin >= 0 ? "+" : ""}{p.margin}%
                      </span>
                    </td>

                    {/* Monthly Sales */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-body text-sm">{p.monthlySales.toLocaleString()}</span>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap min-w-[120px]">
                        {p.tags.slice(0, 2).map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                        {p.tags.length > 2 && (
                          <span className="text-xs text-muted">+{p.tags.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          title="View details"
                          onClick={() => router.push(`/dashboard/analysis/${p.id}`)}
                          className="text-muted hover:text-primary transition-colors cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        <button
                          title={p.isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                          onClick={(e) => toggleWatchlist(e, p.id)}
                          className={`transition-colors cursor-pointer ${p.isWatchlisted ? "text-primary" : "text-muted hover:text-primary"}`}
                        >
                          {p.isWatchlisted ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          )}
                        </button>

                        <button
                          title="Add to order"
                          className="text-muted hover:text-primary transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-section-bg/40">
            <p className="text-muted text-xs">
              Showing <span className="font-medium text-body">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, TOTAL)}</span> of <span className="font-medium text-body">{TOTAL}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </Button>
              <span className="text-muted text-xs px-2">Page {page} of {Math.ceil(TOTAL / PAGE_SIZE)}</span>
              <Button variant="outline" size="sm" disabled={page * PAGE_SIZE >= TOTAL} onClick={() => setPage((p) => p + 1)}>
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
