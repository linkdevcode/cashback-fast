import { createClient } from "@/lib/db/server";
import { DEMO_BANK_ACCOUNTS } from "@/lib/withdrawals";

export async function getSettingsUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

export async function loadSettingsData(supabase: ReturnType<typeof createClient>, userId: string) {
  const [profileResult, bankResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("bank_accounts")
      .select("id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  const banks = bankResult.data && bankResult.data.length > 0 ? bankResult.data : DEMO_BANK_ACCOUNTS;

  return {
    profile,
    banks,
    usingDemoBanks: !bankResult.data || bankResult.data.length === 0,
    usingDemoProfile: !profile,
  };
}
