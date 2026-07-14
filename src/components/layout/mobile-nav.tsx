"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";

type MobileNavItem = {
  label: string;
  href: string;
};

const defaultMobileItems: MobileNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Links", href: "/app/links" },
];

export function MobileNav({ items = defaultMobileItems }: { items?: MobileNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-colors",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "border-violet-500/20 bg-violet-500/15 text-white"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
