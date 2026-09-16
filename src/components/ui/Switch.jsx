export default function Switch({ checked, onChange, label, disabled }) {
    return (
        <label
            className={`inline-flex items-center gap-2.5 ${disabled ? "opacity-50" : "cursor-pointer"}`}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-pine-800" : "bg-line"
                    }`}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"
                        }`}
                />
            </button>
            {label && <span className="text-sm text-ink">{label}</span>}
        </label>
    );
}
