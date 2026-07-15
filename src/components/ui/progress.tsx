import * as React from "react";
import { cn } from "@/lib/cn";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  label?: string;
};

export function Progress({ value, max = 100, className, label }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-sm text-slate-300">{label}</p> : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
