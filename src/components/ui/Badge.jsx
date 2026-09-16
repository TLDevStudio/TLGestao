const TONES = {
  neutral: "bg-paper-dim text-ink-soft",
  success: "bg-success-100 text-success",
  danger: "bg-danger-100 text-danger",
  amber: "bg-amber-100 text-amber-600",
  pine: "bg-pine-900/10 text-pine-800",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
