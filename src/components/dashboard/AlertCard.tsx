import { DailyPulseAlert, DailyPulseSignal } from "@/types";
import Button from "@/components/ui/Button";

interface AlertCardProps {
  alert: DailyPulseAlert;
  onAction: (action: string, alertId: string) => void;
}

interface SignalConfig {
  colorClass: string;
  icon: React.ReactNode;
}

function getSignalConfig(signal: DailyPulseSignal): SignalConfig {
  const base = "w-9 h-9 rounded-lg flex items-center justify-center shrink-0";

  switch (signal) {
    case "stock_low_alert":
      return {
        colorClass: `${base} bg-rose-bg text-rose`,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      };
    case "reorder_candidate":
      return {
        colorClass: `${base} bg-peach-bg text-peach`,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        ),
      };
    case "watchlist_opportunity":
      return {
        colorClass: `${base} bg-mint-bg text-mint`,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ),
      };
    case "profit_drop_alert":
      return {
        colorClass: `${base} bg-rose-bg text-rose`,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
        ),
      };
    case "amazon_risk_alert":
      return {
        colorClass: `${base} bg-peach-bg text-peach`,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      };
    case "re_analysis_reminder":
      return {
        colorClass: `${base} bg-primary-light text-primary`,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      };
  }
}

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AlertCard({ alert, onAction }: AlertCardProps) {
  const { colorClass, icon } = getSignalConfig(alert.signal);

  return (
    <div className="bg-card-bg border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={colorClass}>{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-heading text-sm font-medium truncate">{alert.productName}</p>
        <p className="text-muted text-xs mt-0.5">{alert.description}</p>
        <span className="inline-block font-mono text-xs bg-section-bg px-1.5 py-0.5 rounded mt-1.5">
          {alert.asin}
        </span>

        <div className="flex items-center gap-1 flex-wrap mt-2">
          <Button variant="ghost" size="sm" onClick={() => onAction("view", alert.id)}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction("re-analyze", alert.id)}>
            Re-analyze
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction("add-to-order", alert.id)}>
            Add to Order
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction("snooze", alert.id)}>
            Snooze
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction("dismiss", alert.id)}>
            Dismiss
          </Button>
        </div>
      </div>

      <time className="text-muted text-xs shrink-0 mt-0.5">{formatTimestamp(alert.createdAt)}</time>
    </div>
  );
}
