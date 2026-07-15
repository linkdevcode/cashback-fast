import { describe, expect, it } from "vitest";
import {
  buildEarningsHistory,
  buildEarningsHistoryByRange,
  buildEarningsSnapshot,
  buildPlatformBreakdown,
  buildRecentActivity,
  calculateEarningsSummary,
} from "./earnings";
import { DEMO_ORDERS } from "./orders";

describe("earnings helpers", () => {
  it("calculates summary from orders", () => {
    expect(calculateEarningsSummary(DEMO_ORDERS)).toEqual({
      available: 62160,
      pending: 29280,
      totalEarned: 62160,
      approvedCount: 2,
      paidCount: 1,
      pendingCount: 2,
      rejectedCount: 1,
    });
  });

  it("builds chart history for supported ranges", () => {
    const historyByRange = buildEarningsHistoryByRange(DEMO_ORDERS);

    expect(historyByRange[7]).toHaveLength(7);
    expect(historyByRange[30]).toHaveLength(30);
    expect(historyByRange[90]).toHaveLength(90);
    expect(buildEarningsHistory(DEMO_ORDERS, 7)[0]).toHaveProperty("label");
  });

  it("builds platform breakdown sorted by earnings", () => {
    const breakdown = buildPlatformBreakdown(DEMO_ORDERS);

    expect(breakdown[0]?.code).toBe("tiktok");
    expect(Math.round(breakdown.reduce((sum, item) => sum + item.share, 0))).toBe(100);
  });

  it("builds recent activity sorted by recency", () => {
    const recent = buildRecentActivity(DEMO_ORDERS);

    expect(recent).toHaveLength(5);
    expect(recent[0]?.orderId).toBe("SHOPEE-20260715-001");
  });

  it("falls back to demo orders when there is no live data", () => {
    expect(buildEarningsSnapshot([])).toEqual({
      orders: DEMO_ORDERS,
      usingDemoData: true,
    });
  });
});
