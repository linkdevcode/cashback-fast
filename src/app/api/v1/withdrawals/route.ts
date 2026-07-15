import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { DEMO_BANK_ACCOUNTS, MIN_WITHDRAWAL_AMOUNT } from "@/lib/withdrawals";
import { loadWithdrawalsDashboardData, getWithdrawalsUserAndSupabase } from "@/lib/withdrawals-server";

const createWithdrawalSchema = z.object({
  bank_account_id: z.string().min(1, "Bank account is required"),
  amount: z.coerce.number().int().positive("Withdrawal amount is required"),
  notes: z.string().optional(),
});

export async function GET() {
  const { supabase, user } = await getWithdrawalsUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = await loadWithdrawalsDashboardData(supabase, user.id);

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await getWithdrawalsUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const limitKey = `withdrawal:create:${user.id}`;
  const limited = rateLimit(limitKey, 5, 60 * 60 * 1000);

  if (!limited.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        meta: {
          remaining: limited.remaining,
          resetTime: limited.resetTime,
        },
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = createWithdrawalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await loadWithdrawalsDashboardData(supabase, user.id);
  const amount = Math.round(parsed.data.amount);

  if (amount < MIN_WITHDRAWAL_AMOUNT) {
    return NextResponse.json(
      { success: false, error: `Min withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT.toLocaleString("vi-VN")}đ` },
      { status: 400 }
    );
  }

  if (amount > data.summary.availableBalance) {
    return NextResponse.json(
      { success: false, error: "Amount exceeds available balance" },
      { status: 400 }
    );
  }

  const { data: bankAccount, error: bankError } = await supabase
    .from("bank_accounts")
    .select("id, bank_name, bank_code, account_number, account_holder, is_default")
    .eq("user_id", user.id)
    .eq("id", parsed.data.bank_account_id)
    .maybeSingle();

  if (bankError) {
    return NextResponse.json({ success: false, error: "Failed to validate bank account" }, { status: 500 });
  }

  let resolvedBankAccount = bankAccount;

  if (!resolvedBankAccount) {
    const demoBank = DEMO_BANK_ACCOUNTS.find((bank) => bank.id === parsed.data.bank_account_id);

    if (!demoBank) {
      return NextResponse.json({ success: false, error: "Bank account not found" }, { status: 404 });
    }

    const { data: existingBanks } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_id", user.id);

    const shouldBeDefault = (existingBanks?.length ?? 0) === 0;

    if (shouldBeDefault) {
      await supabase.from("bank_accounts").update({ is_default: false }).eq("user_id", user.id);
    }

    const { data: createdBank, error: createBankError } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        bank_name: demoBank.bank_name,
        bank_code: demoBank.bank_code,
        account_number: demoBank.account_number,
        account_holder: demoBank.account_holder,
        is_default: shouldBeDefault,
      })
      .select("id, bank_name, bank_code, account_number, account_holder, is_default")
      .single();

    if (createBankError || !createdBank) {
      return NextResponse.json({ success: false, error: "Failed to create bank account" }, { status: 500 });
    }

    resolvedBankAccount = createdBank;
  }

  const now = new Date().toISOString();
  const { data: withdrawal, error } = await supabase
    .from("withdrawals")
    .insert({
      user_id: user.id,
      bank_account_id: parsed.data.bank_account_id,
      amount,
      fee: 0,
      net_amount: amount,
      status: "pending",
      notes: parsed.data.notes || null,
      processed_at: null,
      created_at: now,
      updated_at: now,
    })
    .select("id, user_id, bank_account_id, amount, fee, net_amount, status, processed_at, notes, created_at, updated_at")
    .single();

  if (error || !withdrawal) {
    return NextResponse.json({ success: false, error: "Failed to create withdrawal request" }, { status: 500 });
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        ...withdrawal,
        bank:
          data.banks.find((bank) => bank.id === withdrawal.bank_account_id) ||
          resolvedBankAccount ||
          null,
      },
    },
    { status: 201 }
  );
}
