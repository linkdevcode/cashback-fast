import { LoginButton } from "@/components/features/auth/login-button";
import Link from "next/link";

type LoginPageProps = {
  searchParams?: {
    redirect?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = searchParams?.redirect || "/app/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="glass-panel-heavy w-full max-w-lg space-y-8 p-8 md:p-10">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
            Hoàn Tiền Pro
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Đăng nhập để tiếp tục
          </h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Bảo mật qua Supabase
            </p>
          </div>

          <div className="mt-6">
            <LoginButton nextPath={nextPath} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-white">
            Quay về trang chủ
          </Link>
          <Link href="/logout" className="transition-colors hover:text-white">
            Đăng xuất
          </Link>
        </div>
      </section>
    </main>
  );
}
