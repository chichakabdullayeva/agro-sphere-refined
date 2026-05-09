import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "secondary";
type Size = "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[14px]",
  lg: "h-[52px] px-6 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-110",
  secondary:
    "bg-secondary text-foreground border border-[color:var(--border-accent)] hover:bg-[color:var(--bg-elevated)]",
  ghost:
    "text-foreground border border-[color:var(--border-accent)] hover:bg-secondary",
  danger:
    "bg-destructive text-destructive-foreground hover:brightness-110",
};

export const AgroButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "lg", fullWidth, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
      {...rest}
    />
  ),
);
AgroButton.displayName = "AgroButton";
