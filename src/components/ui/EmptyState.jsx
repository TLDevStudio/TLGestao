export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-paper-dim/50 px-6 py-14 text-center">
      {Icon && (
        <div className="rounded-full bg-surface p-3 shadow-sm">
          <Icon size={22} className="text-ink-soft" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="text-sm text-ink-soft max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
