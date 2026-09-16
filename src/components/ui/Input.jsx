import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = "", containerClassName = "", ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-ink" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 transition focus:outline-none focus:ring-2 focus:ring-pine-700/20 focus:border-pine-700 ${
            Icon ? "pl-10" : ""
          } ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-line"} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});

export default Input;
