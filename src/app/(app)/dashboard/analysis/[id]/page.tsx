"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { getProductById, updateProduct, type ProductRecord, type ProductUpdatePayload } from "@/lib/services/productsService";
import {
  getAmazonProductMetrics,
  updateAmazonProductMetric,
  type AmazonProductMetricRecord,
  type AmazonProductMetricUpdatePayload,
} from "@/lib/services/amazonProductMetricsService";
import {
  addShortlistItem,
  createShortlist,
  getShortlists,
  type ShortlistRecord,
} from "@/lib/services/shortlistsService";
import { getSupplierProducts, type SupplierProductRecord } from "@/lib/services/supplierProductsService";
import { createOrder } from "@/lib/services/ordersService";
import { createOrderItem } from "@/lib/services/orderItemsService";
import { useAppSelector } from "@/lib/hooks";

// NOTE: Identity fields (title/asin/ean/upc/brand/category) come from
// GET /products/:id. BSR and Buy Box Price come from the latest
// GET /amazon-product-metrics/:product_id snapshot (falls back to mock if
// no snapshot exists yet). Everything else below — score, lowest FBA price,
// amazon-active flag, seller counts, review count/rating, risks, variations,
// competitors, reviews and price history — is still mock: it belongs to
// profit-calculations / MarginScore / AmazonMatch / CanonicalProduct, and
// review/rating/seller-count fields don't have a documented source in any
// group reviewed so far (flagged to backend).

const MOCK_MATCH_SCORE = 96;
const MOCK_SCORE = 82;

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

interface MetricPoint {
  date: Date;
  buybox_price: number;
  sales_rank: number;
}

function toMetricPoints(records: AmazonProductMetricRecord[]): MetricPoint[] {
  return records
    .map((r) => ({ date: new Date(r.updated_at), buybox_price: r.buybox_price, sales_rank: r.sales_rank }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

const RANGE_DAYS: Record<(typeof TIME_RANGES)[number], number | null> = {
  "7 Days": 7,
  "1 Month": 30,
  "3 Months": 90,
  "6 Months": 180,
  "1 Year": 365,
  All: null,
};

function filterPointsByRange(points: MetricPoint[], range: (typeof TIME_RANGES)[number]): MetricPoint[] {
  const days = RANGE_DAYS[range];
  if (days === null) return points;
  const cutoff = Date.now() - days * 86400000;
  const inRange = points.filter((p) => p.date.getTime() >= cutoff);
  return inRange.length >= 2 ? inRange : points;
}

function computeBsrTrend(points: MetricPoint[]): number | null {
  if (points.length < 2) return null;
  const cutoff = Date.now() - 30 * 86400000;
  const past = [...points].reverse().find((p) => p.date.getTime() <= cutoff) ?? points[0];
  const latest = points[points.length - 1];
  if (!past || past.sales_rank === 0 || past === latest) return null;
  return ((past.sales_rank - latest.sales_rank) / past.sales_rank) * 100;
}

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
  const params = useParams<{ id: string }>();
  const workspaceId = useAppSelector((s) => s.workspace.current?.id);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [latestMetric, setLatestMetric] = useState<AmazonProductMetricRecord | null>(null);
  const [metricHistory, setMetricHistory] = useState<AmazonProductMetricRecord[]>([]);

  const [isMetricEditOpen, setIsMetricEditOpen] = useState(false);
  const [metricForm, setMetricForm] = useState<AmazonProductMetricUpdatePayload>({});
  const [metricSaving, setMetricSaving] = useState(false);
  const [metricError, setMetricError] = useState("");

  const openMetricEdit = () => {
    if (!latestMetric) return;
    setMetricForm({
      buybox_price: latestMetric.buybox_price ?? undefined,
      amazon_fee: latestMetric.amazon_fee ?? undefined,
      fba_fee: latestMetric.fba_fee ?? undefined,
      sales_rank: latestMetric.sales_rank ?? undefined,
    });
    setMetricError("");
    setIsMetricEditOpen(true);
  };

  const handleMetricSave = async () => {
    if (!latestMetric) return;
    setMetricSaving(true);
    setMetricError("");
    try {
      const updated = await updateAmazonProductMetric(latestMetric.id, metricForm);
      setLatestMetric(updated);
      setIsMetricEditOpen(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setMetricError(axiosErr.response?.data?.message ?? "Failed to update metrics.");
    } finally {
      setMetricSaving(false);
    }
  };

  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [shortlists, setShortlists] = useState<ShortlistRecord[]>([]);
  const [shortlistsLoading, setShortlistsLoading] = useState(false);
  const [shortlistError, setShortlistError] = useState("");
  const [shortlistSuccess, setShortlistSuccess] = useState("");
  const [addingShortlistId, setAddingShortlistId] = useState<string | null>(null);
  const [newShortlistName, setNewShortlistName] = useState("");
  const [creatingShortlist, setCreatingShortlist] = useState(false);

  const openShortlistModal = () => {
    setShortlistError("");
    setShortlistSuccess("");
    setNewShortlistName("");
    setIsShortlistOpen(true);
    setShortlistsLoading(true);
    getShortlists()
      .then(setShortlists)
      .catch((err: AxiosError<{ message?: string }>) => {
        setShortlistError(err.response?.data?.message ?? "Failed to load shortlists.");
      })
      .finally(() => setShortlistsLoading(false));
  };

  const handleAddToShortlist = async (shortlistId: string) => {
    if (!product) return;
    setShortlistError("");
    setShortlistSuccess("");
    setAddingShortlistId(shortlistId);
    try {
      await addShortlistItem(shortlistId, product.id);
      setShortlistSuccess("Added to shortlist.");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setShortlistError(axiosErr.response?.data?.message ?? "Failed to add product to shortlist.");
    } finally {
      setAddingShortlistId(null);
    }
  };

  const handleCreateShortlistAndAdd = async () => {
    if (!newShortlistName.trim() || !product) return;
    setCreatingShortlist(true);
    setShortlistError("");
    setShortlistSuccess("");
    try {
      const created = await createShortlist(newShortlistName.trim());
      setShortlists((prev) => [created, ...prev]);
      await addShortlistItem(created.id, product.id);
      setShortlistSuccess("Added to shortlist.");
      setNewShortlistName("");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setShortlistError(axiosErr.response?.data?.message ?? "Failed to create shortlist.");
    } finally {
      setCreatingShortlist(false);
    }
  };

  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [poSupplierProducts, setPoSupplierProducts] = useState<SupplierProductRecord[]>([]);
  const [poSupplierProductId, setPoSupplierProductId] = useState("");
  const [poQty, setPoQty] = useState("100");
  const [poLoading, setPoLoading] = useState(false);
  const [poSaving, setPoSaving] = useState(false);
  const [poError, setPoError] = useState("");
  const [poSuccess, setPoSuccess] = useState("");

  const openCreatePO = () => {
    if (!product || !workspaceId) return;
    setPoError("");
    setPoSuccess("");
    setPoSupplierProductId("");
    setPoQty("100");
    setIsCreatePOOpen(true);
    setPoLoading(true);
    getSupplierProducts(workspaceId)
      .then((all) => setPoSupplierProducts(all.filter((sp) => sp.product_id === product.id)))
      .catch(() => setPoSupplierProducts([]))
      .finally(() => setPoLoading(false));
  };

  const handleCreatePO = async () => {
    if (!workspaceId || !poSupplierProductId) return;
    const supplierProduct = poSupplierProducts.find((sp) => sp.id === poSupplierProductId);
    if (!supplierProduct) return;
    setPoSaving(true);
    setPoError("");
    try {
      const order = await createOrder({ workspace_id: workspaceId, supplier_id: supplierProduct.supplier_id, status: "DRAFT" });
      await createOrderItem({
        order_id: order.id,
        supplier_product_id: poSupplierProductId,
        quantity: parseInt(poQty, 10) || 1,
        unit_price: Number(supplierProduct.cost_price),
      });
      setPoSuccess("Draft order created.");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setPoError(axiosErr.response?.data?.message ?? "Failed to create order.");
    } finally {
      setPoSaving(false);
    }
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<ProductUpdatePayload>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const openEdit = () => {
    if (!product) return;
    setEditForm({
      amazon_title: product.amazon_title ?? "",
      brand: product.brand ?? "",
      upc: product.upc ?? "",
      ean: product.ean ?? "",
      model_number: product.model_number ?? "",
      category: product.category ?? "",
      image_url: product.image_url ?? "",
    });
    setEditError("");
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!product) return;
    setEditSaving(true);
    setEditError("");
    try {
      const payload: ProductUpdatePayload = {};
      (Object.entries(editForm) as [keyof ProductUpdatePayload, string | undefined][]).forEach(([key, value]) => {
        payload[key] = value ? value : undefined;
      });
      const updated = await updateProduct(product.id, payload);
      setProduct(updated);
      setIsEditOpen(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setEditError(axiosErr.response?.data?.message ?? "Failed to update product.");
    } finally {
      setEditSaving(false);
    }
  };

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    getProductById(params.id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        if (!cancelled) setLoadError(err.response?.data?.message ?? "Failed to load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    getAmazonProductMetrics(params.id)
      .then((snapshots) => {
        if (cancelled) return;
        setLatestMetric(snapshots.latest);
        const merged = snapshots.latest
          ? [snapshots.latest, ...snapshots.history.filter((h) => h.id !== snapshots.latest!.id)]
          : snapshots.history;
        setMetricHistory(merged);
      })
      .catch(() => {
        if (!cancelled) {
          setLatestMetric(null);
          setMetricHistory([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

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

  const scoreInfo = scoreLabelInfo(MOCK_SCORE);

  const allPoints = toMetricPoints(metricHistory);
  const rangedPoints = filterPointsByRange(allPoints, priceRange);
  const hasHistory = allPoints.length > 0;
  const bsrTrend = computeBsrTrend(allPoints);

  const priceStats = (() => {
    if (allPoints.length === 0) return null;
    const now = allPoints[allPoints.length - 1].date.getTime();
    const last30 = allPoints.filter((p) => now - p.date.getTime() <= 30 * 24 * 60 * 60 * 1000);
    const last12mo = allPoints.filter((p) => now - p.date.getTime() <= 365 * 24 * 60 * 60 * 1000);
    const avgSource = last30.length > 0 ? last30 : allPoints;
    const highLowSource = last12mo.length > 0 ? last12mo : allPoints;
    return {
      current: allPoints[allPoints.length - 1].buybox_price,
      avg30: avgSource.reduce((sum, p) => sum + p.buybox_price, 0) / avgSource.length,
      high12mo: Math.max(...highLowSource.map((p) => p.buybox_price)),
      low12mo: Math.min(...highLowSource.map((p) => p.buybox_price)),
    };
  })();

  const chartW = 600;
  const chartH = 220;

  if (loading) {
    return (
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <p className="text-muted text-sm">Loading product…</p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="bg-card-bg border-b border-border px-6 py-4">
        <p className="text-rose text-sm">{loadError || "Product not found."}</p>
      </div>
    );
  }

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
              <h1 className="text-heading font-bold text-xl">{product.amazon_title || "Untitled Product"}</h1>
              <div className="mt-2 flex gap-4 text-xs text-muted flex-wrap">
                <span>ASIN: {product.asin || "—"}</span>
                <span>EAN: {product.ean || "—"}</span>
                <span>UPC: {product.upc || "—"}</span>
                <span>Brand: {product.brand || "—"}</span>
                <span>Category: {product.category || "—"}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="bg-mint-bg text-mint border border-mint/30 rounded-full px-3 py-1 text-sm font-semibold">
                  Match Score: {MOCK_MATCH_SCORE}%
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
                <Button variant="outline" size="sm" onClick={openEdit}>
                  Edit Product
                </Button>
              </div>
            </div>
          </div>

          {/* MarginLane Score */}
          <div className="bg-section-bg rounded-xl p-4 text-center w-48 shrink-0">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-heading font-bold text-5xl">{MOCK_SCORE}</span>
              <span className="text-muted text-sm">/ 100</span>
            </div>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${scoreInfo.cls}`}>{scoreInfo.text}</span>
            <Sparkline points={SCORE_TREND} />
          </div>

          {/* Amazon Metrics */}
          <div className="flex-1 min-w-[420px]">
          {latestMetric && (
            <div className="flex justify-end mb-1">
              <Button variant="ghost" size="sm" onClick={openMetricEdit}>Edit Metrics</Button>
            </div>
          )}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-muted text-xs">BSR (Health & Personal Care)</p>
              <p className="text-heading font-semibold text-base">
                #{(latestMetric?.sales_rank ?? AMAZON_METRICS.bsr).toLocaleString()}
              </p>
              {latestMetric && bsrTrend !== null ? (
                <p className={`text-xs ${bsrTrend >= 0 ? "text-mint" : "text-rose"}`}>
                  {bsrTrend >= 0 ? "▲" : "▼"}
                  {Math.abs(bsrTrend).toFixed(1)}% last 30 days
                </p>
              ) : (
                !latestMetric && <p className="text-mint text-xs">▲{AMAZON_METRICS.bsrTrend30d}% last 30 days</p>
              )}
            </div>
            <div>
              <p className="text-muted text-xs">Buy Box Price</p>
              <p className="text-heading font-semibold text-base">
                €{(latestMetric?.buybox_price ?? AMAZON_METRICS.buyBoxPrice).toFixed(2)}
              </p>
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
                {priceStats ? (
                  <>
                    <span>Current Buy Box: €{priceStats.current.toFixed(2)}</span>
                    <span>Last 30-day avg: €{priceStats.avg30.toFixed(2)}</span>
                    <span>12-month high: €{priceStats.high12mo.toFixed(2)}</span>
                    <span>12-month low: €{priceStats.low12mo.toFixed(2)}</span>
                  </>
                ) : (
                  <span>No price history recorded for this product yet.</span>
                )}
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
                <Button variant="outline" size="md" className="w-full" onClick={openShortlistModal}>
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Add to Shortlist
                  </span>
                </Button>
                <Button variant="outline" size="md" className="w-full" onClick={openCreatePO}>
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
            <h2 className="text-heading font-semibold text-base">Price History</h2>
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
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" />Sales Rank</span>
          </div>

          {hasHistory && rangedPoints.length > 0 ? (
            (() => {
              const priceValues = rangedPoints.map((p) => p.buybox_price);
              const rankValues = rangedPoints.map((p) => p.sales_rank);
              const priceMin = Math.min(...priceValues);
              const priceMax = Math.max(...priceValues);
              const rankMin = Math.min(...rankValues);
              const rankMax = Math.max(...rankValues);
              return (
                <>
                  <div className="w-full h-64">
                    <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-full">
                      <polyline
                        points={seriesToPath(priceValues, priceMin, priceMax, chartW, chartH)}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <polyline
                        points={seriesToPath(rankValues, rankMin, rankMax, chartW, chartH)}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="5,4"
                      />
                      {rangedPoints.map((p, i) => (
                        <text
                          key={p.date.toISOString()}
                          x={(i / Math.max(rangedPoints.length - 1, 1)) * chartW}
                          y={chartH + 20}
                          fontSize="10"
                          textAnchor="middle"
                          className="fill-muted"
                        >
                          {rangedPoints.length <= 8 || i % Math.ceil(rangedPoints.length / 8) === 0
                            ? p.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                            : ""}
                        </text>
                      ))}
                    </svg>
                  </div>
                  <div className="flex justify-between text-muted text-xs mt-1">
                    <span>€{priceMin.toFixed(2)} – €{priceMax.toFixed(2)}</span>
                    <span>#{rankMin.toLocaleString()} – #{rankMax.toLocaleString()}</span>
                  </div>
                </>
              );
            })()
          ) : (
            <p className="text-muted text-sm py-10 text-center">
              No price history recorded for this product yet.
            </p>
          )}
          <p className="text-muted text-xs mt-3">
            Amazon / FBA / FBM price lines aren&apos;t available yet — the backend only tracks Buy Box price and sales rank per snapshot.
          </p>
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

          <h3 className="text-heading font-semibold text-sm mb-3">BSR Trend</h3>
          {hasHistory && rangedPoints.length > 0 ? (
            (() => {
              const rankValues = rangedPoints.map((p) => p.sales_rank);
              const rankMin = Math.min(...rankValues);
              const rankMax = Math.max(...rankValues);
              return (
                <div className="w-full h-48">
                  <svg viewBox={`0 0 ${chartW} 180`} className="w-full h-full">
                    <polyline
                      points={seriesToPath(rankValues, rankMin, rankMax, chartW, 160)}
                      fill="none"
                      stroke="#7986cb"
                      strokeWidth="2"
                    />
                    {rangedPoints.map((p, i) => (
                      <text
                        key={p.date.toISOString()}
                        x={(i / Math.max(rangedPoints.length - 1, 1)) * chartW}
                        y={175}
                        fontSize="10"
                        textAnchor="middle"
                        className="fill-muted"
                      >
                        {rangedPoints.length <= 8 || i % Math.ceil(rangedPoints.length / 8) === 0
                          ? p.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                          : ""}
                      </text>
                    ))}
                  </svg>
                </div>
              );
            })()
          ) : (
            <p className="text-muted text-sm py-10 text-center">No BSR history recorded for this product yet.</p>
          )}
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

      {/* Add to Shortlist Modal */}
      <Modal isOpen={isShortlistOpen} onClose={() => setIsShortlistOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Add to Shortlist</h2>
          </div>
          <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {shortlistsLoading ? (
              <p className="text-muted text-sm">Loading shortlists…</p>
            ) : shortlists.length === 0 ? (
              <p className="text-muted text-sm">You don&apos;t have any shortlists yet — create one below.</p>
            ) : (
              <div className="space-y-2">
                {shortlists.map((s) => (
                  <div key={s.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                    <span className="text-body text-sm">{s.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={addingShortlistId === s.id}
                      onClick={() => handleAddToShortlist(s.id)}
                    >
                      {addingShortlistId === s.id ? "Adding…" : "Add"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="New Shortlist"
                  placeholder="e.g. Q3 Kitchen Ideas"
                  value={newShortlistName}
                  onChange={(e) => setNewShortlistName(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                disabled={creatingShortlist || !newShortlistName.trim()}
                onClick={handleCreateShortlistAndAdd}
              >
                {creatingShortlist ? "Creating…" : "Create & Add"}
              </Button>
            </div>

            {shortlistSuccess && <p className="text-mint text-sm bg-mint-bg px-3 py-2 rounded-lg">{shortlistSuccess}</p>}
            {shortlistError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{shortlistError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsShortlistOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create PO Modal */}
      <Modal isOpen={isCreatePOOpen} onClose={() => setIsCreatePOOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Create Purchase Order</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            {poLoading ? (
              <p className="text-muted text-sm">Loading suppliers…</p>
            ) : poSupplierProducts.length === 0 ? (
              <p className="text-muted text-sm">
                No supplier is linked to this product yet. Link one from the Suppliers page first.
              </p>
            ) : (
              <>
                <div>
                  <label className="text-muted text-xs font-medium block mb-1">Supplier Product</label>
                  <select
                    value={poSupplierProductId}
                    onChange={(e) => setPoSupplierProductId(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-body bg-page-bg border border-border rounded-lg outline-none focus:border-primary"
                  >
                    <option value="">Select a supplier…</option>
                    {poSupplierProducts.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.supplier?.name ?? sp.supplier_id} — {sp.currency} {sp.cost_price}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  value={poQty}
                  onChange={(e) => setPoQty(e.target.value)}
                />
              </>
            )}
            {poSuccess && <p className="text-mint text-sm bg-mint-bg px-3 py-2 rounded-lg">{poSuccess}</p>}
            {poError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{poError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsCreatePOOpen(false)}>
              {poSuccess ? "Close" : "Cancel"}
            </Button>
            {!poSuccess && (
              <Button
                variant="primary"
                size="md"
                disabled={poSaving || !poSupplierProductId}
                onClick={handleCreatePO}
              >
                {poSaving ? "Creating…" : "Create PO"}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Edit Product</h2>
          </div>
          <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto">
            <Input
              label="Product Title"
              value={editForm.amazon_title ?? ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, amazon_title: e.target.value }))}
            />
            <Input
              label="Brand"
              value={editForm.brand ?? ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, brand: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="UPC"
                value={editForm.upc ?? ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, upc: e.target.value }))}
              />
              <Input
                label="EAN"
                value={editForm.ean ?? ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, ean: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Model Number"
                value={editForm.model_number ?? ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, model_number: e.target.value }))}
              />
              <Input
                label="Category"
                value={editForm.category ?? ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <Input
              label="Image URL"
              value={editForm.image_url ?? ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, image_url: e.target.value }))}
            />
            {editError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{editError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsEditOpen(false)} disabled={editSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Metrics Modal */}
      <Modal isOpen={isMetricEditOpen} onClose={() => setIsMetricEditOpen(false)}>
        <div className="bg-card-bg rounded-2xl border border-border shadow-xl overflow-hidden max-w-md">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-heading font-semibold text-lg">Edit Amazon Metrics</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Buy Box Price"
                type="number"
                step="0.01"
                value={metricForm.buybox_price ?? ""}
                onChange={(e) => setMetricForm((prev) => ({ ...prev, buybox_price: parseFloat(e.target.value) || undefined }))}
              />
              <Input
                label="BSR (Sales Rank)"
                type="number"
                value={metricForm.sales_rank ?? ""}
                onChange={(e) => setMetricForm((prev) => ({ ...prev, sales_rank: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amazon Fee"
                type="number"
                step="0.01"
                value={metricForm.amazon_fee ?? ""}
                onChange={(e) => setMetricForm((prev) => ({ ...prev, amazon_fee: parseFloat(e.target.value) || undefined }))}
              />
              <Input
                label="FBA Fee"
                type="number"
                step="0.01"
                value={metricForm.fba_fee ?? ""}
                onChange={(e) => setMetricForm((prev) => ({ ...prev, fba_fee: parseFloat(e.target.value) || undefined }))}
              />
            </div>
            <p className="text-muted text-xs">ROI is recalculated automatically from Buy Box Price, Amazon Fee, and FBA Fee.</p>
            {metricError && <p className="text-rose text-sm bg-rose-bg px-3 py-2 rounded-lg">{metricError}</p>}
          </div>
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border">
            <Button variant="ghost" size="md" onClick={() => setIsMetricEditOpen(false)} disabled={metricSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleMetricSave} disabled={metricSaving}>
              {metricSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
