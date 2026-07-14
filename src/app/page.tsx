import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, BadgeCheck, Banknote, Link2, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Tạo link", value: "< 2s" },
  { label: "Đối soát", value: "< 10 phút" },
  { label: "Uptime", value: "99.5%" },
];

const highlights = [
  {
    title: "Cashback affiliate",
    description: "Chia sẻ hoa hồng linh hoạt giữa nền tảng và người dùng.",
    icon: BadgeCheck,
  },
  {
    title: "Link tracking",
    description: "Theo dõi link, đơn hàng và trạng thái conversion rõ ràng.",
    icon: Link2,
  },
  {
    title: "Rút tiền an toàn",
    description: "Quản lý tài khoản ngân hàng và luồng rút tiền có kiểm soát.",
    icon: Banknote,
  },
  {
    title: "Bảo mật & RLS",
    description: "Thiết kế theo Supabase Auth + RLS để khóa dữ liệu theo user.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_22%)]" />

      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20 lg:px-10">
        <div className="glass-panel-heavy relative overflow-hidden p-6 md:p-10">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-glow-purple blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-glow-green blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                Cashback platform
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Kiếm tiền hoàn tiền với giao diện{" "}
                  <span className="gradient-text">dark glassmorphism</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Nền tảng cashback affiliate cho phép tạo link nhanh, theo dõi đơn hàng,
                  quản lý thu nhập và rút tiền trên một workspace rõ ràng, hiện đại.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg">
                  Bắt đầu xây dựng
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="secondary" size="lg">
                  Xem mockup
                </Button>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <Card key={item.label} className="bg-white/[0.03]">
                    <CardContent className="px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="relative">
              <CardHeader>
                <CardTitle>Workspace preview</CardTitle>
                <CardDescription>
                  Khối dashboard đầu tiên để kiểm tra style, spacing và cảm giác sản phẩm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
