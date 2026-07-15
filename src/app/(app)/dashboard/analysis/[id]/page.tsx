"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

// TODO: Replace with real API call — GET /products/:id

const PRODUCT = {
  supplierTitle: "Oral-B Pro 3 Electric Toothbrush",
  amazonTitle: "Oral-B Pro 3 3000 CrossAction Electric Toothbrush, White",
  asin: "B08X123456",
  ean: "4210201432521",
  brand: "Oral-B",
  category: "Health & Personal Care > Oral Care",
  matchScore: 96,
  score: 82,
};

const SCORE_TREND = [58, 63, 61, 70, 76, 82];

const AMAZON_METRICS = {
  bsr: 1247,
  bsrTrend30d: 18,
  buyBoxPrice: 49.9,
  lowestFbaPrice: 47.5,
  amazonActive: true,
  fbaSellerCount: 6,
  fbmSellerCount: 2,
  reviewCount: 8432,
  rating: 4.6,
};

const RISKS: { label: string; status: string; level: "green" | "yellow" | "red" }[] = [
  { label: "Sales Restriction", status: "No Risk", level: "green" },
  { label: "IP / Brand Risk", status: "Medium Risk", level: "yellow" },
  { label: "Amazon Active?", status: "Yes", level: "red" },
  { label: "Hazmat Risk", status: "No Risk", level: "green" },
  { label: "Oversize Risk", status: "Medium Risk", level: "yellow" },
  { label: "Price Instability", status: "Good", level: "green" },
  { label: "Competition Level", status: "Medium", level: "yellow" },
  { label: "Variation Risk", status: "Medium", level: "yellow" },
];

const VARIATIONS = [
  { name: "Pro 3 Black", asin: "B08X123456", price: 49.9, bsr: 1247, rating: 4.6 },
  { name: "Pro 3 White", asin: "B08X123457", price: 49.9, bsr: 1890, rating: 4.5 },
  { name: "Pro 3 Pink", asin: "B08X123458", price: 49.9, bsr: 2245, rating: 4.4 },
  { name: "Pro 3 Blue", asin: "B08X123459", price: 49.9, bsr: 2890, rating: 4.4 },
];

const COMPETITORS = [
  { seller: "Amazon.de", type: "FBA", price: 49.9, shipping: 0, stock: "In Stock", rating: null as number | null },
  { seller: "MediaMarkt", type: "FBA", price: 48.5, shipping: 0, stock: "In Stock", rating: 4.7 },
  { seller: "Otto", type: "FBA", price: 49.99, shipping: 0, stock: "In Stock", rating: 4.6 },
  { seller: "Elektronik-Star", type: "FBM", price: 47.9, shipping: 2.99, stock: "In Stock", rating: 4.3 },
];

const REVIEWS = [
  {
    rating: 5,
    name: "Markus B.",
    date: "28.05.2024",
    title: "Great value electric toothbrush",
    body: "Cleans very well and the battery lasts almost two weeks. Would recommend to anyone switching from a manual brush.",
  },
  {
    rating: 4,
    name: "Sophie T.",
    date: "14.05.2024",
    title: "Good, but pressure sensor is sensitive",
    body: "Works as advertised, the pressure sensor lights up quite often even with light brushing. Otherwise satisfied.",
  },
  {
    rating: 5,
    name: "Jonas K.",
    date: "02.05.2024",
    title: "Exactly what I expected",
    body: "Arrived quickly, easy to charge, and the brush heads are widely available. No complaints so far.",
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 62 },
  { stars: 4, pct: 21 },
  { stars: 3, pct: 9 },
  { stars: 2, pct: 4 },
  { stars: 1, pct: 4 },
];

const NOTES = [
  {
    text: "Minimum order with supplier is 100 units. Shipping 10-15 days. Product is popular, should allocate ad budget. June-December high demand period.",
    author: "Ahmet Yilmaz",
    date: "10.06.2024 14:30",
  },
];

const MONTH_LABELS = ["Jun'23", "Jul'23", "Aug'23", "Sep'23", "Oct'23", "Nov'23", "Dec'23", "Jan'24", "Feb'24", "Mar'24", "Apr'24", "May'24", "Jun'24"];

const PRICE_SERIES = {
  buyBox: [42, 44, 43, 45, 47, 46, 48, 45, 44, 46, 48, 49, 49.9],
  amazon: [45, 45, 46, 46, 48, 47, 49, 47, 46, 47, 49, 50, 50],
  fba: [43, 44, 44, 45, 46, 46, 47, 45, 44, 45, 47, 48, 47.5],
  fbm: [40, 41, 42, 43, 44, 43, 45, 42, 41, 43, 44, 45, 46],
  rank: [1900, 1800, 2100, 1700, 1500, 1650, 1400, 1600, 1750, 1450, 1300, 1200, 1247],
};

const BSR_TREND = [2400, 2200, 2450, 2000, 1850, 1950, 1600, 1750, 1900, 1500, 1350, 1300, 1247];

const TABS = [
  "Overview",
  "Profit Calculation",
  "Price History",
  "Sales & Trend",
  "Variations",
  "Risk Analysis",
  "Competitors",
  "Reviews",
  "Notes",
] as const;

type Tab = (typeof TABS)[number];

const TIME_RANGES = ["7 Days", "1 Month", "3 Months", "6 Months", "1 Year", "All"] as const;

const RISK_DOT: Record<"green" | "yellow" | "red", string> = {
  green: "bg-mint",
  yellow: "bg-peach",
  red: "bg-rose",
};

const RISK_BADGE: Record<"green" | "yellow" | "red", string> = {
  green: "bg-mint-bg text-mint",
  yellow: "bg-peach-bg text-peach",
  red: "bg-rose text-white",
};

function scoreLabelInfo(score: number) {
  if (score >= 80) return { text: "Strong Opportunity", cls: "bg-mint-bg text-mint" };
  if (score >= 60) return { text: "Review Carefully", cls: "bg-primary-light text-primary" };
  if (score >= 40) return { text: "Risky", cls: "bg-peach-bg text-peach" };
  return { text: "Avoid", cls: "bg-rose-bg text-rose" };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={rating >= s ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={rating >= s ? "text-peach" : "text-border"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 24 - ((p - min) / range) * 22 - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 24" className="w-full h-6 mt-2">
      <polyline points={coords} fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function seriesToPath(values: number[], min: number, max: number, w: number, h: number) {
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function ProductDetailPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [priceRange, setPriceRange] = useState<(typeof TIME_RANGES)[number]>("1 Year");

  // Profit simulator state
  const [marketplace, setMarketplace] = useState("Amazon.de");
  const [salePrice, setSalePrice] = useState(50);
  const [quantity, setQuantity] = useState(100);
  const [fulfillmentType, setFulfillmentType] = useState<"FBA" | "FBM">("FBA");
  const [prepCost, setPrepCost] = useState(0.8);
  const [cargoCost, setCargoCost] = useState(0.7);
  const [vatRate, setVatRate] = useState(19);

  const unitCost = 24.0;
  const commissionRate = 0.15;
  const fbaFeeAmt = fulfillmentType === "FBA" ? 4.8 : 0;
  const vatFactor = vatRate / 100 / (1 + vatRate / 100);

  const calcRow = (price: number) => {
    const commission = price * commissionRate;
    const vat = price * vatFactor;
    const totalCost = unitCost + commission + fbaFeeAmt + prepCost + cargoCost + vat;
    const netProfit = price - totalCost;
    const roi = unitCost > 0 ? (netProfit / unitCost) * 100 : 0;
    const margin = price > 0 ? (netProfit / price) * 100 : 0;
    return { commission, vat, totalCost, netProfit, roi, margin };
  };

  const current = calcRow(salePrice);
  const totalNetProfit = current.netProfit * quantity;
  const breakEvenPrice = (unitCost + fbaFeeAmt + prepCost + cargoCost) / (1 - commissionRate - vatFactor);

  const statusFor = (roi: number) => {
    if (roi < 0) return { text: "Loss", cls: "text-rose bg-rose-bg/50" };
    if (roi < 10) return { text: "Near Break-even", cls: "text-peach bg-peach-bg/50" };
    if (roi < 20) return { text: "Low Profit", cls: "text-muted bg-section-bg" };
    if (roi < 30) return { text: "Suitable", cls: "text-primary bg-primary-light/50" };
    if (roi < 45) return { text: "Strong", cls: "text-mint bg-mint-bg/50" };
    return { text: "Very Good", cls: "text-mint font-semibold bg-mint-bg" };
  };

  const scenarioPrices = [30, 35, 40, 45, 50, 55];

  const [notes, setNotes] = useState(NOTES);
  const [draftNote, setDraftNote] = useState("");

  const scoreInfo = scoreLabelInfo(PRODUCT.score);

  const rangeSlice: Record<(typeof TIME_RANGES)[number], number> = {
    "7 Days": 1,
    "1 Month": 1,
    "3 Months": 3,
    "6 Months": 6,
    "1 Year": 13,
    All: 13,
  };
  const sliceCount = rangeSlice[priceRange];
  const months = MONTH_LABELS.slice(-sliceCount);
  const buyBox = PRICE_SERIES.buyBox.slice(-sliceCount);
  const amazon = PRICE_SERIES.amazon.slice(-sliceCount);
  const fba = PRICE_SERIES.fba.slice(-sliceCount);
  const fbm = PRICE_SERIES.fbm.slice(-sliceCount);
  const rank = PRICE_SERIES.rank.slice(-sliceCount);
  const bsrSlice = BSR_TREND.slice(-sliceCount);

  const chartW = 600;
  const chartH = 220;

  return (
    <div>
      {/* ── TOP HEADER ── */}
      <div className="bg-card-bg border-b border-border px-6 py-5">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="flex gap-4 flex-1 min-w-[320px]">
            <div className="w-24 h-24 bg-section-bg rounded-xl shrink-0 flex items-center justify-center text-muted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-heading font-bold text-xl">{PRODUCT.supplierTitle}</h1>
              <p className="text-muted text-sm mt-0.5">{PRODUCT.amazonTitle}</p>
              <div className="mt-2 flex gap-4 text-xs text-muted flex-wrap">
                <span>ASIN: {PRODUCT.asin}</span>
                <span>EAN: {PRODUCT.ean}</span>
                <span>Brand: {PRODUCT.brand}</span>
                <span>Category: {PRODUCT.category}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="bg-mint-bg text-mint border border-mint/30 rounded-full px-3 py-1 text-sm font-semibold">
                  Match Score: {PRODUCT.matchScore}%
                </span>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium transition-colors duration-150 cursor-pointer bg-card-bg hover:bg-section-bg text-body border border-border hover:border-primary px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-1.5"
                >
                  View on Amazon
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* MarginLane Score */}
          <div className="bg-section-bg rounded-xl p-4 text-center w-48 shrink-0">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-heading font-bold text-5xl">{PRODUCT.score}</span>
              <span className="text-muted text-sm">/ 100</span>
            </div>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${scoreInfo.cls}`}>{scoreInfo.text}</span>
            <Sparkline points={SCORE_TREND} />
          </div>

          {/* Amazon Metrics */}
          <div className="grid grid-cols-4 gap-4 flex-1 min-w-[420px]">
            <div>
              <p className="text-muted text-xs">BSR (Health & Personal Care)</p>
              <p className="text-heading font-semibold text-base">#{AMAZON_METRICS.bsr.toLocaleString()}</p>
              <p className="text-mint text-xs">▲{AMAZON_METRICS.bsrTrend30d}% last 30 days</p>
            </div>
            <div>
              <p className="text-muted text-xs">Buy Box Price</p>
              <p className="text-heading font-semibold text-base">€{AMAZON_METRICS.buyBoxPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Lowest FBA Price</p>
              <p className="text-heading font-semibold text-base">€{AMAZON_METRICS.lowestFbaPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Amazon Active?</p>
              <p className={`font-semibold text-base ${AMAZON_METRICS.amazonActive ? "text-rose" : "text-mint"}`}>
                {AMAZON_METRICS.amazonActive ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs">FBA Seller Count</p>
              <p className="text-heading font-semibold text-base">{AMAZON_METRICS.fbaSellerCount}</p>
            </div>
            <div>
              <p className="text-muted text-xs">FBM Seller Count</p>
              <p className="text-heading font-semibold text-base">{AMAZON_METRICS.fbmSellerCount}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Review Count</p>
              <p className="text-heading font-semibold text-base">{AMAZON_METRICS.reviewCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Rating</p>
              <p className="text-heading font-semibold text-base flex items-center gap-1.5">
                <StarDisplay rating={Math.round(AMAZON_METRICS.rating)} />
                {AMAZON_METRICS.rating}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="border-b border-border px-6 mt-4">
        <div className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm ${
                activeTab === tab ? "text-primary border-b-2 border-primary font-medium" : "text-muted hover:text-body"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-3 gap-6 p-6">
          {/* LEFT: Profit Simulator */}
          <div className="col-span-1 bg-card-bg border border-border rounded-xl p-5">
            <h2 className="text-heading font-semibold text-sm mb-4">Profit Simulator</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Marketplace</label>
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary"
                >
                  <option>Amazon.de</option>
                  <option>Amazon.co.uk</option>
                  <option>Amazon.com</option>
                  <option>Amazon.fr</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Sale Price (€)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-body mb-1.5">Fulfillment Type</label>
                <div className="flex gap-2">
                  {(["FBA", "FBM"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFulfillmentType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                        fulfillmentType === t ? "bg-primary text-white" : "bg-section-bg text-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Prep Cost / Unit (€)</label>
                  <input
                    type="number"
                    value={prepCost}
                    onChange={(e) => setPrepCost(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">Cargo Cost / Unit (€)</label>
                  <input
                    type="number"
                    value={cargoCost}
                    onChange={(e) => setCargoCost(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-body mb-1.5">VAT Rate</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(parseInt(e.target.value))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-page-bg text-body outline-none focus:border-primary"
                >
                  <option value={19}>19% Germany</option>
                  <option value={20}>20% UK</option>
                  <option value={7}>7% France</option>
                </select>
              </div>

              <button className="text-primary text-xs">Edit All Costs</button>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted text-xs mb-1">Net Profit/Unit</p>
                  <p className="text-mint font-bold text-2xl">€{current.netProfit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">ROI</p>
                  <p className="text-mint font-bold text-2xl">{current.roi.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Net Profit Margin</p>
                  <p className="text-mint font-bold text-2xl">{current.margin.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Total Net Profit</p>
                  <p className="text-heading font-bold text-2xl">€{totalNetProfit.toFixed(2)}</p>
                </div>
              </div>

              <p className="text-muted text-xs mt-4">Break-even Price: €{breakEvenPrice.toFixed(2)}</p>
              <div className="bg-section-bg h-2 rounded-full mt-1.5 relative overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (breakEvenPrice / Math.max(salePrice, breakEvenPrice)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* MIDDLE: Cost Breakdown + Price Scenario */}
          <div className="col-span-1 space-y-4">
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-heading font-semibold text-sm">Cost Items</h2>
                <div className="flex gap-8 text-muted text-xs">
                  <span>Per Unit (€)</span>
                  <span>Total (€)</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Unit Cost", per: unitCost },
                  { label: "Amazon Commission (15%)", per: current.commission },
                  { label: "FBA Fee", per: fbaFeeAmt },
                  { label: "Prep Cost", per: prepCost },
                  { label: "Cargo Cost", per: cargoCost },
                  { label: "VAT", per: current.vat },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-body">{row.label}</span>
                    <span className="flex gap-8 text-body">
                      <span className="w-16 text-right">{row.per.toFixed(2)}</span>
                      <span className="w-20 text-right">{(row.per * quantity).toFixed(2)}</span>
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-rose font-semibold">Total Cost</span>
                  <span className="flex gap-8">
                    <span className="w-16 text-right text-rose font-semibold">{current.totalCost.toFixed(2)}</span>
                    <span className="w-20 text-right text-rose font-semibold">{(current.totalCost * quantity).toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-mint font-semibold">Sale Price</span>
                  <span className="flex gap-8">
                    <span className="w-16 text-right text-mint font-semibold">{salePrice.toFixed(2)}</span>
                    <span className="w-20 text-right text-mint font-semibold">{(salePrice * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h2 className="text-heading font-semibold text-sm mb-3">Price Scenario Table</h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted text-left">
                    <th className="font-semibold pb-2">Sale Price</th>
                    <th className="font-semibold pb-2">Net Profit/Unit</th>
                    <th className="font-semibold pb-2">ROI</th>
                    <th className="font-semibold pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioPrices.map((price) => {
                    const row = calcRow(price);
                    const status = statusFor(row.roi);
                    return (
                      <tr key={price} className="border-t border-border">
                        <td className="py-2 text-body">€{price.toFixed(2)}</td>
                        <td className={`py-2 ${row.netProfit >= 0 ? "text-mint" : "text-rose"}`}>
                          {row.netProfit >= 0 ? "" : "-"}€{Math.abs(row.netProfit).toFixed(2)}
                        </td>
                        <td className={row.roi >= 0 ? "text-mint" : "text-rose"}>{row.roi.toFixed(2)}%</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full ${status.cls}`}>{status.text}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex gap-4 mt-4 text-muted text-xs flex-wrap">
                <span>Current Buy Box: €49.90</span>
                <span>Last 30-day avg: €47.30</span>
                <span>12-month high: €56.90</span>
                <span>12-month low: €34.90</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Risk Analysis + Quick Actions */}
          <div className="col-span-1 space-y-4">
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h2 className="text-heading font-semibold text-sm mb-3">Risk Analysis</h2>
              <div className="space-y-2.5">
                {RISKS.map((risk) => (
                  <div key={risk.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${RISK_DOT[risk.level]}`} />
                      <span className="text-body text-sm">{risk.label}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[risk.level]}`}>{risk.status}</span>
                  </div>
                ))}
              </div>
              <button className="text-primary text-sm mt-3">Detailed Risk Report →</button>
            </div>

            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h2 className="text-heading font-semibold text-sm mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="primary" size="md" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add to Product Pool
                  </span>
                </Button>
                <Button variant="outline" size="md" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Add to Shortlist
                  </span>
                </Button>
                <Button variant="outline" size="md" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Create PO
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFIT CALCULATION TAB ── */}
      {activeTab === "Profit Calculation" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <h2 className="text-heading font-semibold text-base mb-2">Profit Calculation</h2>
          <p className="text-muted text-sm">See the Overview tab for the full Profit Simulator, Cost Breakdown and Price Scenario Table.</p>
        </div>
      )}

      {/* ── PRICE HISTORY TAB ── */}
      {activeTab === "Price History" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-heading font-semibold text-base">1-Year Price History</h2>
            <div className="flex gap-2">
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setPriceRange(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    priceRange === r ? "bg-primary text-white" : "bg-section-bg text-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap mb-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Buy Box Price</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-heading" />Amazon Price</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-mint" />FBA Price</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose" />FBM Price</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" />Sales Rank</span>
          </div>

          <div className="w-full h-64">
            <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-full">
              <polyline points={seriesToPath(buyBox, 20, 60, chartW, chartH)} fill="none" stroke="#3b82f6" strokeWidth="2" />
              <polyline points={seriesToPath(amazon, 20, 60, chartW, chartH)} fill="none" stroke="#2c3570" strokeWidth="2" />
              <polyline points={seriesToPath(fba, 20, 60, chartW, chartH)} fill="none" stroke="#81c784" strokeWidth="2" />
              <polyline points={seriesToPath(fbm, 20, 60, chartW, chartH)} fill="none" stroke="#f48fb1" strokeWidth="2" />
              <polyline points={seriesToPath(rank, 500, 2500, chartW, chartH)} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,4" />
              {months.map((m, i) => (
                <text key={m} x={(i / (months.length - 1)) * chartW} y={chartH + 20} fontSize="10" textAnchor="middle" className="fill-muted">
                  {m}
                </text>
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-muted text-xs mt-1">
            <span>€20 – €60</span>
            <span>#500 – #2500</span>
          </div>
        </div>
      )}

      {/* ── SALES & TREND TAB ── */}
      {activeTab === "Sales & Trend" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-muted text-xs mb-1">Estimated Monthly Sales</p>
              <p className="text-heading font-bold text-xl">1,200 - 1,500 units</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-1">30-Day Trend</p>
              <p className="text-mint font-bold text-xl">▲ 18%</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-1">90-Day Trend</p>
              <p className="text-mint font-bold text-xl">▲ 25%</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-1">Highest Monthly Sales</p>
              <p className="text-heading font-bold text-xl">2,150 units</p>
            </div>
          </div>

          <h3 className="text-heading font-semibold text-sm mb-3">BSR Trend (Last 1 Year)</h3>
          <div className="w-full h-48">
            <svg viewBox={`0 0 ${chartW} 180`} className="w-full h-full">
              <polyline points={seriesToPath([...bsrSlice].reverse(), 1000, 2500, chartW, 160)} fill="none" stroke="#7986cb" strokeWidth="2" />
              {months.map((m, i) => (
                <text key={m} x={(i / (months.length - 1)) * chartW} y={175} fontSize="10" textAnchor="middle" className="fill-muted">
                  {m}
                </text>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* ── VARIATIONS TAB ── */}
      {activeTab === "Variations" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-heading font-semibold text-base">Variations</h2>
            <span className="bg-section-bg text-muted text-xs px-2 py-0.5 rounded-full font-medium">8 total</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs text-left border-b border-border">
                <th className="font-semibold pb-2 pr-3">Image</th>
                <th className="font-semibold pb-2 pr-3">Variation</th>
                <th className="font-semibold pb-2 pr-3">ASIN</th>
                <th className="font-semibold pb-2 pr-3">Price</th>
                <th className="font-semibold pb-2 pr-3">Sales Rank</th>
                <th className="font-semibold pb-2">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {VARIATIONS.map((v) => (
                <tr key={v.asin} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3"><div className="w-10 h-10 bg-section-bg rounded-lg" /></td>
                  <td className="py-2.5 pr-3 text-body">{v.name}</td>
                  <td className="py-2.5 pr-3 text-body font-mono text-xs">{v.asin}</td>
                  <td className="py-2.5 pr-3 text-body">€{v.price.toFixed(2)}</td>
                  <td className="py-2.5 pr-3 text-body">#{v.bsr.toLocaleString()}</td>
                  <td className="py-2.5 text-body flex items-center gap-1.5">
                    <StarDisplay rating={Math.round(v.rating)} />
                    ({v.rating})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="text-primary text-sm mt-4">View all 8 variations →</button>
        </div>
      )}

      {/* ── RISK ANALYSIS TAB ── */}
      {activeTab === "Risk Analysis" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <h2 className="text-heading font-semibold text-base mb-4">Risk Analysis</h2>
          <div className="space-y-3">
            {RISKS.map((risk) => (
              <div key={risk.label} className="flex items-center justify-between border-b border-border last:border-0 pb-3 last:pb-0">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${RISK_DOT[risk.level]}`} />
                  <span className="text-body text-sm">{risk.label}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[risk.level]}`}>{risk.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMPETITORS TAB ── */}
      {activeTab === "Competitors" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <h2 className="text-heading font-semibold text-base mb-4">Competitors (Lowest Prices)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs text-left border-b border-border">
                <th className="font-semibold pb-2 pr-3">#</th>
                <th className="font-semibold pb-2 pr-3">Seller</th>
                <th className="font-semibold pb-2 pr-3">Type</th>
                <th className="font-semibold pb-2 pr-3">Price</th>
                <th className="font-semibold pb-2 pr-3">Shipping</th>
                <th className="font-semibold pb-2 pr-3">Total</th>
                <th className="font-semibold pb-2 pr-3">Stock</th>
                <th className="font-semibold pb-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c, i) => (
                <tr key={c.seller} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 text-body">{i + 1}</td>
                  <td className="py-2.5 pr-3 text-body">{c.seller}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.type === "FBA" ? "bg-primary-light text-primary" : "bg-section-bg text-muted"}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-body">€{c.price.toFixed(2)}</td>
                  <td className="py-2.5 pr-3 text-body">{c.shipping === 0 ? "Free" : `€${c.shipping.toFixed(2)}`}</td>
                  <td className="py-2.5 pr-3 text-body">€{(c.price + c.shipping).toFixed(2)}</td>
                  <td className="py-2.5 pr-3">
                    <span className="bg-mint-bg text-mint text-xs px-2 py-0.5 rounded-full">{c.stock}</span>
                  </td>
                  <td className="py-2.5 text-body">
                    {c.rating ? (
                      <span className="flex items-center gap-1.5">
                        <StarDisplay rating={Math.round(c.rating)} />({c.rating})
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── NOTES TAB ── */}
      {activeTab === "Notes" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <h2 className="text-heading font-semibold text-base mb-4">Notes</h2>
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Add your notes about this product..."
            className="min-h-[160px] w-full border border-border rounded-xl p-4 text-sm bg-page-bg text-body placeholder-placeholder resize-none outline-none focus:border-primary"
          />
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={() => {
              if (!draftNote.trim()) return;
              setNotes((prev) => [{ text: draftNote, author: "You", date: new Date().toLocaleString() }, ...prev]);
              setDraftNote("");
            }}
          >
            Save Note
          </Button>

          <div className="space-y-3 mt-5">
            {notes.map((note, i) => (
              <div key={i} className="bg-section-bg rounded-xl p-4">
                <p className="text-body text-sm">{note.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-muted text-xs">{note.author} · {note.date}</p>
                  <button className="text-primary text-xs">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {activeTab === "Reviews" && (
        <div className="bg-card-bg border border-border rounded-xl p-6 m-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-heading font-semibold text-base">Reviews</h2>
            <span className="bg-section-bg text-muted text-xs px-2 py-0.5 rounded-full font-medium">
              {AMAZON_METRICS.reviewCount.toLocaleString()} total reviews
            </span>
          </div>

          <div className="flex gap-8 items-start mb-6 flex-wrap">
            <div className="text-center">
              <p className="text-heading font-bold text-4xl">{AMAZON_METRICS.rating}</p>
              <StarDisplay rating={Math.round(AMAZON_METRICS.rating)} />
            </div>
            <div className="flex-1 min-w-[240px] space-y-1.5">
              {RATING_BREAKDOWN.map((r) => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="text-muted text-xs w-6">{r.stars}★</span>
                  <div className="bg-section-bg rounded-full h-2 w-full">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-muted text-xs w-8 text-right">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="border-t border-border pt-4">
                <div className="flex items-center gap-3 mb-1">
                  <StarDisplay rating={r.rating} />
                  <span className="text-body text-sm font-medium">{r.name}</span>
                  <span className="text-muted text-xs">{r.date}</span>
                  <span className="bg-mint-bg text-mint text-xs px-2 py-0.5 rounded-full">Verified Purchase</span>
                </div>
                <p className="font-medium text-body text-sm mt-1">{r.title}</p>
                <p className="text-muted text-sm mt-1">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
