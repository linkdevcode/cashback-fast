import Link from "next/link";

const navItems = [
  { label: "Bảo chứng tin cậy", href: "#trust-section" },
  { label: "Đối tác", href: "#partner-section" },
  { label: "Cách hoạt động", href: "#how-it-works" },
];

function CashbackLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <defs>
        <linearGradient id="cashback-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="rgba(15,23,42,0.92)" stroke="rgba(255,255,255,0.12)" />
      <path
        d="M12 21.5c2.8-4.9 8.2-7.4 13.7-6.1l1.7.4m1 0-1.2-3.7M28 15l-3.7 1.2"
        fill="none"
        stroke="url(#cashback-logo-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path
        d="M28.1 18.2A8.6 8.6 0 0 1 21 28.8m-1.8 0h-1.6"
        fill="none"
        stroke="url(#cashback-logo-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path
        d="M24.2 25.4c-1.8 1.2-4.4 1.4-6.2.6-2.1-.9-3.4-3-3.2-5.3.2-2.2 1.7-4 3.8-4.9"
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function PublicNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="glass-panel-heavy mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <CashbackLogo />
          <div>
            <p className="text-sm font-bold text-white">Hoàn Tiền Pro</p>
            <p className="text-xs text-slate-400">Nền tảng hoàn tiền</p>
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
