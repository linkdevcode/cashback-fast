import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/db/server";
import { DEMO_ORDERS, formatVnd, getOrderStatusMeta, type OrderRecord } from "@/lib/orders";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function OrderDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirect=/app/orders");
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, user_id, affiliate_link_id, platform_id, order_id_external, order_value, commission_total, user_commission, platform_commission, status, click_time, conversion_time, audit_date, created_at, updated_at"
    )
    .eq("user_id", data.user.id)
    .eq("id", params.id)
    .maybeSingle();

  const fallback = DEMO_ORDERS.find((item) => item.id === params.id);
  const resolvedOrder: OrderRecord | null = order
    ? {
        ...order,
        platform: fallback?.platform || {
          code: order.platform_id,
          name: order.platform_id,
        },
      }
    : fallback || null;

  if (!resolvedOrder) {
    notFound();
  }

  const statusMeta = getOrderStatusMeta(resolvedOrder.status);

  return (
    <div className="space-y-6">
      <Card className="bg-white/[0.03]">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Order detail
          </Badge>
          <CardTitle className="mt-3 text-display text-3xl">
            {resolvedOrder.order_id_external}
          </CardTitle>
          <CardDescription>
            Chi tiết giao dịch, giá trị đơn, commission và trạng thái xử lý.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Platform</p>
            <p className="mt-2 text-lg font-semibold text-white">{resolvedOrder.platform.name}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Order value</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatVnd(resolvedOrder.order_value)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">User commission</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatVnd(resolvedOrder.user_commission)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
            <div className="mt-2">
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-2xl">Tracking details</CardTitle>
          <CardDescription>Thông tin click, conversion và audit date.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Click time</p>
            <p className="mt-2 text-sm text-white">
              {resolvedOrder.click_time ? new Date(resolvedOrder.click_time).toLocaleString("vi-VN") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Conversion time</p>
            <p className="mt-2 text-sm text-white">
              {resolvedOrder.conversion_time
                ? new Date(resolvedOrder.conversion_time).toLocaleString("vi-VN")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Audit date</p>
            <p className="mt-2 text-sm text-white">
              {resolvedOrder.audit_date ? new Date(resolvedOrder.audit_date).toLocaleDateString("vi-VN") : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
