import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";

type PlatformOption = {
  code: string;
  name: string;
};

type OrdersToolbarProps = {
  platform?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  platformOptions: PlatformOption[];
};

export function OrdersToolbar({
  platform,
  status,
  q,
  from,
  to,
  platformOptions,
}: OrdersToolbarProps) {
  return (
    <form className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Search order
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Order ID, platform..."
            className="pl-9"
          />
        </div>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Platform
        </span>
        <Select name="platform" defaultValue={platform}>
          <option value="">All</option>
          {platformOptions.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Status
        </span>
        <Select name="status" defaultValue={status}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          From
        </span>
        <Input name="from" type="date" defaultValue={from} />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          To
        </span>
        <Input name="to" type="date" defaultValue={to} />
      </label>

      <div className="flex items-end gap-2">
        <Button type="submit">Filter</Button>
        <Link
          href="/app/orders"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
