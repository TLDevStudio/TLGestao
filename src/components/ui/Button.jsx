import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-pine-900 text-white hover:bg-pine-800 active:bg-pine-950 disabled:bg-pine-900/40",
  amber:
    "bg-amber-500 text-pine-950 hover:bg-amber-600 active:bg-amber-600 disabled:bg-amber-500/40",
  outline:
    "border border-line bg-surface text-ink hover:bg-paper-dim active:bg-line disabled:opacity-50",
  ghost:
    "text-ink hover:bg-paper-dim active:bg-line disabled:opacity-50",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:bg-danger disabled:bg-danger/40",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-5 py-3 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
}
