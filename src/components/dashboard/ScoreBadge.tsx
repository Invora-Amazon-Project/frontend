interface ScoreBadgeProps {
  score: number;
  label: string;
}

function getStyle(score: number) {
  if (score >= 80) return { bg: "bg-mint-bg text-mint border border-mint/30", stroke: "text-mint" };
  if (score >= 60) return { bg: "bg-primary-light text-primary border border-primary/30", stroke: "text-primary" };
  if (score >= 40) return { bg: "bg-peach-bg text-peach border border-peach/30", stroke: "text-peach" };
  return { bg: "bg-rose-bg text-rose border border-rose/30", stroke: "text-rose" };
}

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const { bg, stroke } = getStyle(score);
  const filled = CIRCUMFERENCE * (score / 100);

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bg}`}>
      <span className={`relative inline-flex items-center justify-center ${stroke}`}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle
            cx="14"
            cy="14"
            r={RADIUS}
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2.5"
          />
          <circle
            cx="14"
            cy="14"
            r={RADIUS}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE / 4}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-bold leading-none">{score}</span>
      </span>
      <span className="text-xs leading-none">{label}</span>
    </span>
  );
}
