import { OrdersTable } from "@/components/features/orders/orders-table";
import { OrdersToolbar } from "@/components/features/orders/orders-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/db/server";
import {
  DEMO_ORDERS,
  calculateOrderStats,
  filterOrders,
  formatVnd,
  paginateOrders,
  type OrderRecord,
} from "@/lib/orders";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";

type SearchParams = {
  platform?: string;
  status?: string;
  q?: string;
  page?: string;
  from?: string;
  to?: string;
};

function buildPlatformOptions(platformRows: Array<{ code: string; name: string }>) {
  return platformRows.length > 0
    ? platformRows
    : Array.from(new Map(DEMO_ORDERS.map((order) => [order.platform.code, order.platform])).values());
}

function buildPageLink(base: URL, params: SearchParams, page: number) {
  const url = new URL(base);
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      nextParams.set(key, value);
    }
  });

  nextParams.set("page", String(page));
  url.search = nextParams.toString();
  return `${url.pathname}${url.search}`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirect=/app/orders");
  }

  const currentPage = Math.max(1, Number(searchParams?.page || "1"));
  const pageSize = 20;
  const filters = {
    platform: searchParams?.platform || "",
    status: searchParams?.status || "",
    q: searchParams?.q || "",
    from: searchParams?.from || "",
    to: searchParams?.to || "",
  };

  const [{ data: platformRows }, { data: orderRows }] = await Promise.all([
    supabase.from("platforms").select("id, code, name").eq("is_active", true).order("name"),
    supabase
      .from("orders")
      .select(
        "id, user_id, affiliate_link_id, platform_id, order_id_external, order_value, commission_total, user_commission, platform_commission, status, click_time, conversion_time, audit_date, created_at, updated_at"
      )
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const platformMap = new Map(
    (platformRows ?? []).map((platform) => [platform.id, { code: platform.code, name: platform.name }])
  );

  const platformOptions = buildPlatformOptions(platformRows ?? []);

  const mappedOrders: OrderRecord[] = (orderRows ?? []).map((order) => {
    const fallbackPlatform = DEMO_ORDERS.find((item) => item.platform_id === order.platform_id)?.platform;
    const platform = platformMap.get(order.platform_id) || fallbackPlatform || {
      code: order.platform_id,
      name: order.platform_id,
    };

    return {
      ...order,
      platform,
    };
  });

  const sourceOrders = mappedOrders.length > 0 ? mappedOrders : DEMO_ORDERS;
  const filteredOrders = filterOrders(sourceOrders, filters);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = paginateOrders(filteredOrders, currentPage, pageSize);
  const stats = calculateOrderStats(filteredOrders);
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const withdrawalGoal = 50000;
  const progressValue = Math.min(stats.available, withdrawalGoal);

  return (
    <div className="space-y-6">

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Số dư khả dụng</p>
            <p className="mt-2 text-3xl font-black text-white text-display">{formatVnd(stats.available)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Chờ đối soát</p>
            <p className="mt-2 text-3xl font-black text-white text-display">{formatVnd(stats.pending)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tổng thu nhập</p>
            <p className="mt-2 text-3xl font-black text-white text-display">{formatVnd(stats.totalEarned)}</p>
          </CardContent>
        </Card>
      </section>

      <OrdersToolbar
        platform={filters.platform}
        status={filters.status}
        q={filters.q}
        from={filters.from}
        to={filters.to}
        platformOptions={platformOptions}
      />

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-display text-2xl">Đơn hàng gần đây</CardTitle>
              <CardDescription>
                {filteredOrders.length} đơn hàng phù hợp với bộ lọc hiện tại.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleOrders.length > 0 ? (
            <OrdersTable orders={visibleOrders} origin={origin} />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm text-slate-400">
              Không có đơn hàng phù hợp. Hãy thử đổi bộ lọc hoặc tạo thêm dữ liệu từ webhook.
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Hiển thị {visibleOrders.length} / {filteredOrders.length} đơn.
            </p>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <a
                  href={buildPageLink(new URL(origin + "/app/orders"), filters, currentPage - 1)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Trước
                </a>
              ) : null}
              {currentPage < totalPages ? (
                <a
                  href={buildPageLink(new URL(origin + "/app/orders"), filters, currentPage + 1)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
                >
                  Sau
                </a>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
