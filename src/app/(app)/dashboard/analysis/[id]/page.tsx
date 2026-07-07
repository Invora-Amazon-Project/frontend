"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ScoreBadge from "@/components/dashboard/ScoreBadge";
import TagBadge from "@/components/dashboard/TagBadge";
import type { AnalyzedProduct, ProductSnapshot } from "@/types";

// TODO: Replace with real API call — GET /products/:id

const MOCK_PRODUCT: AnalyzedProduct = {
  id: "p1",
  supplierTitle: "Silicone Kitchen Tongs Set 2-Pack",
  amazonTitle: "OXO Good Grips 2-Piece Silicone Head Tong Set",
  asin: "B08XK3LMND",
  upc: "719812057476",
  ean: "0719812057476",
  brand: "OXO",
  category: "Kitchen & Dining",
  matchMethod: "upc",
  matchConfidence: "high",
  supplierPrice: 4.20,
  landedCost: 5.80,
  shipping: 0.90,
  customs: 0.50,
  tax: 0.20,
  currency: "USD",
  currentPrice: 18.99,
  buyBoxPrice: 17.49,
  fbaSellerCount: 3,
  fbmSellerCount: 1,
  amazonActive: false,
  netProfit: 7.34,
  roi: 40,
  margin: 28,
  breakEvenPrice: 10.15,
  recommendedSalePrice: 17.49,
  monthlySales: 412,
  monthlyRevenue: 7201,
  rating: 4.7,
  reviewCount: 1832,
  variationCount: 2,
  score: 85,
  scoreLabel: "strong_opportunity",
  tags: ["high_roi", "low_competition", "amazon_active"],
  isWatchlisted: true,
  notes: "Strong performer in Q3. Check reorder timing.",
  lastAnalysisDate: "2026-07-06",
  importId: "i1",
};

const MOCK_SNAPSHOTS: ProductSnapshot[] = [
  { asin: "B08XK3LMND", date: "2026-07-06", amazonPrice: 0, buyBoxPrice: 17.49, roi: 40, margin: 28, fbaSellerCount: 3, fbmSellerCount: 1, amazonActive: false, userStock: 6, marginLaneScore: 85 },
  { asin: "B08XK3LMND", date: "2026-07-05", amazonPrice: 18.99, buyBoxPrice: 18.99, roi: 35, margin: 24, fbaSellerCount: 4, fbmSellerCount: 1, amazonActive: true, userStock: 6, marginLaneScore: 72 },
  { asin: "B08XK3LMND", date: "2026-07-03", amazonPrice: 18.99, buyBoxPrice: 18.49, roi: 37, margin: 25, fbaSellerCount: 5, fbmSellerCount: 2, amazonActive: true, userStock: 14, marginLaneScore: 68 },
  { asin: "B08XK3LMND", date: "2026-06-28", amazonPrice: 18.99, buyBoxPrice: 17.99, roi: 38, margin: 26, fbaSellerCount: 4, fbmSellerCount: 1, amazonActive: true, userStock: 22, marginLaneScore: 71 },
];

const SCORE_CRITERIA = [
  { label: "ROI", points: 22, max: 25 },
  { label: "Margin", points: 18, max: 25 },
  { label: "Competition", points: 20, max: 20 },
  { label: "Demand", points: 15, max: 18 },
  { label: "Amazon Risk", points: 10, max: 12 },
];

const SCORE_LABEL_DISPLAY: Record<AnalyzedProduct["scoreLabel"], string> = {
  strong_opportunity: "Strong Opportunity",
  review_carefully: "Review Carefully",
  risky: "Risky",
  avoid: "Avoid",
};

const MATCH_METHOD_DISPLAY: Record<AnalyzedProduct["matchMethod"], string> = {
  upc: "UPC",
  ean: "EAN",
  asin: "ASIN",
  brand_title: "Brand + Title",
  model_number: "Model Number",
  manual: "Manual",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={rating >= s ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={rating >= s ? "text-peach" : "text-muted"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-body text-sm font-medium ml-1">{rating}</span>
    </span>
  );
}

function LabelValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted text-xs mb-0.5">{label}</p>
      <div className="text-body text-sm font-medium">{children}</div>
    </div>
  );
}

export default function ProductDetailPage() {
  const p = MOCK_PRODUCT;

  const FBA_FEE = 3.15;
  const [scenarioPrice, setScenarioPrice] = useState(p.buyBoxPrice);
  const [scenarioCost, setScenarioCost] = useState(p.landedCost);
  const [scenarioFba, setScenarioFba] = useState(FBA_FEE);
  const [scenarioQty, setScenarioQty] = useState(50);

  const calcProfit = scenarioPrice - scenarioCost - scenarioFba;
  const calcRoi = scenarioCost > 0 ? Math.round((calcProfit / scenarioCost) * 100) : 0;
  const calcMargin = scenarioPrice > 0 ? Math.round((calcProfit / scenarioPrice) * 100) : 0;
  const calcBreakEven = scenarioCost + scenarioFba;

  const [notes, setNotes] = useState(p.notes ?? "");
  const [isWatchlisted, setIsWatchlisted] = useState(p.isWatchlisted);

  /* Cost waterfall */
  const totalCostForBar = p.landedCost + FBA_FEE;
  const barWidth = (v: number) => `${Math.max(2, (v / p.buyBoxPrice) * 100)}%`;

  return (
    <div>
      {/* Back link */}
      <Link href="/dashboard/analysis" className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Analysis
      </Link>

      <div className="flex gap-5 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="flex-[65] min-w-0 space-y-4">

          {/* 1. Product Identity */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">Product Identity</h2>

            <div className="flex gap-4 mb-5">
              <div className="w-24 h-24 bg-section-bg rounded-xl shrink-0 flex items-center justify-center text-muted">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="min-w-0 space-y-2">
                <LabelValue label="Supplier Title">{p.supplierTitle}</LabelValue>
                <LabelValue label="Amazon Title"><span className="text-muted">{p.amazonTitle}</span></LabelValue>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <LabelValue label="ASIN">
                <span className="font-mono text-xs bg-section-bg px-1.5 py-0.5 rounded">{p.asin}</span>
              </LabelValue>
              <LabelValue label="UPC">{p.upc ?? "—"}</LabelValue>
              <LabelValue label="EAN">{p.ean ?? "—"}</LabelValue>
              <LabelValue label="Brand">{p.brand}</LabelValue>
              <LabelValue label="Category">{p.category}</LabelValue>
              <LabelValue label="Match Method">
                <span className="flex items-center gap-1.5">
                  {MATCH_METHOD_DISPLAY[p.matchMethod]}
                  <span className="bg-mint-bg text-mint text-xs px-1.5 py-0.5 rounded-full font-medium capitalize">{p.matchConfidence}</span>
                </span>
              </LabelValue>
            </div>
          </div>

          {/* 2. Profitability */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">Profitability Breakdown</h2>

            {/* Waterfall bar */}
            <div className="mb-2">
              <div className="flex h-7 rounded-lg overflow-hidden gap-px">
                <div style={{ width: barWidth(p.supplierPrice) }} className="bg-section-bg flex items-center justify-center" title={`Unit Cost $${p.supplierPrice}`} />
                <div style={{ width: barWidth(p.shipping) }} className="bg-border flex items-center justify-center" title={`Shipping $${p.shipping}`} />
                <div style={{ width: barWidth(p.customs) }} className="bg-muted/20 flex items-center justify-center" title={`Customs $${p.customs}`} />
                <div style={{ width: barWidth(p.tax) }} className="bg-placeholder/30 flex items-center justify-center" title={`Tax $${p.tax}`} />
                <div style={{ width: barWidth(FBA_FEE) }} className="bg-primary-light flex items-center justify-center" title={`FBA Fee $${FBA_FEE}`} />
                <div style={{ width: barWidth(p.netProfit) }} className="bg-mint-bg flex items-center justify-center" title={`Net Profit $${p.netProfit.toFixed(2)}`} />
              </div>
              <div className="flex gap-3 mt-2 flex-wrap">
                {[
                  { label: "Unit Cost", val: `$${p.supplierPrice}`, color: "bg-section-bg" },
                  { label: "Shipping", val: `$${p.shipping}`, color: "bg-border" },
                  { label: "Customs", val: `$${p.customs}`, color: "bg-muted/20" },
                  { label: "Tax", val: `$${p.tax}`, color: "bg-placeholder/30" },
                  { label: "FBA Fee", val: `$${FBA_FEE}`, color: "bg-primary-light" },
                  { label: "Net Profit", val: `$${p.netProfit.toFixed(2)}`, color: "bg-mint-bg" },
                ].map(({ label, val, color }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${color} border border-border`} />
                    {label}: <span className="text-body font-medium">{val}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border mt-2">
              <div>
                <p className="text-muted text-xs mb-0.5">Net Profit</p>
                <p className="text-mint font-bold text-xl">${p.netProfit.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted text-xs mb-0.5">ROI</p>
                <p className="text-mint font-bold text-xl">+{p.roi}%</p>
              </div>
              <div>
                <p className="text-muted text-xs mb-0.5">Margin</p>
                <p className="text-mint font-bold text-xl">+{p.margin}%</p>
              </div>
              <LabelValue label="Break-even Price">${p.breakEvenPrice.toFixed(2)}</LabelValue>
              <LabelValue label="Buy Box Price">${p.buyBoxPrice.toFixed(2)}</LabelValue>
              <LabelValue label="Recommended Sale Price">${p.recommendedSalePrice.toFixed(2)}</LabelValue>
            </div>
          </div>

          {/* 3. Scenario Calculator */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-heading font-semibold text-base">Scenario Calculator</h2>
                <p className="text-muted text-xs mt-0.5">Adjust values to test different scenarios</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setScenarioPrice(p.buyBoxPrice); setScenarioCost(p.landedCost); setScenarioFba(FBA_FEE); setScenarioQty(50); }}>
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: "Sale Price ($)", value: scenarioPrice, onChange: setScenarioPrice },
                { label: "Unit Cost ($)", value: scenarioCost, onChange: setScenarioCost },
                { label: "FBA Fee ($)", value: scenarioFba, onChange: setScenarioFba },
                { label: "Quantity", value: scenarioQty, onChange: setScenarioQty },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-body mb-1.5">{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm text-body bg-page-bg outline-none focus:border-primary"
                    step="0.01"
                    min="0"
                  />
                </div>
              ))}
            </div>

            <div className="bg-section-bg rounded-xl p-4 grid grid-cols-4 gap-4">
              {[
                { label: "Net Profit", value: `$${calcProfit.toFixed(2)}`, positive: calcProfit >= 0 },
                { label: "ROI", value: `${calcRoi >= 0 ? "+" : ""}${calcRoi}%`, positive: calcRoi >= 0 },
                { label: "Margin", value: `${calcMargin >= 0 ? "+" : ""}${calcMargin}%`, positive: calcMargin >= 0 },
                { label: "Break-even", value: `$${calcBreakEven.toFixed(2)}`, positive: true },
              ].map(({ label, value, positive }) => (
                <div key={label} className="text-center">
                  <p className="text-muted text-xs mb-1">{label}</p>
                  <p className={`font-bold text-base ${positive ? "text-mint" : "text-rose"}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Demand & Trend */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">Demand &amp; Trend</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-section-bg rounded-xl p-4 text-center">
                <p className="text-heading font-bold text-xl">{p.monthlySales.toLocaleString()}</p>
                <p className="text-muted text-xs mt-1">Monthly Sales</p>
              </div>
              <div className="bg-section-bg rounded-xl p-4 text-center">
                <p className="text-heading font-bold text-xl">${(p.monthlyRevenue / 1000).toFixed(1)}k</p>
                <p className="text-muted text-xs mt-1">Monthly Revenue</p>
              </div>
              <div className="bg-section-bg rounded-xl p-4 text-center">
                <p className="text-heading font-bold text-xl">~380</p>
                <p className="text-muted text-xs mt-1">3-mo Avg Sales</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <LabelValue label="FBA Sellers">{p.fbaSellerCount}</LabelValue>
              <LabelValue label="FBM Sellers">{p.fbmSellerCount}</LabelValue>
              <LabelValue label="Rating"><StarRating rating={p.rating} /></LabelValue>
              <LabelValue label="Reviews">{p.reviewCount.toLocaleString()}</LabelValue>
            </div>
          </div>

          {/* 5. Notes & Tags */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">User Notes &amp; Tags</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this product..."
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-body bg-page-bg outline-none focus:border-primary placeholder:text-placeholder resize-none"
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {p.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
              <select className="text-xs border border-border rounded-full px-2 py-0.5 bg-card-bg text-muted outline-none focus:border-primary cursor-pointer">
                <option value="">+ Add tag</option>
                <option value="high_roi">High ROI</option>
                <option value="watchlist_recommended">Watchlist Recommended</option>
                <option value="re_analyze_needed">Re-analyze Needed</option>
              </select>
            </div>
            <div className="mt-4">
              <Button variant="primary" size="sm">Save</Button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-[35] min-w-0 space-y-4">

          {/* MarginLane Score */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">MarginLane Score</h2>
            <div className="flex justify-center mb-4">
              <ScoreBadge score={p.score} label={SCORE_LABEL_DISPLAY[p.scoreLabel]} />
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              {SCORE_CRITERIA.map(({ label, points, max }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body text-xs">{label}</span>
                    <span className="text-muted text-xs font-medium">{points}/{max}</span>
                  </div>
                  <div className="bg-section-bg h-1.5 rounded-full">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${(points / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Summary */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-3">Decision Summary</h2>
            <p className="text-primary font-semibold text-base mb-3">{SCORE_LABEL_DISPLAY[p.scoreLabel]}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
            </div>
            {p.amazonActive && (
              <div className="bg-rose-bg border border-rose/30 rounded-lg p-3 flex gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-rose text-xs">Amazon is actively selling this product</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">Actions</h2>
            <Button
              variant={isWatchlisted ? "outline" : "primary"}
              size="md"
              className="w-full"
              onClick={() => setIsWatchlisted((v) => !v)}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
              </span>
            </Button>
            <Button variant="outline" size="md" className="w-full mt-2">
              <span className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add to Order
              </span>
            </Button>
            <div className="mt-2">
              <Button variant="ghost" size="sm" className="w-full">Re-analyze</Button>
              <p className="text-muted text-xs text-center mt-1">Uses 1 credit</p>
            </div>
          </div>

          {/* Price History Snapshots */}
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-base mb-4">Price History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Amazon", "Buy Box", "ROI", "Score"].map((h) => (
                      <th key={h} className="text-left text-muted font-semibold pb-2 pr-3 last:pr-0 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SNAPSHOTS.map((s) => (
                    <tr key={s.date} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 text-body whitespace-nowrap">{s.date}</td>
                      <td className="py-2 pr-3 text-body">
                        {s.amazonActive ? `$${s.amazonPrice.toFixed(2)}` : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2 pr-3 text-body">${s.buyBoxPrice.toFixed(2)}</td>
                      <td className={`py-2 pr-3 font-semibold ${s.roi >= 0 ? "text-mint" : "text-rose"}`}>
                        {s.roi >= 0 ? "+" : ""}{s.roi}%
                      </td>
                      <td className="py-2 text-body">{s.marginLaneScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
