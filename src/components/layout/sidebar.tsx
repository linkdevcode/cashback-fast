import Link from "next/link";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
};

const defaultNavItems: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", active: true },
  { label: "Tạo Link", href: "/app/links" },
  { label: "Đơn Hàng", href: "/app/orders" },
  { label: "Rút Tiền", href: "/app/withdrawals" },
  { label: "Giới Thiệu", href: "/app/referrals" },
  { label: "Khiếu Nại", href: "/app/claims" },
  { label: "Settings", href: "/app/settings" },
];

export function Sidebar({ items = defaultNavItems }: { items?: NavItem[] }) {
  return (
    <aside className="hidden w-72 border-r border-white/5 bg-slate-950/60 p-5 backdrop-blur-xl md:flex md:flex-col">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
          Hoàn Tiền Pro
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">Workspace</h2>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
              item.active
                ? "bg-violet-500/15 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <span>{item.label}</span>
            {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
