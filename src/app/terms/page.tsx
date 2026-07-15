import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <Card className="w-full bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-3xl">Điều khoản sử dụng</CardTitle>
          <CardDescription>
            Trang placeholder cho điều khoản sử dụng trong giai đoạn MVP.
          </CardDescription>
        </CardHeader>
        <div className="px-5 pb-5">
          <Link
            href="/app/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Về ứng dụng
          </Link>
        </div>
      </Card>
    </main>
  );
}
