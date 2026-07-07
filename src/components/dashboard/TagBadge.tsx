const TAG_STYLES: Record<string, string> = {
  high_roi: "bg-mint-bg text-mint",
  strong_margin: "bg-mint-bg text-mint",
  low_competition: "bg-primary-light text-primary",
  good_reorder_candidate: "bg-primary-light text-primary",
  amazon_active: "bg-rose-bg text-rose",
  price_drop_risk: "bg-rose-bg text-rose",
  avoid: "bg-rose-bg text-rose",
  low_sales_volume: "bg-peach-bg text-peach",
  re_analyze_needed: "bg-peach-bg text-peach",
  watchlist_recommended: "bg-section-bg text-muted",
};

function formatTag(tag: string) {
  const spaced = tag.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default function TagBadge({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] ?? "bg-section-bg text-muted";

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${style}`}>
      {formatTag(tag)}
    </span>
  );
}
