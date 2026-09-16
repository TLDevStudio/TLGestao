import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className = "", ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-xl border bg-surface px-3.5 py-2.5 pr-9 text-sm text-ink transition focus:outline-none focus:ring-2 focus:ring-pine-700/20 focus:border-pine-700 ${
            error ? "border-danger" : "border-line"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
        />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});

export default Select;
