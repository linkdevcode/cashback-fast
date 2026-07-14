import * as React from "react";
import { cn } from "@/lib/cn";

export function Tabs({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  active = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-violet-500/20 text-white" : "text-slate-400 hover:text-white",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-fade-in", className)} {...props} />;
}
