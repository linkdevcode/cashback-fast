import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-violet-500/15 text-violet-200 border border-violet-500/20",
  success: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-200 border border-amber-500/20",
  danger: "bg-rose-500/15 text-rose-200 border border-rose-500/20",
  info: "bg-cyan-500/15 text-cyan-200 border border-cyan-500/20",
  outline: "bg-transparent text-slate-300 border border-white/10",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
