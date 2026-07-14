import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder:text-slate-500 shadow-sm outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
