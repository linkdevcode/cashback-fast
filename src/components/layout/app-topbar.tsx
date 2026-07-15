"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserMenu } from "./user-menu";
import { usePathname } from "next/navigation";

type AppTopbarProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  title?: string;
  onMenuClick?: () => void;
};

export function AppTopbar({
  name,
  email,
  avatarUrl,
  title = "Tổng quan",
  onMenuClick,
}: AppTopbarProps) {
  const pathname = usePathname();

  const derivedTitle = (() => {
    if (pathname.startsWith("/app/dashboard")) return "Tổng quan";
    if (pathname.startsWith("/app/links")) return "Tạo Link";
    if (pathname.startsWith("/app/orders")) return "Đơn Hàng";
    if (pathname.startsWith("/app/withdrawals")) return "Rút Tiền";
    if (pathname.startsWith("/app/referrals")) return "Mời bạn bè";
    if (pathname.startsWith("/app/claims")) return "Hỗ trợ & khiếu nại";
    if (pathname.startsWith("/app/settings")) return "Cài đặt";
    return title;
  })();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onMenuClick}
              aria-label="Mở menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white md:text-2xl text-display">
                {derivedTitle}
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">Xin chào, {name}</p>
          </div>
        </div>

        <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
