import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const AgroInput = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-[52px] w-full rounded-md border bg-[color:var(--bg-tertiary)] px-4 text-[15px] text-foreground",
            "placeholder:text-[color:var(--text-tertiary)]",
            "border-[color:var(--border-accent)]",
            "focus:outline-none focus:border-[color:var(--accent-green)] focus:ring-2 focus:ring-[color:var(--accent-green)]/30",
            "transition-colors",
            error && "border-[color:var(--accent-red)]",
            className,
          )}
          {...rest}
        />
        {(hint || error) && (
          <span
            className={cn(
              "text-[13px]",
              error ? "text-[color:var(--accent-red)]" : "text-[color:var(--text-secondary)]",
            )}
          >
            {error ?? hint}
          </span>
        )}
      </div>
    );
  },
);
AgroInput.displayName = "AgroInput";
