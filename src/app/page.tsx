import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { LinkConverterDemo } from "@/components/features/marketing/link-converter-demo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  MousePointerClick,
  ShieldCheck,
  Store,
  Workflow,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Tạo link", value: "< 2s" },
  { label: "Đối soát", value: "< 10 phút" },
  { label: "Uptime", value: "99.5%" },
];

const trustItems = [
  {
    title: "Security first",
    description: "Supabase Auth + RLS + HTTP-only cookies.",
    icon: ShieldCheck,
  },
  {
    title: "Realtime cashflow",
    description: "Theo dõi earning, pending và withdraw rõ ràng.",
    icon: CircleDollarSign,
  },
  {
    title: "Fast workflow",
    description: "Tạo link, copy, share và theo dõi conversion nhanh.",
    icon: Workflow,
  },
];

const partners = [
  { name: "Shopee", hint: "Marketplace", accent: "from-orange-500/30 to-rose-500/10" },
  { name: "Lazada", hint: "Marketplace", accent: "from-sky-500/30 to-blue-500/10" },
  { name: "TikTok Shop", hint: "Social commerce", accent: "from-fuchsia-500/30 to-violet-500/10" },
  { name: "Tiki", hint: "Marketplace", accent: "from-emerald-500/30 to-cyan-500/10" },
];

const steps = [
  {
    title: "1. Dán link sản phẩm",
    description: "Người dùng dán link từ Shopee, Lazada, TikTok Shop hoặc Tiki vào demo converter.",
    icon: MousePointerClick,
  },
  {
    title: "2. Hệ thống tạo affiliate link",
    description: "Link được nhận diện nền tảng, gắn tracking rồi rút gọn thành short URL.",
    icon: BadgeCheck,
  },
  {
    title: "3. Kiếm & rút tiền",
    description: "Conversion đổ về dashboard, hoa hồng được phân bổ và user rút tiền về bank.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <PublicNavbar />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_22%)]" />

      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        <div className="glass-panel-heavy relative overflow-hidden p-6 md:p-8">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-glow-purple blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-glow-green blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline">Cashback platform</Badge>
                <Badge variant="success">Supabase Auth</Badge>
                <Badge variant="outline">Dark glassmorphism</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl text-display">
                  Kiếm tiền hoàn tiền với giao diện{" "}
                  <span className="gradient-text">dark glassmorphism</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Hoàn Tiền Pro là nền tảng cashback affiliate cho phép tạo link nhanh, theo dõi đơn
                  hàng, quản lý thu nhập và rút tiền trên một workspace tối ưu cho mobile lẫn desktop.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-emerald-500 px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02]"
                >
                  Đăng nhập để bắt đầu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Xem cách hoạt động
                </Link>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                {stats.map((item) => (
                  <Card key={item.label} className="bg-white/[0.03]">
                    <CardContent className="px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white text-display">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="animate-slide-in-up">
              <LinkConverterDemo />
            </div>
          </div>
        </div>
      </section>

      <section id="trust-section" className="border-y border-white/5 bg-slate-950/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="bg-white/[0.03]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="partner-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              Partner platforms
            </p>
            <h2 className="mt-2 text-3xl font-black text-white text-display">
              Hỗ trợ các nền tảng affiliate phổ biến
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Mục tiêu giai đoạn đầu là tối ưu trải nghiệm cho các marketplace chính trước khi mở rộng thêm
            mạng lưới affiliate.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {partners.map((partner) => (
            <Card key={partner.name} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${partner.accent}`} />
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Store className="h-5 w-5 text-slate-200" />
                  </div>
                  <Badge variant="outline">{partner.hint}</Badge>
                </div>
                <CardTitle className="mt-4 text-xl text-display">{partner.name}</CardTitle>
                <CardDescription>
                  Tự động nhận diện URL, tạo tracking link và theo dõi conversion.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-950/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-black text-white text-display">
              Quy trình thật đơn giản cho người dùng cuối
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Landing page ưu tiên một CTA rõ ràng: đăng nhập, dán link, tạo cashback link và bắt đầu
              tracking.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <Card key={step.title} className="relative overflow-hidden bg-white/[0.03]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <Card className="relative overflow-hidden bg-white/[0.03]">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-glow-purple blur-3xl" />
          <CardContent className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                Ready to ship
              </p>
              <h3 className="mt-2 text-2xl font-black text-white text-display md:text-3xl">
                Một landing page sạch sẽ để bắt đầu thu hút user thật
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Sprint 1.1 tập trung vào trải nghiệm công khai: rõ ràng, sang, và đủ tốt để dẫn người dùng
                vào luồng đăng nhập Google.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
            >
              Đi tới đăng nhập
            </Link>
          </CardContent>
        </Card>
      </section>

      <Footer
        links={[
          { label: "Trust", href: "#trust-section" },
          { label: "Partners", href: "#partner-section" },
          { label: "How it works", href: "#how-it-works" },
        ]}
      />
    </main>
  );
}
