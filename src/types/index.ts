export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
export type CardVariant = "default" | "featured";

// Admin types
export type AdminRole = "admin" | "user";
export type TicketStatus = "open" | "pending" | "assigned" | "in_progress" | "fixed" | "closed" | "reopened";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketDepartment = "technical_support" | "billing" | "account" | "product_analysis" | "amazon_connection" | "other";
export type PlanName = "starter" | "pro" | "team";
export type PaymentStatus = "paid" | "failed" | "refunded";
export type CreditTransactionType = "add" | "consume" | "refund";
export type LogType = "login" | "payment" | "credit" | "import" | "analysis" | "amazon_api" | "error" | "admin_action" | "security";
export type NotificationTarget = "all" | "by_plan" | "trial_only" | "single_user";
export type UserStatus = "active" | "blocked" | "trial";
export type LogSeverity = "info" | "warning" | "error";
export type DiscountType = "percentage" | "fixed";
export type SupportLevel = "Standard" | "Prioritized" | "Team Priority";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: PlanName;
  creditBalance: number;
  status: UserStatus;
  joinedDate: string;
  role: AdminRole;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  userId: string;
  userName: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignedTo?: string;
  attachment?: string;
}

export interface PlanConfig {
  name: PlanName;
  price: number;
  trialDays: number;
  monthlyCredits: number;
  importLimit: number;
  watchlistLimit: number;
  apiLimit: number;
  dailyPulseAccess: boolean;
  exportOptions: string[];
  supportLevel: SupportLevel;
  annualDiscountPercent: number;
  includedTeamSeats?: number;
  isActive: boolean;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  type: CreditTransactionType;
  amount: number;
  reason: string;
  date: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  validPlans: PlanName[];
  usageCount: number;
  usageLimit: number;
  expiryDate: string;
  isActive: boolean;
}

export interface DecisionRule {
  id: string;
  criterion: string;
  weight: number;
  isActive: boolean;
  description: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  type: LogType;
  description: string;
  ipAddress?: string;
  severity: LogSeverity;
}

export interface NotificationMessage {
  id: string;
  target: NotificationTarget;
  targetPlan?: PlanName;
  targetUserId?: string;
  subject: string;
  body: string;
  sentAt: string;
  deliveredCount: number;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  plan: PlanName;
  amount: number;
  status: PaymentStatus;
  date: string;
  invoiceUrl?: string;
  nextBillingDate?: string;
}

// User Dashboard types
export type MatchConfidence = "high" | "medium" | "low" | "unmatched";
export type MatchMethod = "upc" | "ean" | "asin" | "brand_title" | "model_number" | "manual";
export type ScoreLabel = "strong_opportunity" | "review_carefully" | "risky" | "avoid";
export type ProductTag =
  | "high_roi"
  | "strong_margin"
  | "low_competition"
  | "amazon_active"
  | "price_drop_risk"
  | "low_sales_volume"
  | "good_reorder_candidate"
  | "watchlist_recommended"
  | "avoid"
  | "re_analyze_needed";
export type DailyPulseSignal =
  | "stock_low_alert"
  | "reorder_candidate"
  | "watchlist_opportunity"
  | "profit_drop_alert"
  | "amazon_risk_alert"
  | "re_analysis_reminder";
export type OrderStatus =
  | "draft"
  | "sent_to_supplier"
  | "waiting_confirmation"
  | "confirmed"
  | "payment_pending"
  | "paid"
  | "shipped"
  | "received"
  | "sent_to_amazon_fba"
  | "completed"
  | "cancelled";
export type NotificationType = "opportunity" | "stock" | "risk" | "order" | "billing" | "credit" | "ticket" | "admin_announcement";
export type ImportStatus = "processing" | "completed" | "failed" | "partial";

export interface AnalyzedProduct {
  id: string;
  supplierTitle: string;
  amazonTitle: string;
  asin: string;
  upc?: string;
  ean?: string;
  brand: string;
  category: string;
  imageUrl?: string;
  matchMethod: MatchMethod;
  matchConfidence: MatchConfidence;
  supplierPrice: number;
  landedCost: number;
  shipping: number;
  customs: number;
  tax: number;
  currency: string;
  currentPrice: number;
  buyBoxPrice: number;
  fbaSellerCount: number;
  fbmSellerCount: number;
  amazonActive: boolean;
  netProfit: number;
  roi: number;
  margin: number;
  breakEvenPrice: number;
  recommendedSalePrice: number;
  monthlySales: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
  variationCount: number;
  score: number;
  scoreLabel: ScoreLabel;
  tags: ProductTag[];
  isWatchlisted: boolean;
  notes?: string;
  lastAnalysisDate: string;
  importId: string;
}

export interface ImportSession {
  id: string;
  supplierName: string;
  fileName: string;
  uploadedAt: string;
  status: ImportStatus;
  totalProducts: number;
  readProducts: number;
  errorRows: number;
  duplicates: number;
  matchedByUpc: number;
  matchedByName: number;
  unmatched: number;
  creditsUsed: number;
}

export interface DailyPulseAlert {
  id: string;
  signal: DailyPulseSignal;
  productName: string;
  asin: string;
  description: string;
  createdAt: string;
  isSnoozed: boolean;
  isDismissed: boolean;
  productId: string;
}

export interface ProductSnapshot {
  asin: string;
  date: string;
  amazonPrice: number;
  buyBoxPrice: number;
  roi: number;
  margin: number;
  fbaSellerCount: number;
  fbmSellerCount: number;
  amazonActive: boolean;
  userStock: number;
  marginLaneScore: number;
}

export interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  status: OrderStatus;
  products: OrderItem[];
  totalCost: number;
  expectedProfit: number;
  expectedRoi: number;
  shipping: number;
  taxAndCustoms: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  asin: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  estimatedSalePrice: number;
  expectedProfit: number;
}

export interface InventoryItem {
  id: string;
  productName: string;
  asin: string;
  currentStock: number;
  minimumStockLevel: number;
  estimatedStockEndDate: string;
  isReorderCandidate: boolean;
  lastOrderDate?: string;
  roi: number;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  currency: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  moq?: number;
  paymentTerms?: string;
  shippingTerms?: string;
  lastUploadedDate?: string;
  matchedProducts: number;
  profitableProducts: number;
  totalOrders: number;
  averageRoi: number;
  notes?: string;
}

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}
