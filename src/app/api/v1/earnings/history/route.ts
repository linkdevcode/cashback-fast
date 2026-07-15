import { NextResponse } from "next/server";
import { EARNINGS_RANGES, buildEarningsHistory } from "@/lib/earnings";
import { getEarningsUserAndSupabase, loadEarningsOrders } from "@/lib/earnings-server";

export async function GET(request: Request) {
  const { supabase, user } = await getEarningsUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rangeValue = Number(searchParams.get("range") || "7");
  const range = EARNINGS_RANGES.includes(rangeValue as (typeof EARNINGS_RANGES)[number])
    ? (rangeValue as (typeof EARNINGS_RANGES)[number])
    : 7;

  const { orders, usingDemoData } = await loadEarningsOrders(supabase, user.id);

  return NextResponse.json({
    success: true,
    data: {
      range,
      points: buildEarningsHistory(orders, range),
      usingDemoData,
    },
  });
}
