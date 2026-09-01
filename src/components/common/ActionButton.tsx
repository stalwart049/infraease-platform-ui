import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type Variant = "primary" | "default" | "danger" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  variant?: Variant;
  loading?: boolean;
  /** hide the label below md */
  compactLabel?: boolean;
  children?: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground border border-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:border-primary/50",
  default:
    "bg-surface text-foreground border border-border hover:bg-muted disabled:text-muted-foreground",
  danger:
    "bg-surface text-destructive border border-border hover:bg-destructive/10 hover:border-destructive/40",
  ghost: "bg-transparent text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground",
};

export function ActionButton({
  icon,
  variant = "default",
  loading = false,
  compactLabel = false,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[3px] px-2.5 text-[13px] font-medium",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-70",
        styles[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="loader-circle" className="size-3.5 animate-spin" />
      ) : (
        icon && <Icon name={icon} className="size-3.5" />
      )}
      {children && <span className={cn(compactLabel && "hidden sm:inline")}>{children}</span>}
    </button>
  );
}
