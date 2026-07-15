import { createClient } from "@/lib/db/server";
import { DEMO_ORDERS, type OrderRecord } from "@/lib/orders";

export async function getEarningsUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

export async function loadEarningsOrders(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const [{ data: platformRows }, { data: orderRows }] = await Promise.all([
    supabase.from("platforms").select("id, name, code").eq("is_active", true).order("name"),
    supabase
      .from("orders")
      .select(
        "id, user_id, affiliate_link_id, platform_id, order_id_external, order_value, commission_total, user_commission, platform_commission, status, click_time, conversion_time, audit_date, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const platformMap = new Map(
    (platformRows ?? []).map((platform) => [platform.id, { code: platform.code, name: platform.name }])
  );

  const orders: OrderRecord[] = (orderRows ?? []).map((order) => {
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

  const resolvedOrders = orders.length > 0 ? orders : DEMO_ORDERS;
  const platformOptions =
    (platformRows ?? []).length > 0
      ? (platformRows ?? [])
      : Array.from(new Map(DEMO_ORDERS.map((order) => [order.platform.code, order.platform])).values());

  return {
    orders: resolvedOrders,
    platformOptions,
    usingDemoData: orders.length === 0,
  };
}
