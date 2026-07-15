import { EarningsDashboardPanel } from "@/components/features/dashboard/earnings-dashboard-panel";
import { buildEarningsHistoryByRange, buildPlatformBreakdown, buildRecentActivity, calculateEarningsSummary } from "@/lib/earnings";
import { getEarningsUserAndSupabase, loadEarningsOrders } from "@/lib/earnings-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { supabase, user } = await getEarningsUserAndSupabase();

  if (!user) {
    redirect("/login?redirect=/app/dashboard");
  }

  const { orders } = await loadEarningsOrders(supabase, user.id);
  const summary = calculateEarningsSummary(orders);
  const historyByRange = buildEarningsHistoryByRange(orders);
  const platforms = buildPlatformBreakdown(orders);
  const recentActivity = buildRecentActivity(orders);

  return (
    <EarningsDashboardPanel
      summary={summary}
      historyByRange={historyByRange}
      platforms={platforms}
      recentActivity={recentActivity}
    />
  );
}
