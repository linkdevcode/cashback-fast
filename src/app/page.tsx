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
    title: "Ưu tiên bảo mật",
    description: "Supabase Auth + RLS + HTTP-only cookies.",
    icon: ShieldCheck,
  },
  {
    title: "Dòng tiền realtime",
    description: "Theo dõi thu nhập, chờ đối soát và rút tiền rõ ràng.",
    icon: CircleDollarSign,
  },
  {
    title: "Quy trình nhanh",
    description: "Tạo Link, sao chép, chia sẻ và theo dõi chuyển đổi nhanh.",
    icon: Workflow,
  },
];

const partners = [
  { name: "Shopee", hint: "Sàn thương mại điện tử", accent: "from-orange-500/30 to-rose-500/10" },
  { name: "Lazada", hint: "Sàn thương mại điện tử", accent: "from-sky-500/30 to-blue-500/10" },
  { name: "TikTok Shop", hint: "Mua sắm xã hội", accent: "from-fuchsia-500/30 to-violet-500/10" },
  { name: "Tiki", hint: "Sàn thương mại điện tử", accent: "from-emerald-500/30 to-cyan-500/10" },
];

const steps = [
  {
    title: "1. Dán link sản phẩm",
    description: "Người dùng dán Link từ Shopee, Lazada, TikTok Shop hoặc Tiki vào trình tạo thử.",
    icon: MousePointerClick,
  },
  {
    title: "2. Hệ thống tạo Link tiếp thị",
    description: "Link được nhận diện nền tảng, gắn theo dõi rồi rút gọn thành URL ngắn.",
    icon: BadgeCheck,
  },
  {
    title: "3. Kiếm & rút tiền",
    description: "Kết quả đổ về tổng quan, hoa hồng được phân bổ và user rút tiền về ngân hàng.",
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
                <Badge variant="outline">Nền tảng hoàn tiền</Badge>
                <Badge variant="success">Đăng nhập Google</Badge>
                <Badge variant="outline">Glassmorphism tối</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl text-display">
                  Kiếm tiền hoàn tiền với giao diện đẹp mắt và dễ sử dụng
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Hoàn Tiền Pro là nền tảng tiếp thị hoàn tiền cho phép tạo Link nhanh, theo dõi đơn
                  hàng, quản lý thu nhập và rút tiền trên một khu làm việc tối ưu cho mobile lẫn desktop.
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
              Hỗ trợ các nền tảng tiếp thị phổ biến
            </h2>
          </div>
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
