"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatVnd, type OrderStatus } from "@/lib/orders";
import { EARNINGS_RANGES, type EarningsActivityItem, type EarningsHistoryPoint, type EarningsPlatformBreakdown, type EarningsRange } from "@/lib/earnings";
import { ExternalLink, PlusCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type EarningsSummary = {
  available: number;
  pending: number;
  totalEarned: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
};

type EarningsDashboardPanelProps = {
  summary: EarningsSummary;
  historyByRange: Record<EarningsRange, EarningsHistoryPoint[]>;
  platforms: EarningsPlatformBreakdown[];
  recentActivity: EarningsActivityItem[];
};

function getStatusTone(status: OrderStatus) {
  switch (status) {
    case "approved":
      return "success";
    case "paid":
      return "info";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "outline";
  }
}

function formatAxisTick(value: number) {
  return value === 0 ? "0" : `${Math.round(value / 1000)}k`;
}

function buildChartGeometry(points: EarningsHistoryPoint[]) {
  const width = 720;
  const height = 280;
  const paddingTop = 18;
  const paddingRight = 18;
  const paddingBottom = 40;
  const paddingLeft = 58;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const maxTick = Math.max(10000, Math.ceil(maxValue / 10000) * 10000);
  const yTicks = Array.from({ length: maxTick / 10000 + 1 }, (_, index) => index * 10000);
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const coordinates = points.map((point, index) => {
    const x = paddingLeft + stepX * index;
    const y = paddingTop + innerHeight - (point.value / maxTick) * innerHeight;
    return { x, y };
  });

  const linePath = coordinates.length
    ? coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";
  const areaPath = coordinates.length
    ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${paddingTop + innerHeight} L ${coordinates[0].x} ${paddingTop + innerHeight} Z`
    : "";

  return {
    width,
    height,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    innerWidth,
    innerHeight,
    maxTick,
    yTicks,
    coordinates,
    linePath,
    areaPath,
  };
}

function EarningsChart({ points }: { points: EarningsHistoryPoint[] }) {
  const geometry = useMemo(() => buildChartGeometry(points), [points]);

  if (points.length === 0) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-400">
        Chưa có earnings để hiển thị.
      </div>
    );
  }

  const xLabelStep = Math.max(1, Math.ceil(points.length / 4));

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="h-[280px] w-full">
          {geometry.yTicks.map((tick) => {
            const y = geometry.paddingTop + geometry.innerHeight - (tick / geometry.maxTick) * geometry.innerHeight;
            return (
              <g key={tick}>
                <line
                  x1={geometry.paddingLeft}
                  x2={geometry.width - geometry.paddingRight}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <text
                  x={geometry.paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px]"
                >
                  {formatAxisTick(tick)}
                </text>
              </g>
            );
          })}

          {geometry.areaPath ? <path d={geometry.areaPath} fill="url(#earningsFill)" stroke="none" /> : null}
          {geometry.linePath ? (
            <path
              d={geometry.linePath}
              fill="none"
              stroke="url(#earningsStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {geometry.coordinates.map((point, index) => {
            const value = points[index]?.value || 0;
            const label = points[index]?.label || "";

            return (
              <g key={points[index]?.date || index}>
                <circle cx={point.x} cy={point.y} r="4.5" fill="#A855F7" stroke="#0F172A" strokeWidth="2">
                  <title>{`${label} · ${formatVnd(value)}`}</title>
                </circle>
              </g>
            );
          })}

          {points.map((point, index) =>
            index % xLabelStep === 0 || index === points.length - 1 ? (
              <text
                key={point.date}
                x={geometry.coordinates[index]?.x || geometry.paddingLeft}
                y={geometry.height - 12}
                textAnchor="middle"
                className="fill-slate-400 text-[11px]"
              >
                {point.label}
              </text>
            ) : null
          )}

          <defs>
            <linearGradient id="earningsStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient id="earningsFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export function EarningsDashboardPanel({
  summary,
  historyByRange,
  platforms,
  recentActivity,
}: EarningsDashboardPanelProps) {
  const [range, setRange] = useState<EarningsRange>(7);
  const points = historyByRange[range];

  const chartStats = useMemo(() => {
    const total = points.reduce((sum, point) => sum + point.value, 0);
    const bestDay = points.reduce<EarningsHistoryPoint | null>((best, point) => {
      if (!best || point.value > best.value) {
        return point;
      }
      return best;
    }, null);

    return {
      total,
      average: points.length > 0 ? total / points.length : 0,
      bestDay,
    };
  }, [points]);

  return (
    <div className="space-y-6">

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Số dư khả dụng</p>
            <p className="mt-2 text-3xl font-black text-white text-display">{formatVnd(summary.available)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Chờ đối soát</p>
            <p className="mt-2 text-3xl font-black text-white text-display">{formatVnd(summary.pending)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardContent className="px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tổng thu nhập</p>
            <p className="mt-2 text-3xl font-black text-white text-display">{formatVnd(summary.totalEarned)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="bg-white/[0.03]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-display text-2xl">Biểu đồ thu nhập</CardTitle>
                <CardDescription>Biểu đồ doanh thu theo ngày, chuyển đổi giữa 7 / 30 / 90 ngày.</CardDescription>
              </div>
              <Tabs>
                <TabsList>
                  {EARNINGS_RANGES.map((item) => (
                    <TabsTrigger key={item} active={range === item} onClick={() => setRange(item)}>
                      {item} ngày
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <EarningsChart points={points} />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tổng thu nhập</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatVnd(chartStats.total)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Trung bình mỗi ngày</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatVnd(chartStats.average)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ngày tốt nhất</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {chartStats.bestDay
                    ? `${chartStats.bestDay.label} · ${formatVnd(chartStats.bestDay.value)}`
                    : "Không có"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-display text-2xl">Nền tảng hiệu quả nhất</CardTitle>
              <CardDescription>Phân bổ thu nhập từ các nền tảng đang đóng góp nhiều nhất.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platforms.length > 0 ? (
                platforms.map((platform) => (
                  <div key={platform.code} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{platform.name}</p>
                        <p className="text-xs text-slate-400">{platform.orderCount} đơn đã đối soát</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{formatVnd(platform.amount)}</p>
                        <p className="text-xs text-slate-400">{platform.share.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                        style={{ width: `${Math.max(8, platform.share)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                  Chưa có platform nào đóng góp earnings.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-display text-2xl">Hoạt động gần đây</CardTitle>
              <CardDescription>Những thay đổi thu nhập gần nhất trong tài khoản.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{item.orderId}</p>
                        <p className="text-sm text-slate-400">{item.description}</p>
                      </div>
                      <Badge variant={getStatusTone(item.status)}>{item.statusLabel}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <p className="text-slate-300">{item.platform.name}</p>
                      <p className="font-semibold text-white">{formatVnd(item.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                  Chưa có activity nào gần đây.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-2xl">Thao tác nhanh</CardTitle>
          <CardDescription>Đi nhanh tới flow tạo link, kiểm tra đơn hoặc chuẩn bị rút tiền.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/app/links"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-emerald-500 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-95"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo link
          </Link>
          <Link
            href="/app/orders"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Xem đơn hàng
          </Link>
          <Link
            href="/app/withdrawals"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.05]"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Rút tiền
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
