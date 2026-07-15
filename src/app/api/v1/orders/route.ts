import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";

function endOfDay(dateValue: string) {
  const date = new Date(dateValue);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

async function getUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

async function fetchPlatformMap(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase.from("platforms").select("id, name, code");
  return new Map((data ?? []).map((item) => [item.id, { name: item.name, code: item.code }]));
}

export async function GET(request: Request) {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
  const platform = searchParams.get("platform") || "";
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const platformMap = await fetchPlatformMap(supabase);

  let query = supabase
    .from("orders")
    .select(
      "id, user_id, affiliate_link_id, platform_id, order_id_external, order_value, commission_total, user_commission, platform_commission, status, click_time, conversion_time, audit_date, created_at, updated_at",
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (platform) {
    const { data: platformRow } = await supabase
      .from("platforms")
      .select("id")
      .eq("code", platform)
      .maybeSingle();

    if (platformRow) {
      query = query.eq("platform_id", platformRow.id);
    } else {
      return NextResponse.json({ success: true, data: [], meta: { page, limit, total: 0, hasMore: false } });
    }
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (q) {
    query = query.ilike("order_id_external", `%${q}%`);
  }

  if (from) {
    query = query.gte("created_at", from);
  }

  if (to) {
    query = query.lte("created_at", endOfDay(to));
  }

  const { data: rows, error, count } = await query.range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }

  const orders = (rows ?? []).map((row) => ({
    ...row,
    platform: platformMap.get(row.platform_id) ?? {
      code: row.platform_id,
      name: row.platform_id,
    },
  }));

  return NextResponse.json({
    success: true,
    data: orders,
    meta: {
      page,
      limit,
      total: count ?? 0,
      hasMore: (count ?? 0) > page * limit,
    },
  });
}
