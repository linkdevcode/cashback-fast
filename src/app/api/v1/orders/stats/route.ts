import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { calculateOrderStats } from "@/lib/orders";

async function getUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

export async function GET() {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, affiliate_link_id, platform_id, order_id_external, order_value, commission_total, user_commission, platform_commission, status, click_time, conversion_time, audit_date, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch order stats" },
      { status: 500 }
    );
  }

  const stats = calculateOrderStats(
    (rows ?? []).map((row) => ({
      ...row,
      platform: { code: row.platform_id, name: row.platform_id },
    }))
  );

  return NextResponse.json({ success: true, data: stats });
}
