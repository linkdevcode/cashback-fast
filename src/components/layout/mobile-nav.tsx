import Link from "next/link";

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
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs font-semibold text-slate-300 transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
