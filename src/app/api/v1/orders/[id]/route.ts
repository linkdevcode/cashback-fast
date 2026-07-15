import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";

async function getUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, affiliate_link_id, platform_id, order_id_external, order_value, commission_total, user_commission, platform_commission, status, click_time, conversion_time, audit_date, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }

  if (!order) {
    return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...order,
      platform: {
        code: order.platform_id,
        name: order.platform_id,
      },
    },
  });
}
