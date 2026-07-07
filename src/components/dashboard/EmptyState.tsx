import Link from "next/link";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-card-bg border border-border rounded-xl p-12 flex flex-col items-center text-center">
      <div className="bg-section-bg w-16 h-16 rounded-full flex items-center justify-center text-muted">
        {icon}
      </div>
      <h3 className="text-heading font-semibold text-base mt-4">{title}</h3>
      <p className="text-muted text-sm mt-1 max-w-xs">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
