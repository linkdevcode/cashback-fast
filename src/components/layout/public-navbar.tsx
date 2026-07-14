import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const navItems = [
  { label: "Bảo chứng tin cậy", href: "#trust-section" },
  { label: "Đối tác", href: "#partner-section" },
  { label: "Cách hoạt động", href: "#how-it-works" },
];

export function PublicNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="glass-panel-heavy mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 text-sm font-black text-white shadow-glow">
            HT
          </div>
          <div>
            <p className="text-sm font-bold text-white">Hoàn Tiền Pro</p>
            <p className="text-xs text-slate-400">Cashback affiliate platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex">
            Supabase Auth
          </Badge>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-emerald-500 px-4 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02]"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}
