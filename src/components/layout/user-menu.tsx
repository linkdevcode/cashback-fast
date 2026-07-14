"use client";

import { cn } from "@/lib/cn";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type UserMenuProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ name, email, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition-colors hover:bg-white/[0.07]"
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 text-sm font-black text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials || <UserCircle2 className="h-5 w-5" />
          )}
        </div>

        <div className="hidden min-w-0 flex-col sm:flex">
          <span className="truncate text-sm font-semibold text-white">{name}</span>
          <span className="truncate text-xs text-slate-400">{email}</span>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-glass backdrop-blur-xl">
          <div className="rounded-xl bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="mt-1 text-xs text-slate-400">{email}</p>
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/app/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <UserCircle2 className="h-4 w-4" />
              Hồ sơ & cài đặt
            </Link>
            <Link
              href="/logout"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
