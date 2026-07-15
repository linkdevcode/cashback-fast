"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { formatRelativeTime } from "@/lib/links";
import { type BankAccount } from "@/lib/withdrawals";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SettingsProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  referral_code: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
};

type MessageState =
  | { title: string; description?: string; variant: "success" | "error" }
  | null;

type BankFormState = {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
};

type BankDialogState = {
  mode: "create" | "edit" | "delete";
  bankId?: string;
  bankName?: string;
  form: BankFormState;
  otpCode: string;
  otpInput: string;
};

type SettingsWorkspaceProps = {
  profile: SettingsProfile | null;
  banks: BankAccount[];
};

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function SettingsWorkspace({ profile, banks }: SettingsWorkspaceProps) {
  const router = useRouter();
  const [message, setMessage] = useState<MessageState>(null);
  const [loadingAction, setLoadingAction] = useState<"profile" | "bank" | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    avatar_url: profile?.avatar_url || "",
  });
  const [bankDialog, setBankDialog] = useState<BankDialogState | null>(null);

  useEffect(() => {
    setProfileForm({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      avatar_url: profile?.avatar_url || "",
    });
  }, [profile]);

  const defaultBank = useMemo(() => banks.find((bank) => bank.is_default) || banks[0] || null, [banks]);

  function openCreateDialog() {
    setBankDialog({
      mode: "create",
      form: {
        bank_name: "",
        bank_code: "",
        account_number: "",
        account_holder: "",
      },
      otpCode: generateOtpCode(),
      otpInput: "",
    });
    setMessage({
      title: "Mã OTP đã được gửi tới email của bạn",
      description: "Nhập mã OTP để xác nhận thay đổi ngân hàng.",
      variant: "success",
    });
  }

  function openEditDialog(bank: BankAccount) {
    setBankDialog({
      mode: "edit",
      bankId: bank.id,
      bankName: bank.bank_name,
      form: {
        bank_name: bank.bank_name,
        bank_code: bank.bank_code,
        account_number: bank.account_number,
        account_holder: bank.account_holder,
      },
      otpCode: generateOtpCode(),
      otpInput: "",
    });
    setMessage({
      title: "Mã OTP đã được gửi tới email của bạn",
      description: "Nhập mã OTP để xác nhận chỉnh sửa ngân hàng.",
      variant: "success",
    });
  }

  function openDeleteDialog(bank: BankAccount) {
    setBankDialog({
      mode: "delete",
      bankId: bank.id,
      bankName: bank.bank_name,
      form: {
        bank_name: bank.bank_name,
        bank_code: bank.bank_code,
        account_number: bank.account_number,
        account_holder: bank.account_holder,
      },
      otpCode: generateOtpCode(),
      otpInput: "",
    });
    setMessage({
      title: "Mã OTP đã được gửi tới email của bạn",
      description: "Nhập mã OTP để xác nhận xóa ngân hàng.",
      variant: "success",
    });
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("profile");

    try {
      const response = await fetch("/api/v1/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profileForm.full_name,
          phone: profileForm.phone || null,
          avatar_url: profileForm.avatar_url || null,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessage({
          title: "Không lưu được hồ sơ",
          description: payload?.error || "Vui lòng kiểm tra lại dữ liệu nhập.",
          variant: "error",
        });
        return;
      }

      setMessage({
        title: "Đã cập nhật hồ sơ",
        description: "Thông tin profile đã được lưu.",
        variant: "success",
      });
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function submitBankDialog() {
    if (!bankDialog) return;

    if (bankDialog.otpInput !== bankDialog.otpCode) {
      setMessage({
        title: "OTP không chính xác",
        description: "Vui lòng kiểm tra lại mã OTP trong email.",
        variant: "error",
      });
      return;
    }

    setLoadingAction("bank");

    try {
      let response: Response;

      if (bankDialog.mode === "create") {
        response = await fetch("/api/v1/banks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bankDialog.form,
            is_default: banks.length === 0,
            otp_code: bankDialog.otpCode,
          }),
        });
      } else if (bankDialog.mode === "edit") {
        response = await fetch(`/api/v1/banks/${bankDialog.bankId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bankDialog.form,
            otp_code: bankDialog.otpCode,
          }),
        });
      } else {
        response = await fetch(`/api/v1/banks/${bankDialog.bankId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp_code: bankDialog.otpCode,
          }),
        });
      }

      const payload = await response.json();

      if (!response.ok) {
        setMessage({
          title: "Không thể cập nhật ngân hàng",
          description: payload?.error || "Vui lòng thử lại.",
          variant: "error",
        });
        return;
      }

      setMessage({
        title:
          bankDialog.mode === "delete"
            ? "Đã xóa bank account"
            : bankDialog.mode === "edit"
              ? "Đã cập nhật bank account"
              : "Đã thêm bank account",
        description: "Danh sách ngân hàng đã được làm mới.",
        variant: "success",
      });
      setBankDialog(null);
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">

      {message ? <Toast title={message.title} description={message.description} variant={message.variant} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-display text-2xl">Hồ sơ</CardTitle>
            <CardDescription>Chỉnh sửa tên hiển thị, số điện thoại và avatar URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitProfile}>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Email</span>
                <Input value={profile?.email || ""} disabled />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Tên hiển thị
                </span>
                <Input
                  value={profileForm.full_name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))}
                  placeholder="Nguyễn Khắc Linh"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Số điện thoại
                </span>
                <Input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="0901234567"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Avatar URL</span>
                <Input
                  value={profileForm.avatar_url}
                  onChange={(event) => setProfileForm((current) => ({ ...current, avatar_url: event.target.value }))}
                  placeholder="https://..."
                />
              </label>

              <Button type="submit" disabled={loadingAction === "profile"}>
                Lưu hồ sơ
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-display text-2xl">Tổng quan</CardTitle>
            <CardDescription>Thông tin cơ bản và trạng thái profile hiện tại.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mã giới thiệu</p>
              <p className="mt-2 font-mono text-lg text-white">{profile?.referral_code || "Không có"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tham gia từ</p>
              <p className="mt-2 text-sm text-white">
                {profile?.created_at ? formatRelativeTime(profile.created_at) : "Không có"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ngân hàng mặc định</p>
              <p className="mt-2 text-sm text-white">
                {defaultBank ? `${defaultBank.bank_name} · ${defaultBank.account_number}` : "Chưa có ngân hàng"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-display text-2xl">Ngân hàng</CardTitle>
              <CardDescription>Thêm, sửa hoặc xóa ngân hàng trước khi rút tiền.</CardDescription>
            </div>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm ngân hàng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {banks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {banks.map((bank) => (
                <div key={bank.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">{bank.bank_name}</p>
                        {bank.is_default ? <Badge variant="success">Mặc định</Badge> : null}
                      </div>
                      <p className="text-sm text-slate-400">
                        {bank.account_number} · {bank.account_holder}
                      </p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{bank.bank_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditDialog(bank)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08]"
                        aria-label={`Sửa ${bank.bank_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteDialog(bank)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08]"
                        aria-label={`Xóa ${bank.bank_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
              Chưa có ngân hàng nào. Hãy thêm ngân hàng đầu tiên để bắt đầu rút tiền.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-2xl">Liên kết pháp lý</CardTitle>
          <CardDescription>Placeholder cho chính sách quyền riêng tư và điều khoản.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/privacy"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Chính sách quyền riêng tư
          </Link>
          <Link
            href="/terms"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Điều khoản sử dụng
          </Link>
        </CardContent>
      </Card>

      <Dialog open={Boolean(bankDialog)} onClick={() => setBankDialog(null)}>
        {bankDialog ? (
          <DialogContent onClick={(event) => event.stopPropagation()} className="max-w-2xl">
            <DialogTitle>
              {bankDialog.mode === "create"
                ? "Thêm ngân hàng"
                : bankDialog.mode === "edit"
                  ? `Sửa ngân hàng${bankDialog.bankName ? ` · ${bankDialog.bankName}` : ""}`
                  : `Xóa ngân hàng${bankDialog.bankName ? ` · ${bankDialog.bankName}` : ""}`}
            </DialogTitle>
            <DialogDescription>
              Mã OTP đã được gửi đến email của bạn. Nhập OTP để xác nhận thay đổi.
            </DialogDescription>

            {bankDialog.mode !== "delete" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Tên ngân hàng
                  </span>
                  <Input
                    value={bankDialog.form.bank_name}
                    onChange={(event) =>
                      setBankDialog((current) =>
                        current
                          ? { ...current, form: { ...current.form, bank_name: event.target.value } }
                          : current
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Mã ngân hàng
                  </span>
                  <Input
                    value={bankDialog.form.bank_code}
                    onChange={(event) =>
                      setBankDialog((current) =>
                        current
                          ? { ...current, form: { ...current.form, bank_code: event.target.value } }
                          : current
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Số tài khoản
                  </span>
                  <Input
                    value={bankDialog.form.account_number}
                    onChange={(event) =>
                      setBankDialog((current) =>
                        current
                          ? { ...current, form: { ...current.form, account_number: event.target.value } }
                          : current
                      )
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Chủ tài khoản
                  </span>
                  <Input
                    value={bankDialog.form.account_holder}
                    onChange={(event) =>
                      setBankDialog((current) =>
                        current
                          ? { ...current, form: { ...current.form, account_holder: event.target.value } }
                          : current
                      )
                    }
                  />
                </label>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-300">
                Bạn sắp xóa ngân hàng <span className="font-semibold text-white">{bankDialog.bankName}</span>.
              </div>
            )}

            <div className="mt-6 space-y-2">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">OTP</span>
                <Input
                  value={bankDialog.otpInput}
                  onChange={(event) =>
                    setBankDialog((current) => (current ? { ...current, otpInput: event.target.value } : current))
                  }
                  placeholder="Nhập mã OTP 6 số"
                />
              </label>
              <p className="text-xs text-slate-500">Mã OTP thử nghiệm cho UI hiện tại: {bankDialog.otpCode}</p>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setBankDialog(null)}>
                Hủy
              </Button>
              <Button type="button" onClick={submitBankDialog} disabled={loadingAction === "bank"}>
                Xác nhận
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
