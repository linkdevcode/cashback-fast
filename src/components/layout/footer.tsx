import Link from "next/link";

type FooterLink = {
  label: string;
  href: string;
};

const defaultFooterLinks: FooterLink[] = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Support", href: "#" },
];

export function Footer({ links = defaultFooterLinks }: { links?: FooterLink[] }) {
  return (
    <footer className="border-t border-white/5 bg-slate-950/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between lg:px-10">
        <p>© 2026 Hoàn Tiền Pro. Cashback affiliate platform.</p>
        <div className="flex flex-wrap gap-4">
          {links.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
