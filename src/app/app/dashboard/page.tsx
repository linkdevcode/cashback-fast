import { FeaturePlaceholder } from "@/components/features/app/feature-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickStats = [
  { label: "Available", value: "0đ" },
  { label: "Pending", value: "0đ" },
  { label: "Total Earned", value: "0đ" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {quickStats.map((item) => (
          <Card key={item.label} className="bg-white/[0.03]">
            <CardContent className="px-5 py-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-white text-display">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            App shell ready
          </Badge>
          <CardTitle className="mt-3 text-display text-2xl">Dashboard layout đã sẵn sàng</CardTitle>
          <CardDescription>
            Đây là shell ban đầu để kiểm tra sidebar, topbar, user menu và mobile navigation trước khi
            đi vào các feature thật của Sprint 1.3+.
          </CardDescription>
        </CardHeader>
      </Card>

      <FeaturePlaceholder
        title="Các trang chức năng sẽ được triển khai ở Sprint 1.3+"
        description="Links, Orders, Withdrawals, Referrals, Claims và Settings sẽ dùng chung app shell này."
      />
    </div>
  );
}
