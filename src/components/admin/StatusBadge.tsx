const statusStyles: Record<string, string> = {
  active: "bg-mint-bg text-mint font-medium",
  paid: "bg-mint-bg text-mint font-medium",
  open: "bg-mint-bg text-mint font-medium",
  confirmed: "bg-mint-bg text-mint font-medium",
  blocked: "bg-rose-bg text-rose font-medium",
  failed: "bg-rose-bg text-rose font-medium",
  cancelled: "bg-rose-bg text-rose font-medium",
  avoid: "bg-rose-bg text-rose font-medium",
  trial: "bg-peach-bg text-peach font-medium",
  pending: "bg-peach-bg text-peach font-medium",
  draft: "bg-peach-bg text-peach font-medium",
  risky: "bg-peach-bg text-peach font-medium",
  in_progress: "bg-primary-light text-primary font-medium",
  assigned: "bg-primary-light text-primary font-medium",
  review_carefully: "bg-primary-light text-primary font-medium",
};

const defaultStyle = "bg-section-bg text-muted font-medium";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] ?? defaultStyle;
  const label = status.replace(/_/g, " ");

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${style}`}>
      {label}
    </span>
  );
}
