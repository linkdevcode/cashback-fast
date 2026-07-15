"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { formatRelativeTime } from "@/lib/links";
import { type BankAccount } from "@/lib/withdrawals";
import { Trash2 } from "lucide-react";
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

type SettingsWorkspaceProps = {
  profile: SettingsProfile | null;
  banks: BankAccount[];
  usingDemoBanks: boolean;
  usingDemoProfile: boolean;
};

export function SettingsWorkspace({
  profile,
  banks,
  usingDemoBanks,
  usingDemoProfile,
}: SettingsWorkspaceProps) {
  const router = useRouter();
  const [message, setMessage] = useState<MessageState>(null);
  const [loadingAction, setLoadingAction] = useState<"profile" | "bank" | `delete:${string}` | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    avatar_url: profile?.avatar_url || "",
  });
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_holder: "",
  });

  useEffect(() => {
    setProfileForm({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      avatar_url: profile?.avatar_url || "",
    });
  }, [profile]);

  const defaultBank = useMemo(
    () => banks.find((bank) => bank.is_default) || banks[0] || null,
    [banks]
  );

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
          title: "Không thêm được bank account",
          description: payload?.error || "Vui lòng kiểm tra thông tin ngân hàng.",
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
      setMessage({
        title: "Đã thêm bank account",
        description: "Danh sách ngân hàng đã được cập nhật.",
        variant: "success",
      });
      router.refresh();
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

      setMessage({
        title: "Đã xóa bank account",
        description: "Danh sách ngân hàng đã được làm mới.",
        variant: "success",
      });
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/[0.03]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={usingDemoProfile ? "warning" : "success"}>
              {usingDemoProfile ? "Demo profile" : "Live profile"}
            </Badge>
            <Badge variant={usingDemoBanks ? "warning" : "success"}>
              {usingDemoBanks ? "Demo banks" : "Live banks"}
            </Badge>
            <Badge variant="outline">Sprint 1.7</Badge>
          </div>
          <CardTitle className="mt-3 text-display text-3xl">Settings</CardTitle>
          <CardDescription>
            Cập nhật profile cá nhân, quản lý bank accounts và xem các liên kết pháp lý.
          </CardDescription>
        </CardHeader>
      </Card>

      {message ? <Toast title={message.title} description={message.description} variant={message.variant} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-display text-2xl">Profile</CardTitle>
            <CardDescription>Chỉnh sửa tên hiển thị, số điện thoại và avatar URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitProfile}>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Email
                </span>
                <Input value={profile?.email || ""} disabled />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Full name
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
                  Phone
                </span>
                <Input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="0901234567"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Avatar URL
                </span>
                <Input
                  value={profileForm.avatar_url}
                  onChange={(event) => setProfileForm((current) => ({ ...current, avatar_url: event.target.value }))}
                  placeholder="https://..."
                />
              </label>

              <Button type="submit" disabled={loadingAction === "profile"}>
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="text-display text-2xl">Account summary</CardTitle>
            <CardDescription>Thông tin cơ bản và trạng thái profile hiện tại.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Referral code</p>
              <p className="mt-2 font-mono text-lg text-white">{profile?.referral_code || "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Joined</p>
              <p className="mt-2 text-sm text-white">
                {profile?.created_at ? formatRelativeTime(profile.created_at) : "N/A"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Default bank</p>
              <p className="mt-2 text-sm text-white">
                {defaultBank ? `${defaultBank.bank_name} · ${defaultBank.account_number}` : "No bank account"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-2xl">Bank accounts</CardTitle>
          <CardDescription>Thêm, xóa hoặc đổi bank mặc định cho withdrawal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]" onSubmit={submitBank}>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Bank name</span>
              <Input
                value={bankForm.bank_name}
                onChange={(event) => setBankForm((current) => ({ ...current, bank_name: event.target.value }))}
                placeholder="Vietcombank"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Bank code</span>
              <Input
                value={bankForm.bank_code}
                onChange={(event) => setBankForm((current) => ({ ...current, bank_code: event.target.value }))}
                placeholder="VCB"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Account number
              </span>
              <Input
                value={bankForm.account_number}
                onChange={(event) => setBankForm((current) => ({ ...current, account_number: event.target.value }))}
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
                onChange={(event) => setBankForm((current) => ({ ...current, account_holder: event.target.value }))}
                placeholder="Nguyễn Khắc Linh"
                required
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" disabled={loadingAction === "bank"}>
                Add bank
              </Button>
            </div>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {banks.map((bank) => (
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
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-2xl">Legal links</CardTitle>
          <CardDescription>Placeholder cho chính sách & điều khoản.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/privacy"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Terms of Service
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
