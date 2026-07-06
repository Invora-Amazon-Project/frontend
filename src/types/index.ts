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
  dailyPulseAccess: boolean;
  exportOptions: string[];
  supportLevel: SupportLevel;
  annualDiscountPercent: number;
  includedTeamSeats?: number;
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
