import { NextResponse } from "next/server";
import { buildEarningsHistoryByRange, buildPlatformBreakdown, buildRecentActivity, calculateEarningsSummary } from "@/lib/earnings";
import { getEarningsUserAndSupabase, loadEarningsOrders } from "@/lib/earnings-server";

export async function GET() {
  const { supabase, user } = await getEarningsUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { orders, usingDemoData } = await loadEarningsOrders(supabase, user.id);

  return NextResponse.json({
    success: true,
    data: {
      summary: calculateEarningsSummary(orders),
      historyByRange: buildEarningsHistoryByRange(orders),
      platforms: buildPlatformBreakdown(orders),
      recentActivity: buildRecentActivity(orders),
      usingDemoData,
    },
  });
}
