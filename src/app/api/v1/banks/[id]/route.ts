import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { z } from "zod";

const updateBankSchema = z.object({
  bank_name: z.string().min(2, "Bank name is required"),
  bank_code: z.string().min(2, "Bank code is required"),
  account_number: z.string().min(6, "Account number is required"),
  account_holder: z.string().min(2, "Account holder is required"),
  otp_code: z.string().min(6).optional(),
});

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

export async function PUT(request: Request, { params }: RouteParams) {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateBankSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: bank, error: bankError } = await supabase
    .from("bank_accounts")
    .select("id")
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (bankError) {
    return NextResponse.json({ success: false, error: "Failed to fetch bank account" }, { status: 500 });
  }

  if (!bank) {
    return NextResponse.json({ success: false, error: "Bank account not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("bank_accounts")
    .update({
      bank_name: parsed.data.bank_name,
      bank_code: parsed.data.bank_code,
      account_number: parsed.data.account_number,
      account_holder: parsed.data.account_holder,
    })
    .eq("user_id", user.id)
    .eq("id", params.id)
    .select("id, user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Failed to update bank account" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
