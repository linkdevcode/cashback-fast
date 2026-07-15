import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/server";
import { DEMO_BANK_ACCOUNTS } from "@/lib/withdrawals";

const createBankSchema = z.object({
  bank_name: z.string().min(2, "Bank name is required"),
  bank_code: z.string().min(2, "Bank code is required"),
  account_number: z.string().min(6, "Account number is required"),
  account_holder: z.string().min(2, "Account holder is required"),
  is_default: z.boolean().optional(),
});

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

  const { data, error } = await supabase
    .from("bank_accounts")
    .select("id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bank accounts" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data && data.length > 0 ? data : DEMO_BANK_ACCOUNTS,
    meta: {
      usingDemoData: !data || data.length === 0,
    },
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createBankSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { bank_name, bank_code, account_number, account_holder, is_default } = parsed.data;
  const { data: existingBanks, error: existingError } = await supabase
    .from("bank_accounts")
    .select("id")
    .eq("user_id", user.id);

  if (existingError) {
    return NextResponse.json({ success: false, error: "Failed to check existing bank accounts" }, { status: 500 });
  }

  const shouldBeDefault = is_default ?? (existingBanks?.length ?? 0) === 0;

  if (shouldBeDefault) {
    await supabase.from("bank_accounts").update({ is_default: false }).eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert({
      user_id: user.id,
      bank_name,
      bank_code,
      account_number,
      account_holder,
      is_default: shouldBeDefault,
    })
    .select("id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Failed to create bank account" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
