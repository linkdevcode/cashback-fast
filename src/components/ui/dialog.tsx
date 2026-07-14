import * as React from "react";
import { cn } from "@/lib/cn";

type DialogProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
};

export function Dialog({ open = true, className, children, ...props }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-glass animate-slide-in-up",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold text-white", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-2 text-sm text-slate-400", className)} {...props} />;
}
