export default function Switch({
    checked,
    onChange,
    label,
    disabled,
    "aria-label": ariaLabel,
}) {
    return (
        <label
            className={`inline-flex items-center gap-2.5 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label ? undefined : ariaLabel}
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                className={`relative inline-block h-6 min-h-0! w-11 shrink-0 rounded-full transition-colors duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-700/40 focus-visible:ring-offset-2
                    ${checked ? "bg-pine-800" : "bg-ink-soft/30"}`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow
                        transition-transform duration-200
                        ${checked ? "translate-x-5" : "translate-x-0"}`}
                />
            </button>
            {label && <span className="text-sm text-ink">{label}</span>}
        </label>
    );
}