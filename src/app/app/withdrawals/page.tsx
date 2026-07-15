import { WithdrawalsWorkspace } from "@/components/features/withdrawals/withdrawals-workspace";
import { getWithdrawalsUserAndSupabase, loadWithdrawalsDashboardData } from "@/lib/withdrawals-server";
import { redirect } from "next/navigation";

export default async function WithdrawalsPage() {
  const { supabase, user } = await getWithdrawalsUserAndSupabase();

  if (!user) {
    redirect("/login?redirect=/app/withdrawals");
  }

  const { banks, withdrawals, summary, usingDemoData } = await loadWithdrawalsDashboardData(supabase, user.id);

  return (
    <WithdrawalsWorkspace
      banks={banks}
      withdrawals={withdrawals}
      summary={summary}
      usingDemoData={usingDemoData}
    />
  );
}
