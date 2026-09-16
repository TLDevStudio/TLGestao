import { Loader2 } from "lucide-react";

export function Spinner({ size = 24, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-pine-800 ${className}`} />;
}

export function FullPageLoading({ label = "Carregando..." }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-paper">
      <Spinner size={28} />
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}
