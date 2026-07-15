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

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: bank, error: bankError } = await supabase
    .from("bank_accounts")
    .select("id, is_default")
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (bankError) {
    return NextResponse.json({ success: false, error: "Failed to fetch bank account" }, { status: 500 });
  }

  if (!bank) {
    return NextResponse.json({ success: false, error: "Bank account not found" }, { status: 404 });
  }

  const { error } = await supabase.from("bank_accounts").delete().eq("user_id", user.id).eq("id", params.id);

  if (error) {
    return NextResponse.json({ success: false, error: "Failed to delete bank account" }, { status: 500 });
  }

  if (bank.is_default) {
    const { data: remainingBanks } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (remainingBanks && remainingBanks.length > 0) {
      await supabase
        .from("bank_accounts")
        .update({ is_default: true })
        .eq("user_id", user.id)
        .eq("id", remainingBanks[0].id);
    }
  }

  return NextResponse.json({ success: true });
}
