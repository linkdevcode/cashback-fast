"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toast } from "@/components/ui/toast";
import {
  formatWithdrawalAmount,
  getWithdrawalStatusMeta,
  MIN_WITHDRAWAL_AMOUNT,
  type BankAccount,
  type WithdrawalRecord,
  type WithdrawalSummary,
} from "@/lib/withdrawals";
import { formatRelativeTime } from "@/lib/links";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type WithdrawalsWorkspaceProps = {
  banks: BankAccount[];
  withdrawals: WithdrawalRecord[];
  summary: WithdrawalSummary;
  usingDemoData: boolean;
};

type MessageState =
  | { title: string; description?: string; variant: "success" | "error" }
  | null;

function getDisplayBank(bank?: BankAccount | null) {
  if (!bank) return "Unknown bank";
  return `${bank.bank_name} · ${bank.account_number}`;
}

export function WithdrawalsWorkspace({
  banks,
  withdrawals,
  summary,
  usingDemoData,
}: WithdrawalsWorkspaceProps) {
  const router = useRouter();
  const [message, setMessage] = useState<MessageState>(null);
  const [loadingAction, setLoadingAction] = useState<"bank" | "withdrawal" | `delete:${string}` | null>(null);
  const [selectedBankId, setSelectedBankId] = useState(banks.find((bank) => bank.is_default)?.id || banks[0]?.id || "");
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_holder: "",
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (!selectedBankId && banks.length > 0) {
      setSelectedBankId(banks.find((bank) => bank.is_default)?.id || banks[0].id);
    }
  }, [banks, selectedBankId]);

  const defaultBank = useMemo(
    () => banks.find((bank) => bank.id === selectedBankId) || banks.find((bank) => bank.is_default) || banks[0] || null,
    [banks, selectedBankId]
  );

  async function refreshAfterMutation(nextMessage: MessageState) {
    setMessage(nextMessage);
    router.refresh();
  }

  async function submitBank(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("bank");

    try {
      const response = await fetch("/api/v1/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bankForm,
          is_default: banks.length === 0,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessage({
          title: "Không tạo được bank account",
          description: payload?.error || "Vui lòng kiểm tra lại thông tin nhập.",
          variant: "error",
        });
        return;
      }

      setBankForm({
        bank_name: "",
        bank_code: "",
        account_number: "",
        account_holder: "",
      });
      await refreshAfterMutation({
        title: "Đã thêm bank account",
        description: "Danh sách ngân hàng đã được cập nhật.",
        variant: "success",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function deleteBank(bankId: string) {
    setLoadingAction(`delete:${bankId}`);

    try {
      const response = await fetch(`/api/v1/banks/${bankId}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessage({
          title: "Không xóa được bank account",
          description: payload?.error || "Vui lòng thử lại.",
          variant: "error",
        });
        return;
      }

      if (selectedBankId === bankId) {
        setSelectedBankId(banks.find((bank) => bank.id !== bankId)?.id || "");
      }

      await refreshAfterMutation({
        title: "Đã xóa bank account",
        description: "Danh sách ngân hàng đã được làm mới.",
        variant: "success",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function submitWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("withdrawal");

    try {
      const response = await fetch("/api/v1/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account_id: selectedBankId,
          amount: Number(withdrawalForm.amount),
          notes: withdrawalForm.notes || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessage({
          title: "Không tạo được yêu cầu rút tiền",
          description: payload?.error || "Vui lòng kiểm tra số tiền và bank account.",
          variant: "error",
        });
        return;
      }

      setWithdrawalForm({ amount: "", notes: "" });
      await refreshAfterMutation({
        title: "Yêu cầu rút tiền đã được tạo",
        description: "Trạng thái mới sẽ xuất hiện trong lịch sử withdrawals.",
        variant: "success",
      });
    } finally {
      setLoadingAction(null);
    }
  }

  const amountValue = Number(withdrawalForm.amount || "0");
  const isAmountOverAvailable = amountValue > summary.availableBalance;
  const isAmountBelowMin = amountValue > 0 && amountValue < MIN_WITHDRAWAL_AMOUNT;

  return (
    <div className="space-y-6">
      <Card className="bg-white/[0.03]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={usingDemoData ? "warning" : "success"}>
              {usingDemoData ? "Demo data" : "Live data"}
            </Badge>
            <Badge variant="outline">Sprint 1.6</Badge>
          </div>
          <CardTitle className="mt-3 text-display text-3xl">Rút Tiền</CardTitle>
          <CardDescription>
            Quản lý bank account, tạo withdrawal request và theo dõi trạng thái xử lý.
          </CardDescription>
        </CardHeader>
      </Card>

      {message ? <Toast title={message.title} description={message.description} variant={message.variant} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Available balance</p>
            <p className="mt-2 text-3xl font-black text-white text-display">
              {formatWithdrawalAmount(summary.availableBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pending payout</p>
            <p className="mt-2 text-3xl font-black text-white text-display">
              {formatWithdrawalAmount(summary.pendingBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total withdrawn</p>
            <p className="mt-2 text-3xl font-black text-white text-display">
              {formatWithdrawalAmount(summary.withdrawnBalance)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-display text-2xl">Bank accounts</CardTitle>
              <CardDescription>Thêm hoặc xóa tài khoản ngân hàng để nhận tiền rút.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-4" onSubmit={submitBank}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Bank name
                    </span>
                    <Input
                      value={bankForm.bank_name}
                      onChange={(event) => setBankForm((current) => ({ ...current, bank_name: event.target.value }))}
                      placeholder="Vietcombank"
                      required
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Bank code
                    </span>
                    <Input
                      value={bankForm.bank_code}
                      onChange={(event) => setBankForm((current) => ({ ...current, bank_code: event.target.value }))}
                      placeholder="VCB"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Account number
                    </span>
                    <Input
                      value={bankForm.account_number}
                      onChange={(event) =>
                        setBankForm((current) => ({ ...current, account_number: event.target.value }))
                      }
                      placeholder="0123456789"
                      required
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Account holder
                    </span>
                    <Input
                      value={bankForm.account_holder}
                      onChange={(event) =>
                        setBankForm((current) => ({ ...current, account_holder: event.target.value }))
                      }
                      placeholder="Nguyễn Khắc Linh"
                      required
                    />
                  </label>
                </div>

                <Button type="submit" disabled={loadingAction === "bank"}>
                  Add bank account
                </Button>
              </form>

              <div className="space-y-3">
                {banks.length > 0 ? (
                  banks.map((bank) => (
                    <div key={bank.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">{bank.bank_name}</p>
                            {bank.is_default ? <Badge variant="success">Default</Badge> : null}
                          </div>
                          <p className="text-sm text-slate-400">
                            {bank.account_number} · {bank.account_holder}
                          </p>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{bank.bank_code}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteBank(bank.id)}
                          disabled={loadingAction === `delete:${bank.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08]"
                          aria-label={`Delete ${bank.bank_name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                    Chưa có bank account nào.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-display text-2xl">Withdrawal request</CardTitle>
              <CardDescription>
                Min {formatWithdrawalAmount(MIN_WITHDRAWAL_AMOUNT)} · Max {formatWithdrawalAmount(summary.availableBalance)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitWithdrawal}>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Select bank
                  </span>
                  <Select value={selectedBankId} onChange={(event) => setSelectedBankId(event.target.value)}>
                    <option value="">Choose a bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bank_name} · {bank.account_number}
                      </option>
                    ))}
                  </Select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Amount (VND)
                  </span>
                  <Input
                    type="number"
                    min={MIN_WITHDRAWAL_AMOUNT}
                    step="1"
                    value={withdrawalForm.amount}
                    onChange={(event) => setWithdrawalForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="50000"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    {isAmountBelowMin
                      ? "Số tiền rút tối thiểu là 50.000đ."
                      : isAmountOverAvailable
                        ? "Số tiền vượt quá số dư khả dụng."
                        : "Số tiền sẽ được giữ ở trạng thái pending sau khi gửi yêu cầu."}
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Notes
                  </span>
                  <Input
                    value={withdrawalForm.notes}
                    onChange={(event) => setWithdrawalForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Optional note for admin"
                  />
                </label>

                <Button
                  type="submit"
                  disabled={
                    loadingAction === "withdrawal" ||
                    !selectedBankId ||
                    summary.availableBalance < MIN_WITHDRAWAL_AMOUNT
                  }
                >
                  Create withdrawal request
                </Button>
              </form>

              {defaultBank ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-300">
                  Bank mặc định hiện tại: <span className="font-semibold text-white">{getDisplayBank(defaultBank)}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/[0.03]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-display text-2xl">Withdrawal history</CardTitle>
                <CardDescription>Trạng thái xử lý của các yêu cầu rút tiền gần nhất.</CardDescription>
              </div>
              <Badge variant="outline">{withdrawals.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => {
                  const statusMeta = getWithdrawalStatusMeta(withdrawal.status);

                  return (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-white">{formatWithdrawalAmount(withdrawal.amount)}</p>
                          <p className="text-xs text-slate-500">Net {formatWithdrawalAmount(withdrawal.net_amount)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-white">{getDisplayBank(withdrawal.bank)}</p>
                          <p className="text-xs text-slate-500">{withdrawal.notes || "No notes"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-300">
                        {formatRelativeTime(withdrawal.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
