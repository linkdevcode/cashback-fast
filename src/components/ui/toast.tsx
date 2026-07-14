import { cn } from "@/lib/cn";

type ToastVariant = "default" | "success" | "error";

export function Toast({
  title,
  description,
  variant = "default",
  className,
}: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  className?: string;
}) {
  const variantClasses: Record<ToastVariant, string> = {
    default: "border-white/10 bg-slate-950/90",
    success: "border-emerald-500/20 bg-emerald-950/90",
    error: "border-rose-500/20 bg-rose-950/90",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-glass animate-slide-in-up",
        variantClasses[variant],
        className
      )}
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-300">{description}</p> : null}
    </div>
  );
}
