import { createClient } from "@/lib/db/server";
import { DEMO_BANK_ACCOUNTS, DEMO_WITHDRAWALS, type BankAccount, type WithdrawalRecord, buildWithdrawalDashboardData } from "@/lib/withdrawals";
import { loadEarningsOrders } from "@/lib/earnings-server";

export async function getWithdrawalsUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

function mapBankRows(rows: Array<{
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
  is_default: boolean;
  created_at: string;
}>): BankAccount[] {
  return rows.map((row) => ({ ...row }));
}

function mapWithdrawalRows(rows: Array<{
  id: string;
  user_id: string;
  bank_account_id: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "rejected";
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}>): WithdrawalRecord[] {
  return rows.map((row) => ({ ...row }));
}

export async function loadWithdrawalsDashboardData(supabase: ReturnType<typeof createClient>, userId: string) {
  const [{ data: bankRows }, { data: withdrawalRows }, earningsResult] = await Promise.all([
    supabase
      .from("bank_accounts")
      .select("id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("withdrawals")
      .select("id, user_id, bank_account_id, amount, fee, net_amount, status, processed_at, notes, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    loadEarningsOrders(supabase, userId),
  ]);

  const banks = mapBankRows(bankRows ?? []);
  const withdrawals = mapWithdrawalRows(withdrawalRows ?? []);
  const data = buildWithdrawalDashboardData(earningsResult.orders, banks, withdrawals);

  return {
    ...data,
    usingDemoData: data.usingDemoData,
    demoBanks: banks.length === 0 ? DEMO_BANK_ACCOUNTS : [],
    demoWithdrawals: withdrawals.length === 0 ? DEMO_WITHDRAWALS : [],
  };
}
